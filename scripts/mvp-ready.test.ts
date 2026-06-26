import { describe, expect, it } from "vitest";
import {
  createMvpReadyPlan,
  formatMvpReadyError,
  formatMvpReadyJsonResult,
  formatMvpReadyResult,
  MvpReadyUsageError,
  parseEphemeralBrowserRoleFilteredCommandReadiness,
  parseCommandPlanReadiness,
  parseEphemeralCommandPlanReadiness,
  parseLanAgentRoleFilteredCommandReadiness,
  parseLanRelayRoleFilteredCommandReadiness,
  parseMvpReadyArgs,
  parseRoleFilteredCommandReadiness,
  parseSmokeReadiness,
  parseSmokeSubchecks,
  runMvpReadyCheck
} from "./mvp-ready.mjs";

const EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION =
  "Open the viewer local control surface URL printed by the viewer command log.";

describe("MVP ready helper", () => {
  it("parses bounded flag-only options", () => {
    expect(parseMvpReadyArgs([])).toEqual({
      help: false,
      json: false,
      includeSmoke: false
    });
    expect(parseMvpReadyArgs(["--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: true
    });
    expect(parseMvpReadyArgs(["--role", "host"])).toEqual({
      help: false,
      json: false,
      includeSmoke: false,
      role: "host"
    });
    expect(parseMvpReadyArgs(["--json", "--role", "viewer"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      role: "viewer"
    });
    expect(parseMvpReadyArgs(["--help"])).toEqual({ help: true });
  });

  it("rejects malformed options without echoing raw values", () => {
    let thrown: unknown;

    try {
      parseMvpReadyArgs(["--json", "raw-secret-token"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpReadyUsageError);
    expect(formatMvpReadyError(thrown)).not.toContain("raw-secret-token");
    expect(formatMvpReadyError(thrown, { json: true })).not.toContain("raw-secret-token");
    expect(() => parseMvpReadyArgs(["--json", "--json"])).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--include-smoke", "--include-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--help", "--json"])).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role"])).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "--json"])).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "raw-secret-token"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--role", "host", "--role", "viewer"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-smoke", "--role", "viewer"])).toThrow(
      MvpReadyUsageError
    );
  });

  it("builds the default readiness plan without smoke", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm" })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      { name: "command-plan", command: "npm", args: ["run", "mvp:commands", "--", "--json"] },
      {
        name: "ephemeral-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--viewer-control-surface-port",
          "0"
        ]
      },
      {
        name: "lan-command-plan",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--json", "--relay-host", "192.168.1.10"]
      },
      {
        name: "token-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      ...roleFilterPlanSteps()
    ]);
  });

  it("includes smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      { name: "command-plan", command: "npm", args: ["run", "mvp:commands", "--", "--json"] },
      {
        name: "ephemeral-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--viewer-control-surface-port",
          "0"
        ]
      },
      {
        name: "lan-command-plan",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--json", "--relay-host", "192.168.1.10"]
      },
      {
        name: "token-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      ...roleFilterPlanSteps(),
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      }
    ]);
  });

  it("builds role-scoped readiness plans without changing the default plan", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", role: "relay" })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      {
        name: "role-filter-relay-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "relay"]
      },
      {
        name: "lan-role-filter-relay-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "relay", "--relay-host", "192.168.1.10"]
      }
    ]);
    expect(createMvpReadyPlan({ npmCommand: "npm", role: "host" })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      {
        name: "role-filter-host-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "host"]
      },
      {
        name: "lan-role-filter-host-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "host", "--relay-host", "192.168.1.10"]
      }
    ]);
    expect(createMvpReadyPlan({ npmCommand: "npm", role: "viewer" })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      {
        name: "role-filter-viewer-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "viewer"]
      },
      {
        name: "lan-role-filter-viewer-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "viewer", "--relay-host", "192.168.1.10"]
      },
      {
        name: "role-filter-browser-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "browser"]
      },
      {
        name: "ephemeral-role-filter-browser-command",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "browser",
          "--viewer-control-surface-port",
          "0"
        ]
      }
    ]);
    expect(() => createMvpReadyPlan({ npmCommand: "npm", role: "unsafe" })).toThrow(
      MvpReadyUsageError
    );
  });

  it("reports default readiness success and marks smoke skipped", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      plan: createMvpReadyPlan({ npmCommand: "npm" }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(calls).toEqual(defaultReadyCheckNames());
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "native-preflight=ok",
        "command-plan=ok",
        "ephemeral-command-plan=ok",
        "lan-command-plan=ok",
        "token-command-plan=ok",
        "role-filter-relay-command=ok",
        "role-filter-host-command=ok",
        "role-filter-viewer-command=ok",
        "role-filter-browser-command=ok",
        "role-filter-preflight-command=ok",
        "ephemeral-role-filter-browser-command=ok",
        "smoke=skipped",
        "lan-smoke=skipped"
      ].join("\n")
    );
  });

  it("runs smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "smoke" || step.name === "lan-smoke"
          ? { ok: true, output: smokeOutput }
          : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "smoke", "lan-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("lan-smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("smoke.audit.host.records=5 accepted=5 denied=0 failed=0");
    expect(formatMvpReadyResult(result)).toContain("smoke.audit.coverage=authorizationApproved");
    expect(formatMvpReadyResult(result)).not.toContain("agent-shell");
  });

  it("reports role-scoped readiness success without smoke metadata", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      role: "viewer",
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      },
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "viewer" })
    });

    expect(calls).toEqual([
      "doctor",
      "native-preflight",
      "role-filter-viewer-command",
      "lan-role-filter-viewer-command",
      "role-filter-browser-command",
      "ephemeral-role-filter-browser-command"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-viewer-command", ok: true },
        { name: "lan-role-filter-viewer-command", ok: true },
        { name: "role-filter-browser-command", ok: true },
        { name: "ephemeral-role-filter-browser-command", ok: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "native-preflight=ok",
        "role-filter-viewer-command=ok",
        "lan-role-filter-viewer-command=ok",
        "role-filter-browser-command=ok",
        "ephemeral-role-filter-browser-command=ok"
      ].join("\n")
    );
    expect(formatMvpReadyResult(result)).not.toContain("smoke=skipped");
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
  });

  it("reports relay role-scoped LAN bind readiness success", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      role: "relay",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "relay" }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(calls).toEqual([
      "doctor",
      "role-filter-relay-command",
      "lan-role-filter-relay-command"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "role-filter-relay-command", ok: true },
        { name: "lan-role-filter-relay-command", ok: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "role-filter-relay-command=ok",
        "lan-role-filter-relay-command=ok"
      ].join("\n")
    );
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
  });

  it("reports host role-scoped LAN agent readiness success", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      role: "host",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "host" }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(calls).toEqual([
      "doctor",
      "native-preflight",
      "role-filter-host-command",
      "lan-role-filter-host-command"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-host-command", ok: true },
        { name: "lan-role-filter-host-command", ok: true }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
  });

  it("stops role-scoped readiness after the first failed check", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      role: "host",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "host" }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        return step.name === "native-preflight"
          ? { ok: false, reason: "exit-nonzero", output: "raw-secret-token" }
          : { ok: true };
      }
    });

    expect(calls).toEqual(["doctor", "native-preflight"]);
    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
  });

  it("fails closed when relay role-scoped LAN bind output drifts", () => {
    const result = runMvpReadyCheck({
      role: "relay",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "relay" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "lan-role-filter-relay-command") {
          return {
            ok: true,
            output: lanRelayRoleFilterOutput({ relayCommand: "npm run dev:relay" })
          };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "role-filter-relay-command", ok: true },
        { name: "lan-role-filter-relay-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
  });

  it("fails closed when host role-scoped LAN agent output drifts", () => {
    const result = runMvpReadyCheck({
      role: "host",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "host" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "lan-role-filter-host-command") {
          return { ok: true, output: roleFilterOutput("host") };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-host-command", ok: true },
        { name: "lan-role-filter-host-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
  });

  it("fails closed when viewer role-scoped ephemeral browser output drifts", () => {
    const result = runMvpReadyCheck({
      role: "viewer",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "viewer" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "ephemeral-role-filter-browser-command") {
          return {
            ok: true,
            output: roleFilterOutput("browser", {
              browserCommand: "Start-Process 'http://127.0.0.1:0/'"
            })
          };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-viewer-command", ok: true },
        { name: "lan-role-filter-viewer-command", ok: true },
        { name: "role-filter-browser-command", ok: true },
        { name: "ephemeral-role-filter-browser-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyJsonResult(result)).not.toContain("127.0.0.1");
  });

  it("stops after the first failed check with bounded reason metadata", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        return step.name === "native-preflight"
          ? { ok: false, reason: "exit-nonzero", output: "raw-secret-token" }
          : { ok: true };
      }
    });

    expect(calls).toEqual(["doctor", "native-preflight"]);
    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
  });

  it("fails closed when command-plan output is missing or malformed", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        return step.name === "command-plan"
          ? {
              ok: true,
              output:
                '{"ok":true,"mode":"session","nonExecuting":true,"commands":[{"name":"raw-secret-token","command":"npm run dev:agent -- --pairing 123-456"}]}'
            }
          : { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyResult(result)).not.toContain("123-456");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("123-456");
  });

  it("fails closed when ephemeral command-plan output drifts", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        return step.name === "ephemeral-command-plan"
          ? {
              ok: true,
              output: ephemeralCommandPlanOutput({
                browserCommand: "Start-Process 'http://127.0.0.1:0/'"
              })
            }
          : { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyResult(result)).not.toContain("Start-Process");
    expect(formatMvpReadyJsonResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyJsonResult(result)).not.toContain("Start-Process");
  });

  it("fails closed when LAN command-plan output does not target the LAN relay URL", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return {
            ok: true,
            output: commandPlanOutput({ relayUrl: "ws://localhost:8787/" })
          };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyResult(result)).not.toContain("123-456");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyJsonResult(result)).not.toContain("123-456");
  });

  it("fails closed when LAN command-plan output omits the reviewed relay bind", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return {
            ok: true,
            output: commandPlanOutput({
              relayUrl: "ws://192.168.1.10:8787/",
              relayBindHost: "127.0.0.1"
            })
          };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyJsonResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
  });

  it("fails closed when token command-plan output omits the expected token env", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WRONG_TOKEN_ENV" }) };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyResult(result)).not.toContain("WRONG_TOKEN_ENV");
    expect(formatMvpReadyResult(result)).not.toContain("123-456");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WRONG_TOKEN_ENV");
    expect(formatMvpReadyJsonResult(result)).not.toContain("123-456");
  });

  it("fails closed when role-filter command output is malformed or cross-target", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        if (step.name === "role-filter-host-command") {
          return {
            ok: true,
            output: `${roleFilterOutput("host")}\nviewer command:\nnpm run dev:agent -- viewer --pairing '123-456'`
          };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "role-filter-relay-command", ok: true },
        { name: "role-filter-host-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("npm run dev:agent");
    expect(formatMvpReadyResult(result)).not.toContain("123-456");
    expect(formatMvpReadyJsonResult(result)).not.toContain("npm run dev:agent");
    expect(formatMvpReadyJsonResult(result)).not.toContain("123-456");
  });

  it("fails closed when ephemeral browser role-filter output drifts", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        if (step.name === "ephemeral-role-filter-browser-command") {
          return {
            ok: true,
            output: roleFilterOutput("browser", {
              browserCommand: "Start-Process 'http://127.0.0.1:0/'"
            })
          };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterTargets().map((target) => ({
          name: `role-filter-${target}-command`,
          ok: true
        })),
        { name: "ephemeral-role-filter-browser-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyResult(result)).not.toContain("Start-Process");
    expect(formatMvpReadyJsonResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyJsonResult(result)).not.toContain("Start-Process");
  });

  it("fails closed when included smoke output is missing or malformed", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "smoke"
          ? { ok: true, output: '{"ok":true,"checks":[{"name":"raw-secret-token","ok":true}]}' }
          : { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
  });

  it("propagates bounded included smoke failure subchecks without raw child output", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "ephemeral-command-plan") {
          return { ok: true, output: ephemeralCommandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: [
                "raw-secret-token",
                JSON.stringify({
                  ok: false,
                  reason: "signal-not-ready",
                  checks: smokeFailureSubchecks()
                })
              ].join("\n")
            }
          : { ok: true };
      }
    });

    expect(result).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: false, reason: "exit-nonzero", checks: smokeFailureSubchecks() }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("smoke.signal=failed");
    expect(formatMvpReadyResult(result)).toContain("smoke.input=skipped");
    expect(JSON.parse(formatMvpReadyJsonResult(result))).toEqual({
      ok: false,
      reason: "exit-nonzero",
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: false, checks: smokeFailureSubchecks(), reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("signal-not-ready");
  });

  it("parses only fixed bounded smoke subchecks", () => {
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          artifactDir: "C:\\Temp\\raw-secret-token"
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        [
          "> winbridge@0.1.0 mvp:smoke",
          "> npm run build && node scripts/mvp-session-smoke.mjs --json",
          JSON.stringify({
            ok: true,
            checks: smokeSubchecks(),
            auditSummary: smokeAuditSummary(),
            artifacts: "cleaned"
          })
        ].join("\n")
      )
    ).toEqual(smokeSubchecks());
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          auditSummary: smokeAuditSummary(),
          artifacts: "cleaned"
        })
      )
    ).toEqual({ ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() });
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          artifacts: "retained",
          artifactDir: "C:\\Temp\\raw-secret-token"
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          command: "npm run mvp:smoke -- --json",
          token: "raw-secret-token"
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          artifacts: "cleaned",
          auditSummary: {
            ...smokeAuditSummary(),
            path: "C:\\Temp\\raw-secret-token"
          }
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          artifacts: "cleaned",
          auditSummary: {
            host: {
              ...smokeAuditSummary().host,
              action: "agent-shell.authorization.active"
            },
            viewer: smokeAuditSummary().viewer
          }
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks(),
          artifacts: "cleaned",
          auditSummary: {
            host: { ...smokeAuditSummary().host, records: 1, accepted: 1, denied: 1 },
            viewer: smokeAuditSummary().viewer
          }
        })
      )
    ).toBeUndefined();

    expect(parseSmokeSubchecks('{"ok":true,"checks":[{"name":"relay","ok":true}]}')).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks().filter((check) => check.name !== "viewer-disconnect")
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: [...smokeSubchecks(), { name: "relay", ok: true }]
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: [...smokeSubchecks(), { name: "viewer-disconnect", ok: true }]
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks().map((check) =>
            check.name === "input"
              ? { ...check, command: "key-down KeyA shift,control", token: "raw-secret-token" }
              : check
          )
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks().map((check) =>
            check.name === "viewer-disconnect"
              ? { ...check, surfaceUrl: "http://127.0.0.1:1/", token: "raw-secret-token" }
              : check
          )
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeSubchecks(
        JSON.stringify({
          ok: true,
          checks: smokeSubchecks().map((check) =>
            check.name === "audit" ? { ...check, ok: false } : check
          )
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "signal-not-ready",
          checks: smokeFailureSubchecks(),
          stderr: "raw-secret-token"
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "signal-not-ready",
          checks: smokeFailureSubchecks()
        })
      )
    ).toEqual({ ok: false, checks: smokeFailureSubchecks() });
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "signal-not-ready",
          checks: [...smokeFailureSubchecks(), { name: "relay", ok: false }]
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "signal-not-ready",
          checks: smokeFailureSubchecks().map((check) =>
            check.name === "signal" ? { ...check, skipped: false } : check
          )
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "signal-not-ready",
          checks: smokeSubchecks()
        })
      )
    ).toBeUndefined();
    expect(
      parseSmokeReadiness(
        JSON.stringify({
          ok: false,
          reason: "input-not-ready",
          checks: smokeFailureSubchecks().map((check) =>
            check.name === "input"
              ? { ...check, command: "pointer-move 0.5 0.5", surfaceUrl: "http://127.0.0.1:1/" }
              : check
          )
        })
      )
    ).toBeUndefined();
  });

  it("parses only fixed bounded command-plan readiness metadata", () => {
    expect(parseCommandPlanReadiness(commandPlanOutput())).toBe(true);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }), {
        expectedRelayUrl: "ws://192.168.1.10:8787/",
        expectedRelayBindHost: "0.0.0.0"
      })
    ).toBe(true);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/", relayBindHost: "127.0.0.1" }),
        {
          expectedRelayUrl: "ws://192.168.1.10:8787/",
          expectedRelayBindHost: "0.0.0.0"
        }
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/", relayBindHost: null }),
        {
          expectedRelayUrl: "ws://192.168.1.10:8787/",
          expectedRelayBindHost: "0.0.0.0"
        }
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ relayUrl: "ws://localhost:8787/" }), {
        expectedRelayUrl: "ws://192.168.1.10:8787/"
      })
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }), {
        expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
      })
    ).toBe(true);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ tokenEnv: "WRONG_TOKEN_ENV" }), {
        expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
      })
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput(), {
        expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
      })
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        [
          "> winbridge@0.1.0 mvp:commands",
          "> node scripts/mvp-session-commands.mjs --json",
          commandPlanOutput()
        ].join("\n")
      )
    ).toBe(true);
    expect(
      parseCommandPlanReadiness('{"ok":true,"mode":"preflight","nonExecuting":true,"commands":[]}')
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ok: true,
          mode: "session",
          nonExecuting: false,
          commands: commandPlanCommands()
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ok: true,
          mode: "session",
          nonExecuting: true,
          commands: commandPlanCommands().filter((command) => command.name !== "browser")
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(commandPlanOutput()),
          stdout: "raw-secret-token",
          artifactPath: "C:\\Temp\\raw-secret-token"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(commandPlanOutput()),
          safety: ["This helper prints commands only.", 42]
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(commandPlanOutput()),
          token: "raw-secret-token"
        })
      )
    ).toBe(false);
  });

  it("parses only reviewed ephemeral command-plan readiness metadata", () => {
    expect(parseEphemeralCommandPlanReadiness(ephemeralCommandPlanOutput())).toBe(true);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ viewerSurfacePort: undefined })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ browserCommand: "Start-Process 'http://127.0.0.1:0/'" })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ browserCommand: "Open http://127.0.0.1:49152/" })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(ephemeralCommandPlanOutput()),
          stdout: "raw-secret-token"
        })
      )
    ).toBe(false);
  });

  it("parses only bounded target-specific role-filter command output", () => {
    for (const target of roleFilterTargets()) {
      expect(parseRoleFilteredCommandReadiness(roleFilterOutput(target), target)).toBe(true);
    }

    expect(
      parseRoleFilteredCommandReadiness(
        `${roleFilterOutput("host")}\nviewer command:\nnpm run dev:agent -- viewer`,
        "host"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        `${roleFilterOutput("browser")}\nrelay command:\nnpm run dev:relay`,
        "browser"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        `${roleFilterOutput("preflight")}\nhost command:\nnpm run dev:agent -- host --host-apply-input 'true'`,
        "preflight"
      )
    ).toBe(false);
    expect(parseRoleFilteredCommandReadiness(roleFilterOutput("relay"), "host")).toBe(false);
    expect(parseRoleFilteredCommandReadiness("x".repeat(32769), "relay")).toBe(false);
    expect(parseRoleFilteredCommandReadiness(roleFilterOutput("relay"), "unsafe")).toBe(false);
  });

  it("parses only reviewed LAN relay role-filter output", () => {
    expect(parseLanRelayRoleFilteredCommandReadiness(lanRelayRoleFilterOutput())).toBe(true);
    expect(parseLanRelayRoleFilteredCommandReadiness(roleFilterOutput("relay"))).toBe(false);
    expect(
      parseLanRelayRoleFilteredCommandReadiness(
        lanRelayRoleFilterOutput({ relayCommand: "npm run dev:relay" })
      )
    ).toBe(false);
    expect(
      parseLanRelayRoleFilteredCommandReadiness(
        `${lanRelayRoleFilterOutput()}\nhost command:\nnpm run dev:agent -- host`
      )
    ).toBe(false);
    expect(parseLanRelayRoleFilteredCommandReadiness("x".repeat(32769))).toBe(false);
  });

  it("parses only reviewed LAN agent role-filter output", () => {
    expect(parseLanAgentRoleFilteredCommandReadiness(lanAgentRoleFilterOutput("host"), "host")).toBe(
      true
    );
    expect(
      parseLanAgentRoleFilteredCommandReadiness(lanAgentRoleFilterOutput("viewer"), "viewer")
    ).toBe(true);
    expect(parseLanAgentRoleFilteredCommandReadiness(roleFilterOutput("host"), "host")).toBe(false);
    expect(
      parseLanAgentRoleFilteredCommandReadiness(lanAgentRoleFilterOutput("host"), "viewer")
    ).toBe(false);
    expect(
      parseLanAgentRoleFilteredCommandReadiness(
        `${lanAgentRoleFilterOutput("viewer")}\nhost command:\nnpm run dev:agent -- host`,
        "viewer"
      )
    ).toBe(false);
    expect(parseLanAgentRoleFilteredCommandReadiness(lanAgentRoleFilterOutput("host"), "relay")).toBe(
      false
    );
    expect(parseLanAgentRoleFilteredCommandReadiness("x".repeat(32769), "host")).toBe(false);
  });

  it("parses only reviewed ephemeral browser role-filter output", () => {
    expect(parseEphemeralBrowserRoleFilteredCommandReadiness(ephemeralBrowserRoleFilterOutput())).toBe(
      true
    );
    expect(
      parseEphemeralBrowserRoleFilteredCommandReadiness(
        roleFilterOutput("browser", { browserCommand: "Start-Process 'http://127.0.0.1:0/'" })
      )
    ).toBe(false);
    expect(
      parseEphemeralBrowserRoleFilteredCommandReadiness(
        roleFilterOutput("browser", { browserCommand: "Open http://127.0.0.1:49152/" })
      )
    ).toBe(false);
    expect(
      parseEphemeralBrowserRoleFilteredCommandReadiness(
        `${ephemeralBrowserRoleFilterOutput()}\nviewer command:\nnpm run dev:agent -- viewer`
      )
    ).toBe(false);
    expect(parseEphemeralBrowserRoleFilteredCommandReadiness("x".repeat(32769))).toBe(false);
  });

  it("formats bounded JSON success and failure output without child output leakage", () => {
    const success = formatMvpReadyJsonResult({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true }
      ]
    });
    const failure = formatMvpReadyJsonResult({
      ok: false,
      reason: "spawn-failed",
      checks: [
        { name: "doctor", ok: false, reason: "spawn-failed", output: "raw-secret-token" }
      ]
    });

    expect(JSON.parse(success)).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true }
      ]
    });
    expect(JSON.parse(failure)).toEqual({
      ok: false,
      reason: "spawn-failed",
      checks: [{ name: "doctor", ok: false, reason: "spawn-failed" }]
    });
    expect(success).not.toContain("raw-secret-token");
    expect(failure).not.toContain("raw-secret-token");
  });

  it("formats bounded JSON for role-scoped readiness", () => {
    const output = formatMvpReadyJsonResult({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "role-filter-relay-command", ok: true, output: "raw-secret-token" }
      ]
    });

    expect(JSON.parse(output)).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "role-filter-relay-command", ok: true }
      ]
    });
    expect(output).not.toContain("smoke");
    expect(output).not.toContain("raw-secret-token");
  });

  it("formats bounded JSON smoke subchecks without raw child output", () => {
    const output = formatMvpReadyJsonResult({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        {
          name: "smoke",
          ok: true,
          checks: smokeSubchecks(),
          auditSummary: smokeAuditSummary(),
          output: "raw-secret-token"
        },
        {
          name: "lan-smoke",
          ok: true,
          checks: smokeSubchecks(),
          auditSummary: smokeAuditSummary(),
          output: "raw-secret-token"
        },
        {
          name: "unsafe-smoke",
          ok: true,
          auditSummary: {
            host: { records: "raw-secret-token" },
            action: "agent-shell.authorization.active"
          }
        }
      ]
    });

    expect(JSON.parse(output)).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "unsafe-smoke", ok: true }
      ]
    });
    expect(output).not.toContain("raw-secret-token");
    expect(output).not.toContain("agent-shell");
  });
});

