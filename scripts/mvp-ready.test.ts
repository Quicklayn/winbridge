import { describe, expect, it } from "vitest";
import {
  createMvpReadyPlan,
  formatMvpReadyError,
  formatMvpReadyJsonResult,
  formatMvpReadyResult,
  MvpReadyUsageError,
  parseCommandPlanReadiness,
  parseMvpReadyArgs,
  parseSmokeReadiness,
  parseSmokeSubchecks,
  runMvpReadyCheck
} from "./mvp-ready.mjs";

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
  });

  it("builds the default readiness plan without smoke", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm" })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      { name: "command-plan", command: "npm", args: ["run", "mvp:commands", "--", "--json"] },
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
      }
    ]);
  });

  it("includes smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true })).toEqual([
      { name: "doctor", command: "npm", args: ["run", "mvp:doctor"] },
      { name: "native-preflight", command: "npm", args: ["run", "mvp:native-preflight"] },
      { name: "command-plan", command: "npm", args: ["run", "mvp:commands", "--", "--json"] },
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
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] }
    ]);
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
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        return { ok: true };
      }
    });

    expect(calls).toEqual([
      "doctor",
      "native-preflight",
      "command-plan",
      "lan-command-plan",
      "token-command-plan"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "native-preflight=ok",
        "command-plan=ok",
        "lan-command-plan=ok",
        "token-command-plan=ok",
        "smoke=skipped"
      ].join("\n")
    );
  });

  it("runs smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks()
    });
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        calls.push(step.name);
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
        }
        return step.name === "smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([
      "doctor",
      "native-preflight",
      "command-plan",
      "lan-command-plan",
      "token-command-plan",
      "smoke"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "smoke", ok: true, checks: smokeSubchecks() }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("smoke.audit=ok");
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

  it("fails closed when LAN command-plan output does not target the LAN relay URL", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
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
        { name: "lan-command-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyResult(result)).not.toContain("123-456");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyJsonResult(result)).not.toContain("123-456");
  });

  it("fails closed when token command-plan output omits the expected token env", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
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

  it("fails closed when included smoke output is missing or malformed", () => {
    const result = runMvpReadyCheck({
      includeSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true }),
      runCommand: (step: { name: string }) => {
        if (step.name === "command-plan") {
          return { ok: true, output: commandPlanOutput() };
        }
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
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
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
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
        if (step.name === "lan-command-plan") {
          return { ok: true, output: commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }) };
        }
        if (step.name === "token-command-plan") {
          return { ok: true, output: commandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }) };
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
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
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
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
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
    ).toEqual(smokeSubchecks());
    expect(
      parseSmokeSubchecks(
        [
          "> winbridge@0.1.0 mvp:smoke",
          "> npm run build && node scripts/mvp-session-smoke.mjs --json",
          JSON.stringify({
            ok: true,
            checks: smokeSubchecks(),
            artifacts: "cleaned"
          })
        ].join("\n")
      )
    ).toEqual(smokeSubchecks());

    expect(parseSmokeSubchecks('{"ok":true,"checks":[{"name":"relay","ok":true}]}')).toBeUndefined();
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
  });

  it("parses only fixed bounded command-plan readiness metadata", () => {
    expect(parseCommandPlanReadiness(commandPlanOutput())).toBe(true);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ relayUrl: "ws://192.168.1.10:8787/" }), {
        expectedRelayUrl: "ws://192.168.1.10:8787/"
      })
    ).toBe(true);
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
  });

  it("formats bounded JSON success and failure output without child output leakage", () => {
    const success = formatMvpReadyJsonResult({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "smoke", ok: true, skipped: true }
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
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "smoke", ok: true, skipped: true }
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

  it("formats bounded JSON smoke subchecks without raw child output", () => {
    const output = formatMvpReadyJsonResult({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        {
          name: "smoke",
          ok: true,
          checks: smokeSubchecks(),
          output: "raw-secret-token"
        }
      ]
    });

    expect(JSON.parse(output)).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "smoke", ok: true, checks: smokeSubchecks() }
      ]
    });
    expect(output).not.toContain("raw-secret-token");
  });
});

function smokeSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "frame", ok: true },
    { name: "surface", ok: true },
    { name: "signal", ok: true },
    { name: "input", ok: true },
    { name: "audit", ok: true }
  ];
}

function smokeFailureSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "frame", ok: true },
    { name: "surface", ok: true },
    { name: "signal", ok: false },
    { name: "input", ok: false, skipped: true },
    { name: "audit", ok: false, skipped: true }
  ];
}

function commandPlanOutput(options: { relayUrl?: string; tokenEnv?: string } = {}) {
  return JSON.stringify({
    ok: true,
    mode: "session",
    nonExecuting: true,
    commands: commandPlanCommands(options),
    safety: ["This helper prints commands only."]
  });
}

function commandPlanCommands(options: { relayUrl?: string; tokenEnv?: string } = {}) {
  const relayUrl = options.relayUrl ?? "ws://localhost:8787/";
  const tokenArg = options.tokenEnv ? ` --token $env:${options.tokenEnv}` : "";
  const relayCommand =
    relayUrl === "ws://localhost:8787/"
      ? "npm run dev:relay"
      : "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay";

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
      command: `npm run dev:agent -- viewer --relay '${relayUrl}' --pairing '123-456'${tokenArg}`
    },
    { name: "browser", command: "Start-Process 'http://127.0.0.1:35987/'" }
  ];
}
