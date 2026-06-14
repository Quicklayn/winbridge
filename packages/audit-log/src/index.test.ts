import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import type { AuditRecord } from "@winbridge/protocol";
import { ConsoleAuditSink, FileAuditSink, MemoryAuditSink } from "./index.js";

type MutableAuditRecord = {
  action: string;
  detail: Record<string, unknown>;
};

function mutableAuditRecord(record: AuditRecord): MutableAuditRecord {
  return record as unknown as MutableAuditRecord;
}

function mutableAuditRecords(records: readonly AuditRecord[]): AuditRecord[] {
  return records as AuditRecord[];
}

describe("MemoryAuditSink", () => {
  it("stores audit records in write order", () => {
    const sink = new MemoryAuditSink();

    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "first",
      outcome: "accepted"
    });
    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "second",
      outcome: "failed"
    });

    expect(sink.records().map((record) => record.action)).toEqual(["first", "second"]);
  });

  it("validates records before storing them", () => {
    const sink = new MemoryAuditSink();

    expect(() =>
      sink.write({
        actor: { type: "relay", id: "" },
        action: "invalid",
        outcome: "failed"
      })
    ).toThrow();
    expect(() =>
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "invalid",
        outcome: "failed",
        sessionId: "session with spaces"
      })
    ).toThrow();
    expect(sink.records()).toHaveLength(0);
  });

  it("redacts sensitive values before storing them", () => {
    const sink = new MemoryAuditSink();

    const record = sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.join.denied",
      outcome: "denied",
      detail: {
        token: "secret",
        pairingCode: "123-456",
        password: "secret",
        keystroke: "typed",
        screenData: "pixels",
        clipboardText: "copied",
        fileContent: "file",
        diagnosticDump: "diagnostics"
      }
    });

    expect(record.detail).toEqual({
      token: "[REDACTED]",
      pairingCode: "[REDACTED]",
      password: "[REDACTED]",
      keystroke: "[REDACTED]",
      screenData: "[REDACTED]",
      clipboardText: "[REDACTED]",
      fileContent: "[REDACTED]",
      diagnosticDump: "[REDACTED]"
    });
  });

  it("rejects secret-bearing actions before storing them", () => {
    const sink = new MemoryAuditSink();

    expect(() =>
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "sessionCookie raw-memory-cookie",
        outcome: "failed"
      })
    ).toThrow("Audit action must not contain sensitive metadata");
    expect(sink.records()).toHaveLength(0);
  });

  it("returns immutable audit records with immutable nested detail", () => {
    const sink = new MemoryAuditSink();

    const record = sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.join.accepted",
      outcome: "accepted",
      detail: {
        nested: {
          safe: "kept"
        },
        attempts: [{ remaining: 1 }]
      }
    });

    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record.actor)).toBe(true);
    expect(Object.isFrozen(record.detail)).toBe(true);
    expect(Object.isFrozen(record.detail.nested as object)).toBe(true);
    expect(Object.isFrozen(record.detail.attempts as object)).toBe(true);
    expect(Object.isFrozen((record.detail.attempts as Array<Record<string, unknown>>)[0])).toBe(true);
    expect(() => {
      mutableAuditRecord(record).action = "tampered";
    }).toThrow(TypeError);
    expect(() => {
      ((record.detail.nested as Record<string, unknown>).safe) = "tampered";
    }).toThrow(TypeError);
  });

  it("rejects non-JSON detail values before storing them", () => {
    const sink = new MemoryAuditSink();
    const symbolKeyDetail = { safe: "kept", [Symbol("hidden")]: "hidden" };
    const nonEnumerableDetail: Record<string, unknown> = { safe: "kept" };
    Object.defineProperty(nonEnumerableDetail, "hidden", {
      value: "hidden",
      enumerable: false
    });
    const sparseArrayDetail: Record<string, unknown> = { attempts: [] };
    (sparseArrayDetail.attempts as unknown[])[1] = "second";
    const invalidDetails: Array<Record<string, unknown>> = [
      { handler: () => "handled" },
      { marker: Symbol("marker") },
      { count: BigInt(1) },
      { omitted: undefined },
      { count: NaN },
      { count: Infinity },
      { count: -Infinity },
      { nested: { handler: () => "handled" } },
      { attempts: [undefined] },
      { token: () => "secret-token" },
      symbolKeyDetail,
      nonEnumerableDetail,
      sparseArrayDetail
    ];

    for (const detail of invalidDetails) {
      expect(() =>
        sink.write({
          actor: { type: "relay", id: "relay-dev" },
          action: "relay.peer.join.accepted",
          outcome: "accepted",
          detail: detail as never
        })
      ).toThrow("JSON-compatible");
    }
    expect(sink.records()).toHaveLength(0);
  });

  it("protects retained audit history from records view mutation attempts", () => {
    const sink = new MemoryAuditSink();
    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "first",
      outcome: "accepted",
      detail: {
        nested: {
          safe: "kept"
        }
      }
    });

    const records = sink.records();
    mutableAuditRecords(records).pop();
    const [record] = sink.records();

    expect(sink.records()).toHaveLength(1);
    try {
      if (record) {
        mutableAuditRecord(record).action = "tampered";
        ((record.detail.nested as Record<string, unknown>).safe) = "tampered";
      }
    } catch {
      // Frozen records throw in strict runtimes; silent no-op is also acceptable.
    }

    expect(sink.records()).toHaveLength(1);
    expect(sink.records()[0]).toMatchObject({
      action: "first",
      detail: {
        nested: {
          safe: "kept"
        }
      }
    });
  });
});