function roleFilterTargets() {
  return ["relay", "host", "viewer", "browser", "preflight"];
}

function roleFilterPlanSteps() {
  return [
    ...roleFilterTargets().map((target) => ({
      name: `role-filter-${target}-command`,
      command: "npm",
      args: ["run", "mvp:commands", "--", "--only", target]
    })),
    {
      name: "ephemeral-role-filter-browser-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "browser",
        "--viewer-control-surface-port",
        "0"
      ]
    }
  ];
}

function defaultReadyCheckNames() {
  return [
    "doctor",
    "native-preflight",
    "command-plan",
    "ephemeral-command-plan",
    "lan-command-plan",
    "token-command-plan",
    ...roleFilterTargets().map((target) => `role-filter-${target}-command`),
    "ephemeral-role-filter-browser-command"
  ];
}

function roleFilterCheckResults() {
  return [
    ...roleFilterTargets().map((target) => ({
      name: `role-filter-${target}-command`,
      ok: true
    })),
    { name: "ephemeral-role-filter-browser-command", ok: true }
  ];
}

function roleFilterOutputForStep(name: string) {
  if (name === "ephemeral-role-filter-browser-command") {
    return ephemeralBrowserRoleFilterOutput();
  }
  if (name === "lan-role-filter-relay-command") {
    return lanRelayRoleFilterOutput();
  }
  if (name === "lan-role-filter-host-command") {
    return lanAgentRoleFilterOutput("host");
  }
  if (name === "lan-role-filter-viewer-command") {
    return lanAgentRoleFilterOutput("viewer");
  }

  const prefix = "role-filter-";
  const suffix = "-command";
  if (!name.startsWith(prefix) || !name.endsWith(suffix)) {
    return undefined;
  }

  const target = name.slice(prefix.length, -suffix.length);
  return roleFilterTargets().includes(target) ? roleFilterOutput(target) : undefined;
}

