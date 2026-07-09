import { describe, expect, it } from "vitest";

import {
  createMvpRoleRunnerPlan,
  formatMvpRoleRunnerError,
  formatMvpRoleRunnerDryRun,
  MvpRoleRunnerUsageError,
  parseMvpRoleRunnerArgs,
  runMvpRoleRunner
} from "./mvp-role-runner.mjs";

const baseArgs = [
  "--role",
  "host",
  "--session",
  "mvp-123456-654321",
  "--pairing",
  "234-567",
  "--relay-host",
  "192.168.1.10",
  "--token-env",
  "WINBRIDGE_RELAY_SHARED_TOKEN"
];

describe("MVP role runner", () => {
  it("parses help and dry-run role metadata without foreground acknowledgement", () => {
    expect(parseMvpRoleRunnerArgs(["--help"])).toEqual({ help: true });

    const parsed = parseMvpRoleRunnerArgs([...baseArgs, "--dry-run", "--json"]);
    expect(parsed).toMatchObject({
      help: false,
      role: "host",
      dryRun: true,
      json: true,
      acknowledgedForeground: false
    });
    expect(parsed.commandOptions).toMatchObject({
      session: "mvp-123456-654321",
      pairing: "234-567",
      relay: "ws://192.168.1.10:8787/",
      tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
    });
  });

  it("rejects unsafe or ambiguous input without echoing raw values", () => {
    const invalidInputs = [
      ["--role", "browser", "--session", "mvp-123456-654321", "--pairing", "234-567", "--relay", "ws://localhost:8787/"],
      ["--role", "host", "--session", "mvp-123456-654321", "--pairing", "234-567", "--relay", "ws://localhost:8787/"],
      [...baseArgs, "--token", "raw-secret-token"],
      [...baseArgs, "--relay", "ws://localhost:8787/"],
      [...baseArgs, "--generate-session"],
      [...baseArgs, "--i-understand-foreground", "--i-understand-foreground"]
    ];

    for (const invalidInput of invalidInputs) {
      let thrown: unknown;
      try {
        parseMvpRoleRunnerArgs(invalidInput);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpRoleRunnerUsageError);
      expect(formatMvpRoleRunnerError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpRoleRunnerError(thrown)).not.toContain("192.168.1.10");
      expect(formatMvpRoleRunnerError(thrown)).not.toContain("234-567");
    }
  });

  it("emits bounded sanitized dry-run JSON for a host runner", () => {
    const parsed = parseMvpRoleRunnerArgs([...baseArgs, "--dry-run", "--json"]);
    const plan = createMvpRoleRunnerPlan(parsed, {
      env: { WINBRIDGE_RELAY_SHARED_TOKEN: "dev-token" }
    });
    const output = formatMvpRoleRunnerDryRun(plan, { json: true });
    const result = JSON.parse(output);

    expect(result).toEqual({
      ok: true,
      mode: "role-runner",
      role: "host",
      foreground: true,
      nonExecuting: true,
      command: "npm",
      args: expect.arrayContaining([
        "run",
        "dev:agent",
        "--",
        "host",
        "--relay",
        "<relay-url>",
        "--session",
        "<session-id>",
        "--pairing",
        "<pairing-code>",
        "--host-consent-prompt",
        "true",
        "--visible-session",
        "true",
        "--host-control-prompt",
        "true",
        "--host-apply-input",
        "true",
        "--dev-screen-frame-source",
        "windows-capture",
        "--token",
        "<relay-token>"
      ]),
      env: []
    });
    expect(output).not.toContain("dev-token");
    expect(output).not.toContain("234-567");
    expect(output).not.toContain("192.168.1.10");
    expect(output).not.toContain("logs\\");
  });

  it("emits bounded sanitized dry-run JSON for a relay runner", () => {
    const parsed = parseMvpRoleRunnerArgs([
      "--role",
      "relay",
      "--session",
      "mvp-123456-654321",
      "--pairing",
      "234-567",
      "--relay-host",
      "192.168.1.10",
      "--token-env",
      "WINBRIDGE_RELAY_SHARED_TOKEN",
      "--json"
    ]);
    const result = JSON.parse(formatMvpRoleRunnerDryRun(createMvpRoleRunnerPlan(parsed), { json: true }));

    expect(result).toMatchObject({
      ok: true,
      role: "relay",
      command: "npm",
      args: ["run", "dev:relay"],
      env: expect.arrayContaining(["WINBRIDGE_RELAY_BIND_HOST", "WINBRIDGE_RELAY_SHARED_TOKEN"])
    });
  });

  it("passes reviewed live host argv to the foreground child", () => {
    const calls: unknown[] = [];
    const result = runMvpRoleRunner([...baseArgs, "--i-understand-foreground"], {
      env: { WINBRIDGE_RELAY_SHARED_TOKEN: "dev-token" },
      cwd: "C:\\repo\\winbridge",
      spawnSync: (command: string, args: string[], options: unknown) => {
        calls.push({ command, args, options });
        return { status: 7 };
      }
    });

    expect(result).toEqual({ exitCode: 7, output: "" });
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      command: "npm",
      args: expect.arrayContaining([
        "run",
        "dev:agent",
        "--",
        "host",
        "--relay",
        "ws://192.168.1.10:8787/",
        "--session",
        "mvp-123456-654321",
        "--pairing",
        "234-567",
        "--host-consent-prompt",
        "true",
        "--visible-session",
        "true",
        "--host-control-prompt",
        "true",
        "--host-apply-input",
        "true",
        "--dev-screen-frame-source",
        "windows-capture",
        "--token",
        "dev-token"
      ]),
      options: expect.objectContaining({
        cwd: "C:\\repo\\winbridge",
        stdio: "inherit",
        windowsHide: false
      })
    });
  });

  it("rejects missing or unsafe token env values before live spawn", () => {
    for (const env of [
      {},
      { WINBRIDGE_RELAY_SHARED_TOKEN: "" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: " raw-secret-token" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: "raw-secret-token\n" },
      { WINBRIDGE_RELAY_SHARED_TOKEN: "safe\u200Btoken" }
    ]) {
      let thrown: unknown;
      try {
        runMvpRoleRunner([...baseArgs, "--i-understand-foreground"], {
          env,
          spawnSync: () => {
            throw new Error("spawn should not run");
          }
        });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpRoleRunnerUsageError);
      expect(formatMvpRoleRunnerError(thrown)).not.toContain("raw-secret-token");
    }
  });
});