describe("ConsoleAuditSink", () => {
  it("writes one JSON line per record", () => {
    const lines: string[] = [];
    const sink = new ConsoleAuditSink((line) => lines.push(line));

    sink.write({
      actor: { type: "relay", id: "relay-dev" },
      action: "relay.peer.disconnect",
      outcome: "accepted",
      sessionId: "session-demo"
    });

    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0] ?? "{}")).toMatchObject({
      action: "relay.peer.disconnect",
      sessionId: "session-demo"
    });
  });

  it("writes JSON without inherited toJSON hooks", () => {
    const lines: string[] = [];
    const sink = new ConsoleAuditSink((line) => lines.push(line));

    withPrototypeToJsonHooks(() => {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.message.forwarded",
        outcome: "accepted",
        detail: {
          safe: "kept",
          attempts: [1]
        }
      });
    });

    expect(lines).toHaveLength(1);
    expect(lines[0]).not.toContain("raw-screen-content");
    expect(JSON.parse(lines[0] ?? "{}").detail).toEqual({
      safe: "kept",
      attempts: [1]
    });
  });
});

describe("FileAuditSink", () => {
  it("rejects malformed paths before writing records", () => {
    for (const path of [
      "",
      "   ",
      " logs/audit.jsonl",
      "logs/audit.jsonl ",
      "logs/audit\npath.jsonl",
      "logs/audit\u202epath.jsonl",
      "logs/audit\u200bpath.jsonl",
      "logs/audit\ufeffpath.jsonl",
      "x".repeat(1025)
    ]) {
      expect(() => new FileAuditSink(path)).toThrow(
        "Audit log path must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, contain no Windows reserved device path segments, contain no Windows alternate data stream path segments, and not use a Windows device namespace prefix"
      );
    }
  });

  it("rejects Windows reserved device paths before writing records", () => {
    for (const path of [
      "NUL",
      "nul",
      "CON.txt",
      "logs/NUL.jsonl",
      String.raw`logs\COM1.log`,
      String.raw`C:\audit\LPT1`,
      String.raw`\\.\NUL`,
      String.raw`\\?\C:\audit\CONOUT$.jsonl`,
      "logs/PRN..jsonl",
      "logs/AUX .jsonl"
    ]) {
      expect(() => new FileAuditSink(path)).toThrow(
        "Audit log path must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, contain no Windows reserved device path segments, contain no Windows alternate data stream path segments, and not use a Windows device namespace prefix"
      );
    }
  });

  it("rejects Windows device namespace paths before writing records", () => {
    for (const path of [
      String.raw`\\.\pipe\audit`,
      String.raw`\\?\C:\logs\audit.jsonl`,
      "//./pipe/audit",
      "//?/C:/logs/audit.jsonl"
    ]) {
      expect(() => new FileAuditSink(path)).toThrow("Windows device namespace prefix");
    }
  });

  it("rejects Windows alternate data stream paths before writing records", () => {
    for (const path of [
      "logs/audit.jsonl:hidden",
      String.raw`logs\audit.jsonl:hidden`,
      "audit.jsonl:$DATA",
      String.raw`C:\audit\events.jsonl:hidden`,
      "C:audit.jsonl"
    ]) {
      expect(() => new FileAuditSink(path)).toThrow("Windows alternate data stream path segments");
    }
  });

  it("rejects reserved device paths without exposing raw path text", () => {
    for (const path of [
      "logs/audit-private-marker/NUL.jsonl",
      String.raw`C:\audit-private-marker\COM1.log`
    ]) {
      try {
        new FileAuditSink(path);
        throw new Error("Expected audit log path to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain("audit-private-marker");
        expect((error as Error).message).not.toContain(path);
      }
    }
  });

  it("rejects alternate data stream paths without exposing raw path text", () => {
    for (const path of [
      "logs/audit-private-marker.jsonl:hidden",
      String.raw`C:\audit-private-marker\events.jsonl:hidden`
    ]) {
      try {
        new FileAuditSink(path);
        throw new Error("Expected audit log path to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain("audit-private-marker");
        expect((error as Error).message).not.toContain(path);
      }
    }
  });

  it("rejects device namespace paths without exposing raw path text", () => {
    for (const path of [
      String.raw`\\.\pipe\audit-private-marker`,
      String.raw`\\?\C:\audit-private-marker\events.jsonl`
    ]) {
      try {
        new FileAuditSink(path);
        throw new Error("Expected audit log path to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain("audit-private-marker");
        expect((error as Error).message).not.toContain(path);
      }
    }
  });

  it("accepts safe lookalike audit log paths", () => {
    for (const path of [
      "logs/null-audit.jsonl",
      "logs/com10.jsonl",
      "logs/lpt10.jsonl",
      "logs/conference.jsonl",
      "logs/prn-safe.jsonl",
      String.raw`C:\logs\audit.jsonl`,
      "D:/logs/audit.jsonl",
      String.raw`\\server\share\audit.jsonl`
    ]) {
      expect(() => new FileAuditSink(path)).not.toThrow();
    }
  });

  it("rejects invalid paths without exposing raw path text", () => {
    for (const path of [
      " logs/audit-private-marker.jsonl ",
      "logs/audit-private-marker\n.jsonl",
      "logs/audit-private-marker\u202e.jsonl",
      "logs/audit-private-marker\u200b.jsonl",
      "logs/audit-private-marker\ufeff.jsonl",
      `logs/${"audit-private-marker".repeat(58)}.jsonl`
    ]) {
      try {
        new FileAuditSink(path);
        throw new Error("Expected audit log path to be rejected");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).not.toContain("audit-private-marker");
        expect((error as Error).message).not.toContain(path);
      }
    }
  });

  it("writes JSONL records in write order and creates parent directories", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "nested", "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "first",
        outcome: "accepted"
      });
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "second",
        outcome: "failed"
      });

      const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
      expect(lines.map((line) => JSON.parse(line).action)).toEqual(["first", "second"]);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("rejects non-JSON detail values before appending JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const emptyPath = join(root, "empty", "audit.jsonl");
    const sink = new FileAuditSink(path);
    const emptySink = new FileAuditSink(emptyPath);

    try {
      expect(() =>
        emptySink.write({
          actor: { type: "relay", id: "relay-dev" },
          action: "invalid",
          outcome: "failed",
          detail: {
            handler: () => "handled"
          } as never
        })
      ).toThrow("JSON-compatible");
      expect(existsSync(emptyPath)).toBe(false);

      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "first",
        outcome: "accepted",
        detail: {
          safe: "kept"
        }
      });
      const before = readFileSync(path, "utf8");

      expect(() =>
        sink.write({
          actor: { type: "relay", id: "relay-dev" },
          action: "invalid",
          outcome: "failed",
          detail: {
            count: BigInt(1)
          } as never
        })
      ).toThrow("JSON-compatible");
      expect(readFileSync(path, "utf8")).toBe(before);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts sensitive values before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.token.denied",
        outcome: "denied",
        detail: {
          token: "secret-token",
          pairingCode: "123-456",
          credential: "secret-credential",
          keystroke: "typed",
          screenshot: "raw-screen",
          clipboardText: "raw-clipboard",
          fileContent: "raw-file",
          fileBytes: "raw-file-bytes",
          diagnosticDump: "raw-diagnostics"
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("secret-token");
      expect(content).not.toContain("123-456");
      expect(content).not.toContain("secret-credential");
      expect(content).not.toContain("typed");
      expect(content).not.toContain("raw-screen");
      expect(content).not.toContain("raw-clipboard");
      expect(content).not.toContain("raw-file");
      expect(content).not.toContain("raw-file-bytes");
      expect(content).not.toContain("raw-diagnostics");
      expect(JSON.parse(content).detail).toMatchObject({
        token: "[REDACTED]",
        pairingCode: "[REDACTED]",
        credential: "[REDACTED]",
        keystroke: "[REDACTED]",
        screenshot: "[REDACTED]",
        clipboardText: "[REDACTED]",
        fileContent: "[REDACTED]",
        fileBytes: "[REDACTED]",
        diagnosticDump: "[REDACTED]"
      });
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts keylogging detail fields before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.message.rejected",
        outcome: "failed",
        detail: {
          keylog: "raw-keylog",
          rawKeylog: "raw-keylog-marker",
          keyloggerOutput: "raw-keylogger-output",
          safeCounter: 2
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("raw-keylog");
      expect(content).not.toContain("raw-keylog-marker");
      expect(content).not.toContain("raw-keylogger-output");
      expect(JSON.parse(content).detail).toEqual({
        keylog: "[REDACTED]",
        rawKeylog: "[REDACTED]",
        keyloggerOutput: "[REDACTED]",
        safeCounter: 2
      });
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts sensitive top-level reasons before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.message.rejected",
        outcome: "failed",
        reason: "diagnostics: raw-diagnostic-dump",
        detail: {
          messageType: "signal"
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("raw-diagnostic-dump");
      expect(JSON.parse(content).reason).toBe("[REDACTED]");
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts keylogging top-level reasons before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.message.rejected",
        outcome: "failed",
        reason: "keyloggerOutput raw-keylogger-private-marker",
        detail: {
          messageType: "audit-event"
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("raw-keylogger-private-marker");
      expect(JSON.parse(content).reason).toBe("[REDACTED]");
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("rejects secret-bearing actions before console or file output", () => {
    const lines: string[] = [];
    const consoleSink = new ConsoleAuditSink((line) => lines.push(line));
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const fileSink = new FileAuditSink(path);

    try {
      for (const sink of [consoleSink, fileSink]) {
        expect(() =>
          sink.write({
            actor: { type: "relay", id: "relay-dev" },
            action: "setCookie=raw-sink-cookie",
            outcome: "failed"
          })
        ).toThrow("Audit action must not contain sensitive metadata");
      }

      expect(lines).toEqual([]);
      expect(existsSync(path)).toBe(false);
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts expanded authentication keys before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "relay", id: "relay-dev" },
        action: "relay.message.rejected",
        outcome: "failed",
        detail: {
          apiKey: "api-key-secret",
          authorization: "Bearer raw-token",
          authHeaderValue: "decorated-auth-header",
          rawAuthorizationHeader: "raw-authorization-header",
          proxyAuthorization: "proxy-authorization-secret",
          cookie: "sid=raw-cookie",
          privateKey: "raw-private-key",
          authorizationId: "authz-demo",
          nested: {
            authHeader: "Basic raw-secret"
          }
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("api-key-secret");
      expect(content).not.toContain("raw-token");
      expect(content).not.toContain("decorated-auth-header");
      expect(content).not.toContain("raw-authorization-header");
      expect(content).not.toContain("proxy-authorization-secret");
      expect(content).not.toContain("raw-cookie");
      expect(content).not.toContain("raw-private-key");
      expect(content).not.toContain("raw-secret");
      expect(JSON.parse(content).detail).toMatchObject({
        apiKey: "[REDACTED]",
        authorization: "[REDACTED]",
        authHeaderValue: "[REDACTED]",
        rawAuthorizationHeader: "[REDACTED]",
        proxyAuthorization: "[REDACTED]",
        cookie: "[REDACTED]",
        privateKey: "[REDACTED]",
        authorizationId: "authz-demo",
        nested: {
          authHeader: "[REDACTED]"
        }
      });
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("redacts display-name and private reason detail before writing JSONL records", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "audit.jsonl");
    const sink = new FileAuditSink(path);

    try {
      sink.write({
        actor: { type: "host", id: "host-1" },
        action: "agent-shell.authorization.denied",
        outcome: "denied",
        detail: {
          displayName: "Raw Host",
          viewerDisplayName: "Raw Viewer",
          reason: "private denial reason",
          reasonText: "private reason text",
          rawReason: "raw reason",
          reasonCode: "host-denied",
          reasonConfigured: true,
          authorizationId: "authz-demo"
        }
      });

      const content = readFileSync(path, "utf8");
      expect(content).not.toContain("Raw Host");
      expect(content).not.toContain("Raw Viewer");
      expect(content).not.toContain("private denial reason");
      expect(content).not.toContain("private reason text");
      expect(content).not.toContain("raw reason");
      expect(JSON.parse(content).detail).toEqual({
        displayName: "[REDACTED]",
        viewerDisplayName: "[REDACTED]",
        reason: "[REDACTED]",
        reasonText: "[REDACTED]",
        rawReason: "[REDACTED]",
        reasonCode: "host-denied",
        reasonConfigured: true,
        authorizationId: "authz-demo"
      });
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it("surfaces write failures", () => {
    const root = mkdtempSync(join(tmpdir(), "winbridge-audit-"));
    const path = join(root, "directory-target");
    const sink = new FileAuditSink(path);

    try {
      mkdirSync(path);
      expect(() =>
        sink.write({
          actor: { type: "relay", id: "relay-dev" },
          action: "will-fail",
          outcome: "failed"
        })
      ).toThrow();
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });
});

function withPrototypeToJsonHooks(callback: () => void): void {
  const objectToJson = Object.getOwnPropertyDescriptor(Object.prototype, "toJSON");
  const arrayToJson = Object.getOwnPropertyDescriptor(Array.prototype, "toJSON");
  Object.defineProperty(Object.prototype, "toJSON", {
    configurable: true,
    value: () => ({ screenContent: "raw-screen-content" })
  });
  Object.defineProperty(Array.prototype, "toJSON", {
    configurable: true,
    value: () => ["raw-screen-content"]
  });

  try {
    callback();
  } finally {
    restorePropertyDescriptor(Object.prototype, "toJSON", objectToJson);
    restorePropertyDescriptor(Array.prototype, "toJSON", arrayToJson);
  }
}

function restorePropertyDescriptor(
  target: object,
  key: string,
  descriptor: PropertyDescriptor | undefined
): void {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
    return;
  }

  delete (target as Record<string, unknown>)[key];
}