function roleFilterOutput(
  target: string,
  options: { browserCommand?: string; relayCommand?: string; relayUrl?: string } = {}
) {
  if (target === "preflight") {
    return [
      "# WinBridge MVP preflight commands",
      "Run each command manually in a visible PowerShell terminal before a two-PC MVP trial.",
      "0. Preflight before the two-PC trial:",
      "- On each Windows machine:",
      "npm run mvp:ready",
      "- Individual troubleshooting checks:",
      "npm run mvp:doctor",
      "npm run mvp:native-preflight",
      "- On one local development machine before the two-PC trial:",
      "npm run mvp:smoke",
      "Safety checks:",
      "- Host consent and visible sessions are required before any live assistance trial.",
      "- Do not proceed if any preflight command fails.",
      "- This helper printed commands only; it did not start runtime processes or remote assistance actions."
    ].join("\n");
  }

  const targetBodies: Record<string, string[]> = {
    relay: ["relay command:", options.relayCommand ?? "npm run dev:relay"],
    host: [
      "host command:",
      `npm run dev:agent -- host --relay '${options.relayUrl ?? "ws://localhost:8787/"}' --session 'demo' --pairing '123-456' --name 'WinBridge Assisted Host' --host-consent-prompt 'true' --visible-session 'true' --host-control-prompt 'true' --host-signal-probe-ack 'true' --audit-log 'logs\\host-audit.jsonl' --host-apply-input 'true' --dev-screen-frame-after-ms '1000' --dev-screen-frame-source 'windows-capture' --dev-screen-frame-count '600' --dev-screen-frame-interval-ms '1000'`,
      "Host controls:",
      "help | status | pause | resume | revoke screen:view | revoke input:pointer | revoke input:keyboard | terminate | disconnect"
    ],
    viewer: [
      "viewer command:",
      `npm run dev:agent -- viewer --relay '${options.relayUrl ?? "ws://localhost:8787/"}' --session 'demo' --pairing '123-456' --name 'WinBridge Support Viewer' --request 'screen:view,input:pointer,input:keyboard' --request-reason 'MVP remote assistance session' --viewer-signal-probe-after-ms '1000' --audit-log 'logs\\viewer-audit.jsonl' --viewer-screen-frame-output 'frames\\latest.jpg' --viewer-control-surface-port '35987'`,
      "Open the separate browser command on the viewer PC after this viewer command is running."
    ],
    browser: [
      "browser command:",
      options.browserCommand ?? "Start-Process 'http://127.0.0.1:35987/'",
      "Open only on the viewer PC after the viewer command reports the local control surface URL.",
      "- Wait for frame=ready before browser pointer control.",
      "- Click the visible Pointer Off/On control before browser pointer movement, wheel, or button input."
    ]
  };

  return [
    `# WinBridge MVP ${target} command`,
    "Run this command manually in a visible PowerShell terminal.",
    roleFilterReadyReminder(target),
    `Relay URL: ${options.relayUrl ?? "ws://localhost:8787/"}`,
    ...targetBodies[target],
    "Safety checks:",
    "- Host consent and visible sessions are required before live assistance trials.",
    "- This helper printed commands only; it did not start relay, host, viewer, capture, input, or browser processes.",
    "- Stop from the host terminal with pause, revoke, terminate, disconnect, or Ctrl+C."
  ].join("\n");
}

function ephemeralBrowserRoleFilterOutput() {
  return roleFilterOutput("browser", {
    browserCommand: EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION
  });
}

function lanRelayRoleFilterOutput(options: { relayCommand?: string } = {}) {
  return roleFilterOutput("relay", {
    relayUrl: "ws://192.168.1.10:8787/",
    relayCommand:
      options.relayCommand ??
      "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay"
  });
}

function lanAgentRoleFilterOutput(target: "host" | "viewer") {
  return roleFilterOutput(target, {
    relayUrl: "ws://192.168.1.10:8787/"
  });
}

function roleFilterReadyReminder(target: string) {
  const role = target === "browser" ? "viewer" : target;
  return `Preflight reminder: run npm run mvp:ready -- --role ${role} on this machine before a live trial.`;
}

function smokeSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "indicator", ok: true },
    { name: "frame", ok: true },
    { name: "surface", ok: true },
    { name: "signal", ok: true },
    { name: "surface-guards", ok: true },
    { name: "input", ok: true },
    { name: "audit", ok: true },
    { name: "lifecycle", ok: true },
    { name: "viewer-disconnect", ok: true }
  ];
}

function smokeFailureSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "indicator", ok: true },
    { name: "frame", ok: true },
    { name: "surface", ok: true },
    { name: "signal", ok: false },
    { name: "surface-guards", ok: false, skipped: true },
    { name: "input", ok: false, skipped: true },
    { name: "audit", ok: false, skipped: true },
    { name: "lifecycle", ok: false, skipped: true },
    { name: "viewer-disconnect", ok: false, skipped: true }
  ];
}

function smokeAuditSummary() {
  return {
    host: {
      records: 5,
      accepted: 5,
      denied: 0,
      failed: 0,
      authorizationApproved: true,
      authorizationActive: true,
      screenFrameSent: true,
      screenFrameOutput: false,
      inputSent: true,
      permissionRevoked: true
    },
    viewer: {
      records: 1,
      accepted: 1,
      denied: 0,
      failed: 0,
      authorizationApproved: false,
      authorizationActive: false,
      screenFrameSent: false,
      screenFrameOutput: true,
      inputSent: false,
      permissionRevoked: false
    }
  };
}

type CommandPlanFixtureOptions = {
  relayUrl?: string;
  tokenEnv?: string;
  relayBindHost?: string | null;
  viewerSurfacePort?: number;
  browserCommand?: string;
};

function commandPlanOutput(options: CommandPlanFixtureOptions = {}) {
  return JSON.stringify({
    ok: true,
    mode: "session",
    nonExecuting: true,
    commands: commandPlanCommands(options),
    safety: ["This helper prints commands only."]
  });
}

function ephemeralCommandPlanOutput(options: CommandPlanFixtureOptions = {}) {
  return commandPlanOutput({
    viewerSurfacePort: 0,
    browserCommand: EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION,
    ...options
  });
}

function commandPlanCommands(options: CommandPlanFixtureOptions = {}) {
  const relayUrl = options.relayUrl ?? "ws://localhost:8787/";
  const tokenArg = options.tokenEnv ? ` --token $env:${options.tokenEnv}` : "";
  const viewerSurfaceArg =
    options.viewerSurfacePort === undefined
      ? ""
      : ` --viewer-control-surface-port '${options.viewerSurfacePort}'`;
  const relayBindHost = Object.hasOwn(options, "relayBindHost") ? options.relayBindHost : "0.0.0.0";
  const relayCommand = commandPlanRelayCommand(relayUrl, relayBindHost);

  return [
    { name: "preflight.ready", command: "npm run mvp:ready" },
    { name: "preflight.doctor", command: "npm run mvp:doctor" },
    { name: "preflight.native", command: "npm run mvp:native-preflight" },
    { name: "preflight.smoke", command: "npm run mvp:smoke" },
    { name: "relay", command: relayCommand },
    {
      name: "host",
      command: `npm run dev:agent -- host --relay '${relayUrl}' --pairing '123-456'${tokenArg}`
    },
    {
      name: "viewer",
      command: `npm run dev:agent -- viewer --relay '${relayUrl}' --pairing '123-456'${tokenArg}${viewerSurfaceArg}`
    },
    { name: "browser", command: options.browserCommand ?? "Start-Process 'http://127.0.0.1:35987/'" }
  ];
}

function commandPlanRelayCommand(relayUrl: string, relayBindHost: string | null | undefined) {
  if (relayUrl === "ws://localhost:8787/") {
    return "npm run dev:relay";
  }
  if (relayBindHost === null || relayBindHost === undefined) {
    return "npm run dev:relay";
  }
  return `$env:WINBRIDGE_RELAY_BIND_HOST = '${relayBindHost}'; npm run dev:relay`;
}
