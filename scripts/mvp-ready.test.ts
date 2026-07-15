import { describe, expect, it } from "vitest";
import {
  createMvpReadyPlan,
  formatMvpReadyError,
  formatMvpReadyJsonResult,
  formatMvpReadyResult,
  MvpReadyUsageError,
  MVP_READY_USAGE,
  parseEphemeralBrowserRoleFilteredCommandReadiness,
  parseCommandPlanReadiness,
  parseEphemeralCommandPlanReadiness,
  parseEvidenceFixtureReadiness,
  parsePreflightCommandPlanReadiness,
  parseLanAgentRoleFilteredCommandReadiness,
  parseLanRelayRoleFilteredCommandReadiness,
  parseMvpReadyArgs,
  parseMvpRoleRunnerDryRunReadiness,
  parseMvpTrialPlanReadiness,
  parseRoleFilteredCommandReadiness,
  parseSmokeReadiness,
  parseSmokeSubchecks,
  parseTokenEnvAgentRoleFilteredCommandReadiness,
  parseTokenEnvBrowserRoleFilteredCommandReadiness,
  parseTokenEnvPreflightRoleFilteredCommandReadiness,
  parseTokenEnvRelayRoleFilteredCommandReadiness,
  runMvpReadyCheck
} from "./mvp-ready.mjs";

const EPHEMERAL_VIEWER_SURFACE_BROWSER_INSTRUCTION =
  "Open the viewer local control surface URL printed by the viewer command log.";

describe("MVP ready helper", () => {
  it("parses bounded flag-only options", () => {
    expect(parseMvpReadyArgs([])).toEqual({
      help: false,
      json: false,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: true,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-token-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: true,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-lan-token-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: true,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-windows-capture-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: true,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-windows-input-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: true,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-windows-control-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: true,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-evidence-fixture", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: true,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--include-all-smoke", "--json"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: true
    });
    expect(
      parseMvpReadyArgs(["--include-smoke", "--include-token-smoke", "--include-lan-token-smoke"])
    ).toEqual({
      help: false,
      json: false,
      includeSmoke: true,
      includeTokenSmoke: true,
      includeLanTokenSmoke: true,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false
    });
    expect(parseMvpReadyArgs(["--role", "host"])).toEqual({
      help: false,
      json: false,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false,
      role: "host"
    });
    expect(parseMvpReadyArgs(["--json", "--role", "viewer"])).toEqual({
      help: false,
      json: true,
      includeSmoke: false,
      includeTokenSmoke: false,
      includeLanTokenSmoke: false,
      includeWindowsCaptureSmoke: false,
      includeWindowsInputSmoke: false,
      includeWindowsControlSmoke: false,
      includeEvidenceFixture: false,
      includeAllSmoke: false,
      role: "viewer"
    });
    expect(parseMvpReadyArgs(["--help"])).toEqual({ help: true });
  });

  it("describes the current default readiness surface in help text", () => {
    expect(MVP_READY_USAGE).toContain("Default mode runs doctor, native");
    expect(MVP_READY_USAGE).toContain("non-executing command-plan validation");
    expect(MVP_READY_USAGE).toContain("role-filter, LAN, token-env, and ephemeral browser outputs");
    expect(MVP_READY_USAGE).toContain("--include-windows-input-smoke");
    expect(MVP_READY_USAGE).toContain("--include-windows-control-smoke");
    expect(MVP_READY_USAGE).toContain("--include-evidence-fixture");
    expect(MVP_READY_USAGE).toContain("Smoke checks are explicit through include flags.");
    expect(MVP_READY_USAGE).not.toContain("Default mode runs only");
    expect(MVP_READY_USAGE).not.toContain("only\nread-only doctor and native preflight");
  });

  it("parses reviewed evidence fixture readiness output only", () => {
    expect(parseEvidenceFixtureReadiness(evidenceFixtureOutput())).toBe(true);
    expect(parseEvidenceFixtureReadiness(`npm banner\n${evidenceFixtureOutput()}`)).toBe(true);
    expect(parseEvidenceFixtureReadiness(evidenceFixtureOutput({ hostRecords: 4 }))).toBe(false);
    expect(parseEvidenceFixtureReadiness(evidenceFixtureOutput({ viewerRecords: 4 }))).toBe(false);
    expect(parseEvidenceFixtureReadiness(evidenceFixtureOutput({ verified: false }))).toBe(false);
    expect(parseEvidenceFixtureReadiness(JSON.stringify({ ok: true, hostRecords: 5, viewerRecords: 3, verified: true, path: "logs\\host-audit.jsonl" }))).toBe(false);
    expect(parseEvidenceFixtureReadiness("raw-secret-token")).toBe(false);
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
    expect(() => parseMvpReadyArgs(["--include-token-smoke", "--include-token-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-lan-token-smoke", "--include-lan-token-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() =>
      parseMvpReadyArgs(["--include-windows-capture-smoke", "--include-windows-capture-smoke"])
    ).toThrow(MvpReadyUsageError);
    expect(() =>
      parseMvpReadyArgs(["--include-windows-input-smoke", "--include-windows-input-smoke"])
    ).toThrow(MvpReadyUsageError);
    expect(() =>
      parseMvpReadyArgs(["--include-windows-control-smoke", "--include-windows-control-smoke"])
    ).toThrow(MvpReadyUsageError);
    expect(() =>
      parseMvpReadyArgs(["--include-evidence-fixture", "--include-evidence-fixture"])
    ).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--include-all-smoke", "--include-all-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-all-smoke", "--include-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-all-smoke", "--include-token-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-all-smoke", "--include-lan-token-smoke"])).toThrow(
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
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-token-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-token-smoke", "--role", "viewer"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-lan-token-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-lan-token-smoke", "--role", "viewer"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-windows-capture-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() =>
      parseMvpReadyArgs(["--include-windows-capture-smoke", "--role", "viewer"])
    ).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-windows-input-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() =>
      parseMvpReadyArgs(["--include-windows-input-smoke", "--role", "viewer"])
    ).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-windows-control-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() =>
      parseMvpReadyArgs(["--include-windows-control-smoke", "--role", "viewer"])
    ).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-evidence-fixture"])).toThrow(
      MvpReadyUsageError
    );
    expect(() =>
      parseMvpReadyArgs(["--include-evidence-fixture", "--role", "viewer"])
    ).toThrow(MvpReadyUsageError);
    expect(() => parseMvpReadyArgs(["--role", "host", "--include-all-smoke"])).toThrow(
      MvpReadyUsageError
    );
    expect(() => parseMvpReadyArgs(["--include-all-smoke", "--role", "viewer"])).toThrow(
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
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--relay-host",
          "192.168.1.10",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
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
      {
        name: "preflight-json-command-plan",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "preflight", "--json"]
      },
      {
        name: "preflight-token-json-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "preflight",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      { name: "trial-plan", command: "npm", args: ["run", "mvp:trial", "--", "--json"] },
      ...roleRunnerDryRunPlanSteps(),
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
        args: [
          "run",
          "mvp:commands",
          "--",
          "--json",
          "--relay-host",
          "192.168.1.10",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
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
      {
        name: "preflight-json-command-plan",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "preflight", "--json"]
      },
      {
        name: "preflight-token-json-command-plan",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "preflight",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      { name: "trial-plan", command: "npm", args: ["run", "mvp:trial", "--", "--json"] },
      ...roleRunnerDryRunPlanSteps(),
      ...roleFilterPlanSteps(),
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      }
    ]);
  });

  it("includes token smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeTokenSmoke: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      }
    ]);
    expect(
      createMvpReadyPlan({ npmCommand: "npm", includeSmoke: true, includeTokenSmoke: true }).slice(
        -3
      )
    ).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      }
    ]);
  });

  it("includes LAN token smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeLanTokenSmoke: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      }
    ]);
    expect(
      createMvpReadyPlan({
        npmCommand: "npm",
        includeSmoke: true,
        includeTokenSmoke: true,
        includeLanTokenSmoke: true
      }).slice(-4)
    ).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      }
    ]);
  });

  it("includes Windows capture smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeWindowsCaptureSmoke: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "windows-capture-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--windows-capture"]
      }
    ]);
    expect(
      createMvpReadyPlan({
        npmCommand: "npm",
        includeAllSmoke: true,
        includeWindowsCaptureSmoke: true
      }).slice(-5)
    ).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "windows-capture-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--windows-capture"]
      }
    ]);
  });

  it("includes Windows input smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeWindowsInputSmoke: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "windows-input-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--windows-input"]
      }
    ]);
    expect(
      createMvpReadyPlan({
        npmCommand: "npm",
        includeAllSmoke: true,
        includeWindowsInputSmoke: true
      }).slice(-5)
    ).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "windows-input-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--windows-input"]
      }
    ]);
  });

  it("includes Windows control smoke only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeWindowsControlSmoke: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "windows-control-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--windows-capture",
          "--windows-input"
        ]
      }
    ]);
    expect(
      createMvpReadyPlan({
        npmCommand: "npm",
        includeAllSmoke: true,
        includeWindowsControlSmoke: true
      }).slice(-5)
    ).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "windows-control-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--windows-capture",
          "--windows-input"
        ]
      }
    ]);
  });

  it("includes evidence fixture only when explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeEvidenceFixture: true })).toEqual([
      ...createMvpReadyPlan({ npmCommand: "npm" }),
      {
        name: "evidence-fixture",
        command: "npm",
        args: ["run", "mvp:evidence-fixture", "--", "--verify", "--json"]
      }
    ]);
  });

  it("includes every default smoke variant when all smoke is explicitly requested", () => {
    expect(createMvpReadyPlan({ npmCommand: "npm", includeAllSmoke: true }).slice(-4)).toEqual([
      { name: "smoke", command: "npm", args: ["run", "mvp:smoke", "--", "--json"] },
      {
        name: "lan-smoke",
        command: "npm",
        args: ["run", "mvp:smoke", "--", "--json", "--lan-relay"]
      },
      {
        name: "token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "lan-token-smoke",
        command: "npm",
        args: [
          "run",
          "mvp:smoke",
          "--",
          "--json",
          "--lan-relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      }
    ]);
    expect(JSON.stringify(createMvpReadyPlan({ npmCommand: "npm", includeAllSmoke: true }))).not.toContain(
      "--windows-input"
    );
    expect(JSON.stringify(createMvpReadyPlan({ npmCommand: "npm", includeAllSmoke: true }))).not.toContain(
      "--windows-capture --windows-input"
    );
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
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "relay",
          "--relay-host",
          "192.168.1.10",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "token-role-filter-relay-command",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "relay",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "trial-role-relay-plan",
        command: "npm",
        args: ["run", "mvp:trial", "--", "--role", "relay", "--json"]
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
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "host",
          "--relay-host",
          "192.168.1.10",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "token-role-filter-host-command",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "host",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "trial-role-host-plan",
        command: "npm",
        args: ["run", "mvp:trial", "--", "--role", "host", "--json"]
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
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "viewer",
          "--relay-host",
          "192.168.1.10",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "token-role-filter-viewer-command",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "viewer",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
      },
      {
        name: "role-filter-browser-command",
        command: "npm",
        args: ["run", "mvp:commands", "--", "--only", "browser"]
      },
      {
        name: "token-role-filter-browser-command",
        command: "npm",
        args: [
          "run",
          "mvp:commands",
          "--",
          "--only",
          "browser",
          "--token-env",
          "WINBRIDGE_RELAY_SHARED_TOKEN"
        ]
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
      },
      {
        name: "trial-role-viewer-plan",
        command: "npm",
        args: ["run", "mvp:trial", "--", "--role", "viewer", "--json"]
      },
      {
        name: "trial-role-browser-plan",
        command: "npm",
        args: ["run", "mvp:trial", "--", "--role", "browser", "--json"]
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
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
        "preflight-json-command-plan=ok",
        "preflight-token-json-command-plan=ok",
        "trial-plan=ok",
        "role-runner-relay-dry-run=ok",
        "role-runner-host-dry-run=ok",
        "role-runner-viewer-dry-run=ok",
        "token-role-filter-preflight-command=ok",
        "role-filter-relay-command=ok",
        "role-filter-host-command=ok",
        "role-filter-viewer-command=ok",
        "role-filter-browser-command=ok",
        "role-filter-preflight-command=ok",
        "lan-role-filter-relay-command=ok",
        "lan-role-filter-host-command=ok",
        "lan-role-filter-viewer-command=ok",
        "token-role-filter-relay-command=ok",
        "token-role-filter-host-command=ok",
        "token-role-filter-viewer-command=ok",
        "token-role-filter-browser-command=ok",
        "ephemeral-role-filter-browser-command=ok",
        "smoke=skipped",
        "lan-smoke=skipped",
        "token-smoke=skipped",
        "lan-token-smoke=skipped",
        "windows-capture-smoke=skipped",
        "windows-input-smoke=skipped",
        "windows-control-smoke=skipped"
      ].join("\n")
    );
  });

  it("runs evidence fixture only when explicitly included", () => {
    const calls: string[] = [];
    const result = runMvpReadyCheck({
      includeEvidenceFixture: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeEvidenceFixture: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "evidence-fixture") {
          return { ok: true, output: evidenceFixtureOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "evidence-fixture"]);
    expect(result.ok).toBe(true);
    expect(result.checks).toContainEqual({ name: "evidence-fixture", ok: true });
    expect(formatMvpReadyResult(result)).toContain("evidence-fixture=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("fixture-session");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-audit.jsonl");
  });

  it("fails closed when evidence fixture output drifts", () => {
    const result = runMvpReadyCheck({
      includeEvidenceFixture: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeEvidenceFixture: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "evidence-fixture") {
          return {
            ok: true,
            output: `${evidenceFixtureOutput({ verified: false })}\nraw-secret-token\nlogs\\host-audit.jsonl`
          };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return { ok: true };
      }
    });

    expect(result).toMatchObject({
      ok: false,
      reason: "exit-nonzero",
      checks: expect.arrayContaining([
        { name: "evidence-fixture", ok: false, reason: "exit-nonzero" }
      ])
    });
    expect(formatMvpReadyResult(result)).toContain("evidence-fixture=failed reason=exit-nonzero");
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-audit.jsonl");
  });

  it("fails closed when default token-env role-filter output drifts", () => {
    const result = runMvpReadyCheck({
      plan: createMvpReadyPlan({ npmCommand: "npm" }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "token-role-filter-viewer-command") {
          return {
            ok: true,
            output: roleFilterOutput("viewer", { tokenArgument: "--token raw-secret-token" })
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults().filter(
          (check) => check.name !== "token-role-filter-viewer-command" &&
            check.name !== "token-role-filter-browser-command" &&
            check.name !== "ephemeral-role-filter-browser-command"
        ),
        { name: "token-role-filter-viewer-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
  });

  it("fails closed when default LAN role-filter output drifts", () => {
    const result = runMvpReadyCheck({
      plan: createMvpReadyPlan({ npmCommand: "npm" }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "lan-role-filter-host-command") {
          return {
            ok: true,
            output: roleFilterOutput("host", { relayUrl: "ws://localhost:8787/" })
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults().filter(
          (check) =>
            check.name !== "lan-role-filter-host-command" &&
            check.name !== "lan-role-filter-viewer-command" &&
            check.name !== "token-role-filter-relay-command" &&
            check.name !== "token-role-filter-host-command" &&
            check.name !== "token-role-filter-viewer-command" &&
            check.name !== "token-role-filter-browser-command" &&
            check.name !== "ephemeral-role-filter-browser-command"
        ),
        { name: "lan-role-filter-host-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("ws://localhost:8787/");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
  });

  it("fails closed when default token-env preflight role-filter output drifts", () => {
    const result = runMvpReadyCheck({
      plan: createMvpReadyPlan({ npmCommand: "npm" }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "token-role-filter-preflight-command") {
          return {
            ok: true,
            output: tokenEnvPreflightRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
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
        { name: "preflight-json-command-plan", ok: true },
        { name: "preflight-token-json-command-plan", ok: true },
        { name: "trial-plan", ok: true },
        ...roleRunnerTargets().map((role) => ({
          name: `role-runner-${role}-dry-run`,
          ok: true
        })),
        { name: "token-role-filter-preflight-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("WRONG_TOKEN_ENV");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("lan-smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("smoke.audit.host.records=5 accepted=5 denied=0 failed=0");
    expect(formatMvpReadyResult(result)).toContain("smoke.audit.coverage=authorizationApproved");
    expect(formatMvpReadyResult(result)).not.toContain("agent-shell");
  });

  it("runs token smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeTokenSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeTokenSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "token-smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "token-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("token-smoke.audit=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("dev-shared-token");
  });

  it("fails closed when token smoke output is unsafe or failed", () => {
    const result = runMvpReadyCheck({
      includeTokenSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeTokenSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "token-smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: `${JSON.stringify({ ok: false, reason: "usage" })}\nraw-secret-token`
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "token-smoke", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
  });

  it("runs LAN token smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeLanTokenSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeLanTokenSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "lan-token-smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "lan-token-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "lan-token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("lan-token-smoke.audit=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("dev-shared-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
  });

  it("fails closed when LAN token smoke output is unsafe or failed", () => {
    const result = runMvpReadyCheck({
      includeLanTokenSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeLanTokenSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "lan-token-smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: `${JSON.stringify({ ok: false, reason: "usage" })}\nraw-secret-token`
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "lan-token-smoke", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
  });

  it("runs Windows capture smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeWindowsCaptureSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsCaptureSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-capture-smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "windows-capture-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "windows-capture-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("windows-capture-smoke.audit=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-capture");
    expect(formatMvpReadyJsonResult(result)).not.toContain("dev-screen-frame-source");
    expect(formatMvpReadyJsonResult(result)).not.toContain("latest.png");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
  });

  it("fails closed when Windows capture smoke output is unsafe or failed", () => {
    const failedSmokeOutput = JSON.stringify({
      ok: false,
      reason: "native-capture-unsupported",
      checks: [
        { name: "relay", ok: false },
        ...smokeSubchecks().slice(1).map((check) => ({
          name: check.name,
          ok: false,
          skipped: true
        }))
      ]
    });
    const result = runMvpReadyCheck({
      includeWindowsCaptureSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsCaptureSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-capture-smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: `${failedSmokeOutput}\nC:\\Temp\\latest.png\nraw-secret-token\npowershell diagnostics`
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        {
          name: "windows-capture-smoke",
          ok: false,
          reason: "exit-nonzero",
          checks: [
            { name: "relay", ok: false },
            ...smokeSubchecks().slice(1).map((check) => ({
              name: check.name,
              ok: false,
              skipped: true
            }))
          ]
        }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("latest.png");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("powershell diagnostics");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-capture");
    expect(formatMvpReadyJsonResult(result)).not.toContain("dev-screen-frame-source");
  });

  it("runs Windows input smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: windowsInputSmokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeWindowsInputSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsInputSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-input-smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "windows-input-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        {
          name: "windows-input-smoke",
          ok: true,
          checks: windowsInputSmokeSubchecks(),
          auditSummary: smokeAuditSummary()
        },
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("windows-input-smoke.windows-input=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-apply-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("pointer-move");
    expect(formatMvpReadyJsonResult(result)).not.toContain("powershell diagnostics");
  });

  it("fails closed when Windows input smoke metadata is missing or unsafe", () => {
    const result = runMvpReadyCheck({
      includeWindowsInputSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsInputSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-input-smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: `${JSON.stringify({ ok: true, checks: smokeSubchecks() })}\npointer-move\npowershell diagnostics`
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "windows-input-smoke", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("pointer-move");
    expect(formatMvpReadyJsonResult(result)).not.toContain("powershell diagnostics");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-apply-input");
  });

  it("runs Windows control smoke after default checks when explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: windowsInputSmokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeWindowsControlSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsControlSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-control-smoke" ? { ok: true, output: smokeOutput } : { ok: true };
      }
    });

    expect(calls).toEqual([...defaultReadyCheckNames(), "windows-control-smoke"]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        {
          name: "windows-control-smoke",
          ok: true,
          checks: windowsInputSmokeSubchecks(),
          auditSummary: smokeAuditSummary()
        },
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("windows-control-smoke.windows-input=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-capture");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-apply-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("pointer-move");
    expect(formatMvpReadyJsonResult(result)).not.toContain("powershell diagnostics");
  });

  it("fails closed when Windows control smoke metadata is missing or unsafe", () => {
    const result = runMvpReadyCheck({
      includeWindowsControlSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeWindowsControlSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return step.name === "windows-control-smoke"
          ? {
              ok: false,
              reason: "exit-nonzero",
              output: `${JSON.stringify({ ok: true, checks: smokeSubchecks() })}\nlatest.png\npointer-move\npowershell diagnostics`
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "windows-control-smoke", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("pointer-move");
    expect(formatMvpReadyJsonResult(result)).not.toContain("latest.png");
    expect(formatMvpReadyJsonResult(result)).not.toContain("powershell diagnostics");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-capture");
    expect(formatMvpReadyJsonResult(result)).not.toContain("--windows-input");
    expect(formatMvpReadyJsonResult(result)).not.toContain("host-apply-input");
  });

  it("runs every smoke variant after default checks when all smoke is explicitly included", () => {
    const calls: string[] = [];
    const smokeOutput = JSON.stringify({
      ok: true,
      checks: smokeSubchecks(),
      auditSummary: smokeAuditSummary()
    });
    const result = runMvpReadyCheck({
      includeAllSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeAllSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        return ["smoke", "lan-smoke", "token-smoke", "lan-token-smoke"].includes(step.name)
          ? { ok: true, output: smokeOutput }
          : { ok: true };
      }
    });

    expect(calls).toEqual([
      ...defaultReadyCheckNames(),
      "smoke",
      "lan-smoke",
      "token-smoke",
      "lan-token-smoke"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "command-plan", ok: true },
        { name: "ephemeral-command-plan", ok: true },
        { name: "lan-command-plan", ok: true },
        { name: "token-command-plan", ok: true },
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "windows-capture-smoke", ok: true, skipped: true },
        { name: "windows-input-smoke", ok: true, skipped: true },
        { name: "windows-control-smoke", ok: true, skipped: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toContain("smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("lan-smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("token-smoke.audit=ok");
    expect(formatMvpReadyResult(result)).toContain("lan-token-smoke.audit=ok");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("dev-shared-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
  });

  it("fails closed without leaking output when all-smoke later step fails", () => {
    const result = runMvpReadyCheck({
      includeAllSmoke: true,
      plan: createMvpReadyPlan({ npmCommand: "npm", includeAllSmoke: true }),
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        const stepRoleFilterOutput = roleFilterOutputForStep(step.name);
        if (stepRoleFilterOutput !== undefined) {
          return { ok: true, output: stepRoleFilterOutput };
        }
        if (step.name === "lan-token-smoke") {
          return {
            ok: false,
            reason: "exit-nonzero",
            output: `${JSON.stringify({ ok: false, reason: "usage" })}\nraw-secret-token`
          };
        }
        return { ok: true, output: JSON.stringify({ ok: true, checks: smokeSubchecks() }) };
      }
    });

    expect(result.ok).toBe(false);
    expect(result.checks.at(-1)).toEqual({
      name: "lan-token-smoke",
      ok: false,
      reason: "exit-nonzero"
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
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
      "token-role-filter-viewer-command",
      "role-filter-browser-command",
      "token-role-filter-browser-command",
      "ephemeral-role-filter-browser-command",
      "trial-role-viewer-plan",
      "trial-role-browser-plan"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-viewer-command", ok: true },
        { name: "lan-role-filter-viewer-command", ok: true },
        { name: "token-role-filter-viewer-command", ok: true },
        { name: "role-filter-browser-command", ok: true },
        { name: "token-role-filter-browser-command", ok: true },
        { name: "ephemeral-role-filter-browser-command", ok: true },
        { name: "trial-role-viewer-plan", ok: true },
        { name: "trial-role-browser-plan", ok: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "native-preflight=ok",
        "role-filter-viewer-command=ok",
        "lan-role-filter-viewer-command=ok",
        "token-role-filter-viewer-command=ok",
        "role-filter-browser-command=ok",
        "token-role-filter-browser-command=ok",
        "ephemeral-role-filter-browser-command=ok",
        "trial-role-viewer-plan=ok",
        "trial-role-browser-plan=ok"
      ].join("\n")
    );
    expect(formatMvpReadyResult(result)).not.toContain("smoke=skipped");
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
  });

  it("fails closed when viewer-scoped browser trial output drifts", () => {
    const result = runMvpReadyCheck({
      role: "viewer",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "viewer" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "trial-role-browser-plan") {
          return {
            ok: true,
            output: trialPlanOutput("browser", {
              roles: [
                trialPlanRoleWithMutatedStep(
                  "browser",
                  "operator-check",
                  "bounded local surface URL",
                  "raw-secret-token"
                )
              ]
            })
          };
        }
        return { ok: true, output: roleFilterOutputForStep(step.name) };
      }
    });

    expect(result.ok).toBe(false);
    expect(result.checks.at(-1)).toEqual({
      name: "trial-role-browser-plan",
      ok: false,
      reason: "exit-nonzero"
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
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
      "lan-role-filter-relay-command",
      "token-role-filter-relay-command",
      "trial-role-relay-plan"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "role-filter-relay-command", ok: true },
        { name: "lan-role-filter-relay-command", ok: true },
        { name: "token-role-filter-relay-command", ok: true },
        { name: "trial-role-relay-plan", ok: true }
      ]
    });
    expect(formatMvpReadyResult(result)).toBe(
      [
        "WinBridge MVP readiness passed.",
        "doctor=ok",
        "role-filter-relay-command=ok",
        "lan-role-filter-relay-command=ok",
        "token-role-filter-relay-command=ok",
        "trial-role-relay-plan=ok"
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
      "lan-role-filter-host-command",
      "token-role-filter-host-command",
      "trial-role-host-plan"
    ]);
    expect(result).toEqual({
      ok: true,
      checks: [
        { name: "doctor", ok: true },
        { name: "native-preflight", ok: true },
        { name: "role-filter-host-command", ok: true },
        { name: "lan-role-filter-host-command", ok: true },
        { name: "token-role-filter-host-command", ok: true },
        { name: "trial-role-host-plan", ok: true }
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

  it("fails closed when relay role-scoped token-env output drifts", () => {
    const result = runMvpReadyCheck({
      role: "relay",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "relay" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "token-role-filter-relay-command") {
          return {
            ok: true,
            output: tokenEnvRelayRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
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
        { name: "lan-role-filter-relay-command", ok: true },
        { name: "token-role-filter-relay-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("WRONG_TOKEN_ENV");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
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

  it("fails closed when host role-scoped token-env output drifts", () => {
    const result = runMvpReadyCheck({
      role: "host",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "host" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "token-role-filter-host-command") {
          return {
            ok: true,
            output: roleFilterOutput("host", { tokenArgument: "--token raw-secret-token" })
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
        { name: "role-filter-host-command", ok: true },
        { name: "lan-role-filter-host-command", ok: true },
        { name: "token-role-filter-host-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
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
        { name: "token-role-filter-viewer-command", ok: true },
        { name: "role-filter-browser-command", ok: true },
        { name: "token-role-filter-browser-command", ok: true },
        { name: "ephemeral-role-filter-browser-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("127.0.0.1");
    expect(formatMvpReadyJsonResult(result)).not.toContain("127.0.0.1");
  });

  it("fails closed when viewer role-scoped token-env browser output drifts", () => {
    const result = runMvpReadyCheck({
      role: "viewer",
      plan: createMvpReadyPlan({ npmCommand: "npm", role: "viewer" }),
      runCommand: (step: { name: string }) => {
        if (step.name === "token-role-filter-browser-command") {
          return {
            ok: true,
            output: tokenEnvBrowserRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
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
        { name: "token-role-filter-viewer-command", ok: true },
        { name: "role-filter-browser-command", ok: true },
        { name: "token-role-filter-browser-command", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("WRONG_TOKEN_ENV");
    expect(formatMvpReadyJsonResult(result)).not.toContain("WINBRIDGE_RELAY_SHARED_TOKEN");
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

  it("fails closed when default trial-plan output is malformed or evidence-mode", () => {
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
        }
        if (step.name === "trial-plan") {
          return {
            ok: true,
            output: `${trialPlanOutput(undefined, { mode: "evidence" })}\nraw-secret-token\nws://192.168.1.10:8787/`
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
        { name: "preflight-json-command-plan", ok: true },
        { name: "preflight-token-json-command-plan", ok: true },
        { name: "trial-plan", ok: false, reason: "exit-nonzero" }
      ]
    });
    expect(formatMvpReadyResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("raw-secret-token");
    expect(formatMvpReadyJsonResult(result)).not.toContain("192.168.1.10");
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
        { name: "preflight-token-json-command-plan", ok: true },
        { name: "trial-plan", ok: true },
        ...roleRunnerTargets().map((role) => ({
          name: `role-runner-${role}-dry-run`,
          ok: true
        })),
        { name: "token-role-filter-preflight-command", ok: true },
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
        { name: "preflight-token-json-command-plan", ok: true },
        { name: "trial-plan", ok: true },
        ...roleRunnerTargets().map((role) => ({
          name: `role-runner-${role}-dry-run`,
          ok: true
        })),
        { name: "token-role-filter-preflight-command", ok: true },
        ...roleFilterTargets().map((target) => ({
          name: `role-filter-${target}-command`,
          ok: true
        })),
        { name: "lan-role-filter-relay-command", ok: true },
        { name: "lan-role-filter-host-command", ok: true },
        { name: "lan-role-filter-viewer-command", ok: true },
        { name: "token-role-filter-relay-command", ok: true },
        { name: "token-role-filter-host-command", ok: true },
        { name: "token-role-filter-viewer-command", ok: true },
        { name: "token-role-filter-browser-command", ok: true },
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
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
        if (step.name === "preflight-json-command-plan") {
          return { ok: true, output: preflightCommandPlanOutput() };
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
        { name: "preflight-json-command-plan", ok: true },
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
        { name: "preflight-json-command-plan", ok: true },
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
          checks: smokeSubchecks().filter((check) => check.name !== "host-surface")
        })
      )
    ).toBeUndefined();
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
          checks: [...smokeSubchecks(), { name: "host-surface", ok: true }]
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
            check.name === "host-surface"
              ? { ...check, url: "http://127.0.0.1:49154/", token: "raw-secret-token" }
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
        expectedRelayBindHost: "0.0.0.0",
        expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
      })
    ).toBe(true);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          relayUrl: "ws://192.168.1.10:8787/",
          tokenEnv: null
        }),
        {
          expectedRelayUrl: "ws://192.168.1.10:8787/",
          expectedRelayBindHost: "0.0.0.0",
          expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
        }
      )
    ).toBe(false);
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
      parseCommandPlanReadiness(commandPlanOutput({ hostConsentTimeoutArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ hostConsentTimeoutArg: "--host-consent-timeout-ms '30000'" })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          hostConsentTimeoutArg:
            "--host-consent-timeout-ms '60000' --host-consent-timeout-ms '60000'"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ hostControlSurfaceArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ hostControlSurfaceArg: "--host-control-surface-port '35986'" })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          hostControlSurfaceArg:
            "--host-control-surface-port '0' --host-control-surface-port '0'"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ hostApplyInputArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ hostApplyInputArg: "--host-apply-input 'false'" }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          hostApplyInputArg: "--host-apply-input 'true' --host-apply-input 'true'"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ hostWindowsCaptureArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ hostWindowsCaptureArg: "--dev-screen-frame-source 'static'" })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          hostWindowsCaptureArg:
            "--dev-screen-frame-source 'windows-capture' --dev-screen-frame-source 'windows-capture'"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ viewerRequestArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ viewerRequestArg: "--request 'screen:view'" }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          viewerRequestArg:
            "--request 'screen:view,input:pointer,input:keyboard' --request 'screen:view,input:pointer,input:keyboard'"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(commandPlanOutput({ viewerFrameOutputArg: null }))
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({ viewerFrameOutputArg: "--viewer-screen-frame-output 'frames\\drift.jpg'" })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          viewerFrameOutputArg:
            "--viewer-screen-frame-output 'frames\\latest.jpg' --viewer-screen-frame-output 'frames\\latest.jpg'"
        })
      )
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
          ok: true,
          mode: "session",
          nonExecuting: true,
          commands: commandPlanCommands().filter(
            (command) => command.name !== "preflight.ready-windows-control-smoke"
          )
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ok: true,
          mode: "session",
          nonExecuting: true,
          commands: commandPlanCommands().filter(
            (command) => command.name !== "preflight.ready-evidence-fixture"
          )
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ok: true,
          mode: "session",
          nonExecuting: true,
          commands: commandPlanCommands().filter(
            (command) => command.name !== "preflight.ready-all-smoke"
          )
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        JSON.stringify({
          ok: true,
          mode: "session",
          nonExecuting: true,
          commands: commandPlanCommands().filter(
            (command) => command.name !== "preflight.audit-summary"
          )
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          windowsControlSmokeCommand: "npm run mvp:ready -- --include-windows-input-smoke"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          evidenceFixtureReadyCommand: "npm run mvp:evidence-fixture -- --verify --json"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          auditSummaryCommand:
            "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl' --token raw-secret-token"
        })
      )
    ).toBe(false);
    expect(
      parseCommandPlanReadiness(
        commandPlanOutput({
          auditSummaryCommand:
            "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl'"
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
        ephemeralCommandPlanOutput({ hostConsentTimeoutArg: null })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ hostControlSurfaceArg: null })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ hostControlSurfaceArg: "--host-control-surface-port '35986'" })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ hostApplyInputArg: null })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ hostWindowsCaptureArg: "--dev-screen-frame-source 'static'" })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ viewerRequestArg: "--request 'screen:view'" })
      )
    ).toBe(false);
    expect(
      parseEphemeralCommandPlanReadiness(
        ephemeralCommandPlanOutput({ viewerFrameOutputArg: null })
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

  it("parses only fixed bounded preflight command-plan readiness metadata", () => {
    expect(parsePreflightCommandPlanReadiness(preflightCommandPlanOutput())).toBe(true);
    expect(
      parsePreflightCommandPlanReadiness(
        [
          "> winbridge@0.1.0 mvp:commands",
          "> node scripts/mvp-session-commands.mjs --only preflight --json",
          preflightCommandPlanOutput()
        ].join("\n")
      )
    ).toBe(true);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ missing: "preflight.ready-all-smoke" })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ missing: "preflight.ready-windows-control-smoke" })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ missing: "preflight.ready-evidence-fixture" })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ missing: "preflight.audit-summary" })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          windowsControlSmokeCommand: "npm run mvp:ready -- --include-windows-input-smoke"
        })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          evidenceFixtureReadyCommand: "npm run mvp:evidence-fixture -- --verify --json"
        })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          auditSummaryCommand:
            "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl' --token raw-secret-token"
        })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          auditSummaryCommand:
            "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl'"
        })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(preflightCommandPlanOutput()),
          commands: [
            ...preflightCommandPlanCommands(),
            {
              name: "preflight.audit-summary",
              command:
                "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl'"
            }
          ]
        })
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }),
        { expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }
      )
    ).toBe(true);
    expect(preflightCommandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" })).not.toContain(
      "$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_RELAY_SHARED_TOKEN"
    );
    expect(
      parsePreflightCommandPlanReadiness(preflightCommandPlanOutput(), {
        expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN"
      })
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          safety: ["Host consent and visible sessions are required before live assistance trials."]
        }),
        { expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({ tokenEnv: "WRONG_TOKEN_ENV" }),
        { expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          allSmokeCommand:
            "$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_TEST_RELAY_TOKEN; npm run mvp:ready -- --include-all-smoke"
        }),
        { expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }
      )
    ).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        preflightCommandPlanOutput({
          allSmokeCommand:
            "$env:WINBRIDGE_RELAY_SHARED_TOKEN = raw-secret-token; npm run mvp:ready -- --include-all-smoke"
        }),
        { expectedTokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" }
      )
    ).toBe(false);
    expect(parsePreflightCommandPlanReadiness(preflightCommandPlanOutput({ mode: "session" }))).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(preflightCommandPlanOutput({ nonExecuting: false }))
    ).toBe(false);
    expect(parsePreflightCommandPlanReadiness(commandPlanOutput())).toBe(false);
    expect(
      parsePreflightCommandPlanReadiness(
        JSON.stringify({
          ...JSON.parse(preflightCommandPlanOutput()),
          stdout: "raw-secret-token"
        })
      )
    ).toBe(false);
  });

  it("parses only reviewed MVP trial plan output", () => {
    expect(parseMvpTrialPlanReadiness(trialPlanOutput())).toBe(true);
    expect(
      parseMvpTrialPlanReadiness(
        trialPlanOutput(undefined, {
          roles: ["preflight", "relay", "host", "viewer", "evidence"].map((role) =>
            trialPlanRole(role as TrialPlanRole)
          )
        })
      )
    ).toBe(false);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput("browser"), { expectedRole: "browser" })).toBe(true);
    const planWithoutSessionBootstrap = JSON.parse(trialPlanOutput());
    planWithoutSessionBootstrap.roles = planWithoutSessionBootstrap.roles.map((section: { role: string; steps: unknown[] }) =>
      section.role === "preflight"
        ? {
            ...section,
            steps: section.steps.slice(1)
          }
        : section
    );
    expect(parseMvpTrialPlanReadiness(JSON.stringify(planWithoutSessionBootstrap))).toBe(false);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput("host"), { expectedRole: "host" })).toBe(true);
    expect(
      parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { relayHost: "192.168.1.10" }), {
        expectedRelayHost: "192.168.1.10"
      })
    ).toBe(true);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { relayHost: "192.168.1.10" }))).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(trialPlanOutput("viewer", { relayHost: "support-relay.lan" }), {
        expectedRole: "viewer",
        expectedRelayHost: "support-relay.lan"
      })
    ).toBe(true);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput("host"), { expectedRole: "viewer" })).toBe(false);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { mode: "evidence" }))).toBe(false);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { nonExecuting: false }))).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { roles: [trialPlanRole("host"), trialPlanRole("host")] }))
    ).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(trialPlanOutput("host", { roles: [trialPlanRole("host"), trialPlanRole("viewer")] }), {
        expectedRole: "host"
      })
    ).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { safety: trialPlanSafety().slice(1) }))
    ).toBe(false);
    expect(parseMvpTrialPlanReadiness(trialPlanOutput(undefined, { extra: { stdout: "raw-secret-token" } }))).toBe(
      false
    );
    expect(
      parseMvpTrialPlanReadiness(
        trialPlanOutput("host", {
          roles: [trialPlanRoleWithMutatedStep("host", "run-role", "--token-env WINBRIDGE_RELAY_SHARED_TOKEN", "--token raw-secret-token")]
        }),
        { expectedRole: "host" }
      )
    ).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(
        trialPlanOutput("host", {
          roles: [trialPlanRoleWithMutatedStep("host", "run-role", "--relay-host <relay-pc-lan-ip>", "--relay ws://192.168.1.10:8787/")]
        }),
        { expectedRole: "host" }
      )
    ).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(
        trialPlanOutput("host", {
          roles: [trialPlanRoleWithMutatedStep("host", "run-role", "--pairing <pairing-code>", "--pairing 123-456")]
        }),
        { expectedRole: "host" }
      )
    ).toBe(false);
    expect(
      parseMvpTrialPlanReadiness(
        trialPlanOutput("viewer", {
          roles: [trialPlanRoleWithMutatedStep("viewer", "run-role", " --i-understand-foreground", "")]
        }),
        { expectedRole: "viewer" }
      )
    ).toBe(false);
    expect(parseMvpTrialPlanReadiness("x".repeat(32769))).toBe(false);
  });

  it("parses only reviewed sanitized MVP role runner dry-run output", () => {
    for (const role of roleRunnerTargets() as Array<"relay" | "host" | "viewer">) {
      expect(parseMvpRoleRunnerDryRunReadiness(roleRunnerDryRunOutput(role), role)).toBe(true);
    }

    expect(parseMvpRoleRunnerDryRunReadiness(roleRunnerDryRunOutput("host"), "viewer")).toBe(false);
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        roleRunnerDryRunOutput("host", {
          args: roleRunnerDryRunArgsWithout("host", "--host-apply-input", "true")
        }),
        "host"
      )
    ).toBe(false);
    expect(parseMvpRoleRunnerDryRunReadiness(roleRunnerDryRunOutput("relay", { env: [] }), "relay")).toBe(false);
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        roleRunnerDryRunOutput("relay", {
          env: ["WINBRIDGE_RELAY_BIND_HOST", "WINBRIDGE_RELAY_SHARED_TOKEN", "UNREVIEWED_SECRET_ENV"]
        }),
        "relay"
      )
    ).toBe(false);
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        roleRunnerDryRunOutput("host", { env: ["UNREVIEWED_SECRET_ENV"] }),
        "host"
      )
    ).toBe(false);
    for (const extraArgs of [
      ["--token", "<unexpected-token>"],
      ["--pairing", "<unexpected-pairing>"],
      ["--relay", "wss://support.example/"],
      ["--audit-log", "C:\\sensitive\\audit.jsonl"],
      ["--credential", "<credential>"],
      ["--stdout", "<child-output>"]
    ]) {
      expect(
        parseMvpRoleRunnerDryRunReadiness(
          roleRunnerDryRunOutput("viewer", {
            args: [...roleRunnerDryRunArgs("viewer"), ...extraArgs]
          }),
          "viewer"
        )
      ).toBe(false);
    }
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        roleRunnerDryRunOutput("viewer", {
          args: [...roleRunnerDryRunArgs("viewer"), "234-567"]
        }),
        "viewer"
      )
    ).toBe(false);
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        [
          "> winbridge@0.1.0 mvp:run",
          "> node scripts/mvp-role-runner.mjs --session mvp-ready-runner --pairing 234-567",
          roleRunnerDryRunOutput("host")
        ].join("\n"),
        "host"
      )
    ).toBe(false);
    expect(
      parseMvpRoleRunnerDryRunReadiness(
        roleRunnerDryRunOutput("host", {
          extra: { stdout: "raw-secret-token" }
        }),
        "host"
      )
    ).toBe(false);
    expect(parseMvpRoleRunnerDryRunReadiness("x".repeat(32769), "host")).toBe(false);
  });

  it("parses only bounded target-specific role-filter command output", () => {
    for (const target of roleFilterTargets()) {
      expect(parseRoleFilteredCommandReadiness(roleFilterOutput(target), target)).toBe(true);
    }

    expect(
      parseRoleFilteredCommandReadiness(roleFilterOutput("host", { hostConsentTimeoutArg: null }), "host")
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("host", { hostConsentTimeoutArg: "--host-consent-timeout-ms '30000'" }),
        "host"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(roleFilterOutput("host", { hostControlSurfaceArg: null }), "host")
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("host", { hostControlSurfaceArg: "--host-control-surface-port '35986'" }),
        "host"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(roleFilterOutput("host", { hostApplyInputArg: null }), "host")
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("host", { hostApplyInputArg: "--host-apply-input 'false'" }),
        "host"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(roleFilterOutput("host", { hostWindowsCaptureArg: null }), "host")
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("host", { hostWindowsCaptureArg: "--dev-screen-frame-source 'static'" }),
        "host"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(roleFilterOutput("viewer", { viewerRequestArg: null }), "viewer")
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("viewer", { viewerRequestArg: "--request 'screen:view'" }),
        "viewer"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("viewer", { viewerFrameOutputArg: null }),
        "viewer"
      )
    ).toBe(false);
    expect(
      parseRoleFilteredCommandReadiness(
        roleFilterOutput("viewer", { viewerFrameOutputArg: "--viewer-screen-frame-output 'frames\\drift.jpg'" }),
        "viewer"
      )
    ).toBe(false);
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
    expect(parseLanRelayRoleFilteredCommandReadiness(lanRelayRoleFilterOutput({ tokenEnv: null }))).toBe(
      false
    );
    expect(
      parseLanRelayRoleFilteredCommandReadiness(
        lanRelayRoleFilterOutput({ relayCommand: "--token 'raw-secret-token'; npm run dev:relay" })
      )
    ).toBe(false);
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
    expect(
      parseLanAgentRoleFilteredCommandReadiness(
        roleFilterOutput("host", {
          relayUrl: "ws://192.168.1.10:8787/",
          tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'",
          hostApplyInputArg: null
        }),
        "host"
      )
    ).toBe(false);
    expect(
      parseLanAgentRoleFilteredCommandReadiness(
        roleFilterOutput("viewer", {
          relayUrl: "ws://192.168.1.10:8787/",
          tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'",
          viewerFrameOutputArg: null
        }),
        "viewer"
      )
    ).toBe(false);
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

  it("parses only reviewed token-env relay role-filter output", () => {
    expect(parseTokenEnvRelayRoleFilteredCommandReadiness(tokenEnvRelayRoleFilterOutput())).toBe(
      true
    );
    expect(parseTokenEnvRelayRoleFilteredCommandReadiness(roleFilterOutput("relay"))).toBe(false);
    expect(
      parseTokenEnvRelayRoleFilteredCommandReadiness(
        tokenEnvRelayRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
      )
    ).toBe(false);
    expect(
      parseTokenEnvRelayRoleFilteredCommandReadiness(
        `${tokenEnvRelayRoleFilterOutput()}\nhost command:\nnpm run dev:agent -- host`
      )
    ).toBe(false);
    expect(
      parseTokenEnvRelayRoleFilteredCommandReadiness(
        `${tokenEnvRelayRoleFilterOutput()}\n--token 'raw-secret-token'`
      )
    ).toBe(false);
    expect(parseTokenEnvRelayRoleFilteredCommandReadiness("x".repeat(32769))).toBe(false);
  });

  it("parses only reviewed token-env agent role-filter output", () => {
    expect(parseTokenEnvAgentRoleFilteredCommandReadiness(tokenEnvAgentRoleFilterOutput("host"), "host")).toBe(
      true
    );
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(tokenEnvAgentRoleFilterOutput("viewer"), "viewer")
    ).toBe(true);
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(
        roleFilterOutput("host", {
          tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN",
          tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'",
          hostWindowsCaptureArg: "--dev-screen-frame-source 'static'"
        }),
        "host"
      )
    ).toBe(false);
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(
        roleFilterOutput("viewer", {
          tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN",
          tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'",
          viewerRequestArg: "--request 'screen:view'"
        }),
        "viewer"
      )
    ).toBe(false);
    expect(parseTokenEnvAgentRoleFilteredCommandReadiness(roleFilterOutput("host"), "host")).toBe(false);
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(
        roleFilterOutput("host", { tokenArgument: "--token raw-secret-token" }),
        "host"
      )
    ).toBe(false);
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(tokenEnvAgentRoleFilterOutput("host"), "viewer")
    ).toBe(false);
    expect(
      parseTokenEnvAgentRoleFilteredCommandReadiness(
        `${tokenEnvAgentRoleFilterOutput("viewer")}\nhost command:\nnpm run dev:agent -- host`,
        "viewer"
      )
    ).toBe(false);
    expect(parseTokenEnvAgentRoleFilteredCommandReadiness("x".repeat(32769), "host")).toBe(false);
  });

  it("parses only reviewed token-env browser role-filter output", () => {
    expect(parseTokenEnvBrowserRoleFilteredCommandReadiness(tokenEnvBrowserRoleFilterOutput())).toBe(
      true
    );
    expect(
      parseTokenEnvBrowserRoleFilteredCommandReadiness(
        [
          "> winbridge@0.1.0 mvp:commands",
          "> node scripts/mvp-session-commands.mjs --only browser --token-env WINBRIDGE_RELAY_SHARED_TOKEN",
          tokenEnvBrowserRoleFilterOutput()
        ].join("\n")
      )
    ).toBe(true);
    expect(parseTokenEnvBrowserRoleFilteredCommandReadiness(roleFilterOutput("browser"))).toBe(false);
    expect(
      parseTokenEnvBrowserRoleFilteredCommandReadiness(
        tokenEnvBrowserRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
      )
    ).toBe(false);
    expect(
      parseTokenEnvBrowserRoleFilteredCommandReadiness(
        `${tokenEnvBrowserRoleFilterOutput()}\nviewer command:\nnpm run dev:agent -- viewer`
      )
    ).toBe(false);
    expect(
      parseTokenEnvBrowserRoleFilteredCommandReadiness(
        `${tokenEnvBrowserRoleFilterOutput()}\n--token raw-secret-token`
      )
    ).toBe(false);
    expect(
      parseTokenEnvBrowserRoleFilteredCommandReadiness(
        tokenEnvBrowserRoleFilterOutput({
          browserCommand:
            "Start-Process 'http://127.0.0.1:35987/' --token raw-secret-token"
        })
      )
    ).toBe(false);
    expect(parseTokenEnvBrowserRoleFilteredCommandReadiness("x".repeat(32769))).toBe(false);
  });

  it("parses only reviewed token-env preflight role-filter output", () => {
    expect(parseTokenEnvPreflightRoleFilteredCommandReadiness(tokenEnvPreflightRoleFilterOutput())).toBe(
      true
    );
    expect(
      parseTokenEnvPreflightRoleFilteredCommandReadiness(
        [
          "> winbridge@0.1.0 mvp:commands",
          "> node scripts/mvp-session-commands.mjs --only preflight --token-env WINBRIDGE_RELAY_SHARED_TOKEN",
          tokenEnvPreflightRoleFilterOutput()
        ].join("\n")
      )
    ).toBe(true);
    expect(parseTokenEnvPreflightRoleFilteredCommandReadiness(roleFilterOutput("preflight"))).toBe(false);
    expect(
      parseTokenEnvPreflightRoleFilteredCommandReadiness(
        tokenEnvPreflightRoleFilterOutput({ tokenEnv: "WRONG_TOKEN_ENV" })
      )
    ).toBe(false);
    expect(
      parseTokenEnvPreflightRoleFilteredCommandReadiness(
        `${tokenEnvPreflightRoleFilterOutput()}\nhost command:\nnpm run dev:agent -- host`
      )
    ).toBe(false);
    expect(
      parseTokenEnvPreflightRoleFilteredCommandReadiness(
        `${tokenEnvPreflightRoleFilterOutput()}\n--token raw-secret-token`
      )
    ).toBe(false);
    expect(
      parseTokenEnvPreflightRoleFilteredCommandReadiness(
        `${tokenEnvPreflightRoleFilterOutput()}\n--host-apply-input 'true'`
      )
    ).toBe(false);
    expect(parseTokenEnvPreflightRoleFilteredCommandReadiness("x".repeat(32769))).toBe(false);
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true }
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, skipped: true },
        { name: "lan-smoke", ok: true, skipped: true },
        { name: "token-smoke", ok: true, skipped: true },
        { name: "lan-token-smoke", ok: true, skipped: true },
        { name: "windows-capture-smoke", ok: true, skipped: true }
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
        { name: "preflight-json-command-plan", ok: true },
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
          name: "token-smoke",
          ok: true,
          checks: smokeSubchecks(),
          auditSummary: smokeAuditSummary(),
          output: "raw-secret-token"
        },
        {
          name: "lan-token-smoke",
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
        { name: "preflight-json-command-plan", ok: true },
        ...roleFilterCheckResults(),
        { name: "smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
        { name: "lan-token-smoke", ok: true, checks: smokeSubchecks(), auditSummary: smokeAuditSummary() },
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

function roleRunnerTargets() {
  return ["relay", "host", "viewer"];
}

function roleRunnerDryRunPlanSteps() {
  return roleRunnerTargets().map((role) => ({
    name: `role-runner-${role}-dry-run`,
    command: "npm",
    args: [
      "--silent",
      "run",
      "mvp:run",
      "--",
      "--role",
      role,
      "--session",
      "mvp-ready-runner",
      "--pairing",
      "234-567",
      "--relay-host",
      "192.168.1.10",
      "--token-env",
      "WINBRIDGE_RELAY_SHARED_TOKEN",
      "--dry-run",
      "--json"
    ]
  }));
}

function roleFilterPlanSteps() {
  return [
    {
      name: "token-role-filter-preflight-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "preflight",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    ...roleFilterTargets().map((target) => ({
      name: `role-filter-${target}-command`,
      command: "npm",
      args: ["run", "mvp:commands", "--", "--only", target]
    })),
    {
      name: "lan-role-filter-relay-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "relay",
        "--relay-host",
        "192.168.1.10",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "lan-role-filter-host-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "host",
        "--relay-host",
        "192.168.1.10",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "lan-role-filter-viewer-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "viewer",
        "--relay-host",
        "192.168.1.10",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "token-role-filter-relay-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "relay",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "token-role-filter-host-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "host",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "token-role-filter-viewer-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "viewer",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
    },
    {
      name: "token-role-filter-browser-command",
      command: "npm",
      args: [
        "run",
        "mvp:commands",
        "--",
        "--only",
        "browser",
        "--token-env",
        "WINBRIDGE_RELAY_SHARED_TOKEN"
      ]
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
    "preflight-json-command-plan",
    "preflight-token-json-command-plan",
    "trial-plan",
    ...roleRunnerTargets().map((role) => `role-runner-${role}-dry-run`),
    "token-role-filter-preflight-command",
    ...roleFilterTargets().map((target) => `role-filter-${target}-command`),
    "lan-role-filter-relay-command",
    "lan-role-filter-host-command",
    "lan-role-filter-viewer-command",
    "token-role-filter-relay-command",
    "token-role-filter-host-command",
    "token-role-filter-viewer-command",
    "token-role-filter-browser-command",
    "ephemeral-role-filter-browser-command"
  ];
}

function roleFilterCheckResults() {
  return [
    { name: "preflight-token-json-command-plan", ok: true },
    { name: "trial-plan", ok: true },
    ...roleRunnerTargets().map((role) => ({
      name: `role-runner-${role}-dry-run`,
      ok: true
    })),
    { name: "token-role-filter-preflight-command", ok: true },
    ...roleFilterTargets().map((target) => ({
      name: `role-filter-${target}-command`,
      ok: true
    })),
    { name: "lan-role-filter-relay-command", ok: true },
    { name: "lan-role-filter-host-command", ok: true },
    { name: "lan-role-filter-viewer-command", ok: true },
    { name: "token-role-filter-relay-command", ok: true },
    { name: "token-role-filter-host-command", ok: true },
    { name: "token-role-filter-viewer-command", ok: true },
    { name: "token-role-filter-browser-command", ok: true },
    { name: "ephemeral-role-filter-browser-command", ok: true }
  ];
}

function roleFilterOutputForStep(name: string) {
  if (name === "preflight-token-json-command-plan") {
    return preflightCommandPlanOutput({ tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN" });
  }
  if (name === "trial-plan") {
    return trialPlanOutput();
  }
  if (name === "role-runner-relay-dry-run") {
    return roleRunnerDryRunOutput("relay");
  }
  if (name === "role-runner-host-dry-run") {
    return roleRunnerDryRunOutput("host");
  }
  if (name === "role-runner-viewer-dry-run") {
    return roleRunnerDryRunOutput("viewer");
  }
  if (name === "trial-role-relay-plan") {
    return trialPlanOutput("relay");
  }
  if (name === "trial-role-host-plan") {
    return trialPlanOutput("host");
  }
  if (name === "trial-role-viewer-plan") {
    return trialPlanOutput("viewer");
  }
  if (name === "trial-role-browser-plan") {
    return trialPlanOutput("browser");
  }
  if (name === "token-role-filter-preflight-command") {
    return tokenEnvPreflightRoleFilterOutput();
  }
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
  if (name === "token-role-filter-relay-command") {
    return tokenEnvRelayRoleFilterOutput();
  }
  if (name === "token-role-filter-host-command") {
    return tokenEnvAgentRoleFilterOutput("host");
  }
  if (name === "token-role-filter-viewer-command") {
    return tokenEnvAgentRoleFilterOutput("viewer");
  }
  if (name === "token-role-filter-browser-command") {
    return tokenEnvBrowserRoleFilterOutput();
  }

  const prefix = "role-filter-";
  const suffix = "-command";
  if (!name.startsWith(prefix) || !name.endsWith(suffix)) {
    return undefined;
  }

  const target = name.slice(prefix.length, -suffix.length);
  return roleFilterTargets().includes(target) ? roleFilterOutput(target) : undefined;
}

function roleRunnerDryRunOutput(
  role: "relay" | "host" | "viewer",
  options: { args?: string[]; env?: string[]; extra?: Record<string, unknown> } = {}
) {
  const args =
    options.args ??
    (role === "relay"
      ? ["run", "dev:relay"]
      : role === "host"
        ? [
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
            "--name",
            "<display-name>",
            "--host-consent-prompt",
            "true",
            "--host-consent-timeout-ms",
            "60000",
            "--visible-session",
            "true",
            "--host-control-prompt",
            "true",
            "--host-control-surface-port",
            "0",
            "--host-signal-probe-ack",
            "true",
            "--audit-log",
            "<audit-log>",
            "--host-apply-input",
            "true",
            "--dev-screen-frame-after-ms",
            "1000",
            "--dev-screen-frame-source",
            "windows-capture",
            "--dev-screen-frame-count",
            "600",
            "--dev-screen-frame-interval-ms",
            "1000",
            "--token-env",
            "<token-env>"
          ]
        : [
            "run",
            "dev:agent",
            "--",
            "viewer",
            "--relay",
            "<relay-url>",
            "--session",
            "<session-id>",
            "--pairing",
            "<pairing-code>",
            "--name",
            "<display-name>",
            "--request",
            "screen:view,input:pointer,input:keyboard",
            "--request-reason",
            "<request-reason>",
            "--viewer-signal-probe-after-ms",
            "1000",
            "--audit-log",
            "<audit-log>",
            "--viewer-screen-frame-output",
            "<frame-output>",
            "--viewer-control-surface-port",
            "35987",
            "--token-env",
            "<token-env>"
          ]);

  return JSON.stringify({
    ok: true,
    mode: "role-runner",
    role,
    foreground: true,
    nonExecuting: true,
    command: "npm",
    args,
    env:
      options.env ??
      (role === "relay" ? ["WINBRIDGE_RELAY_BIND_HOST", "WINBRIDGE_RELAY_SHARED_TOKEN"] : []),
    ...(options.extra ?? {})
  });
}

function roleRunnerDryRunArgs(role: "relay" | "host" | "viewer") {
  return JSON.parse(roleRunnerDryRunOutput(role)).args as string[];
}

function roleRunnerDryRunArgsWithout(
  role: "relay" | "host" | "viewer",
  option: string,
  value: string
) {
  return roleRunnerDryRunArgs(role).filter((arg, index, args) => {
    if (arg === option && args[index + 1] === value) {
      return false;
    }
    return !(arg === value && args[index - 1] === option);
  });
}

function roleFilterOutput(
  target: string,
  options: {
    browserCommand?: string;
    hostApplyInputArg?: string | null;
    hostControlSurfaceArg?: string | null;
    hostConsentTimeoutArg?: string | null;
    hostWindowsCaptureArg?: string | null;
    relayCommand?: string;
    relayUrl?: string;
    tokenArgument?: string;
    tokenEnv?: string;
    viewerFrameOutputArg?: string | null;
    viewerRequestArg?: string | null;
  } = {}
) {
  if (target === "preflight") {
    return [
      "# WinBridge MVP preflight commands",
      "Run each command manually in a visible PowerShell terminal before a two-PC MVP trial.",
      ...(options.tokenEnv
        ? [
            "Token mode:",
            `- Set $env:${options.tokenEnv} to the bounded local relay token before running these commands.`,
            "- The token value is referenced through the environment and is not printed here."
          ]
        : []),
      "0. Preflight before the two-PC trial:",
      "- On each Windows machine:",
      "npm run mvp:ready",
      "- Individual troubleshooting checks:",
      "npm run mvp:doctor",
      "npm run mvp:native-preflight",
      "- On one local development machine before the two-PC trial:",
      "npm run mvp:smoke",
      "- Full local smoke coverage before the two-PC trial:",
      ...(options.tokenEnv
        ? [
            options.tokenEnv === "WINBRIDGE_RELAY_SHARED_TOKEN"
              ? "npm run mvp:ready -- --include-all-smoke"
              : `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:${options.tokenEnv}; npm run mvp:ready -- --include-all-smoke`
          ]
        : [
            "Set $env:WINBRIDGE_RELAY_SHARED_TOKEN, then run:",
            "npm run mvp:ready -- --include-all-smoke"
          ]),
      "- Explicit native Windows control smoke before the two-PC trial:",
      "npm run mvp:ready -- --include-windows-control-smoke",
      "- Local evidence fixture dry run before the live two-PC trial:",
      "npm run mvp:ready -- --include-evidence-fixture",
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
      `npm run dev:agent -- host --relay '${options.relayUrl ?? "ws://localhost:8787/"}' --session 'demo' --pairing '123-456' --name 'WinBridge Assisted Host' --host-consent-prompt 'true'${options.hostConsentTimeoutArg === null ? "" : ` ${options.hostConsentTimeoutArg ?? "--host-consent-timeout-ms '60000'"}`} --visible-session 'true' --host-control-prompt 'true'${options.hostControlSurfaceArg === null ? "" : ` ${options.hostControlSurfaceArg ?? "--host-control-surface-port '0'"}`} --host-signal-probe-ack 'true' --audit-log 'logs\\host-audit.jsonl'${options.hostApplyInputArg === null ? "" : ` ${options.hostApplyInputArg ?? "--host-apply-input 'true'"}`} --dev-screen-frame-after-ms '1000'${options.hostWindowsCaptureArg === null ? "" : ` ${options.hostWindowsCaptureArg ?? "--dev-screen-frame-source 'windows-capture'"}`} --dev-screen-frame-count '600' --dev-screen-frame-interval-ms '1000'${options.tokenArgument ? ` ${options.tokenArgument}` : ""}`,
      "Host controls:",
      "help | status | pause | resume | revoke screen:view | revoke input:pointer | revoke input:keyboard | terminate | disconnect"
    ],
    viewer: [
      "viewer command:",
      `npm run dev:agent -- viewer --relay '${options.relayUrl ?? "ws://localhost:8787/"}' --session 'demo' --pairing '123-456' --name 'WinBridge Support Viewer'${options.viewerRequestArg === null ? "" : ` ${options.viewerRequestArg ?? "--request 'screen:view,input:pointer,input:keyboard'"}`} --request-reason 'MVP remote assistance session' --viewer-signal-probe-after-ms '1000' --audit-log 'logs\\viewer-audit.jsonl'${options.viewerFrameOutputArg === null ? "" : ` ${options.viewerFrameOutputArg ?? "--viewer-screen-frame-output 'frames\\latest.jpg'"}`} --viewer-control-surface-port '35987'${options.tokenArgument ? ` ${options.tokenArgument}` : ""}`,
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
    ...(options.tokenEnv
      ? [
          "Token mode:",
          `- Set $env:${options.tokenEnv} to the bounded local relay token before running these commands.`,
          "- The token value is referenced through the environment and is not printed here."
        ]
      : []),
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

function lanRelayRoleFilterOutput(options: { relayCommand?: string; tokenEnv?: string | null } = {}) {
  return roleFilterOutput("relay", {
    relayUrl: "ws://192.168.1.10:8787/",
    ...(options.tokenEnv === null
      ? {}
      : { tokenEnv: options.tokenEnv ?? "WINBRIDGE_RELAY_SHARED_TOKEN" }),
    relayCommand:
      options.relayCommand ??
      "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay"
  });
}

function lanAgentRoleFilterOutput(target: "host" | "viewer") {
  return roleFilterOutput(target, {
    relayUrl: "ws://192.168.1.10:8787/",
    tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'"
  });
}

function tokenEnvAgentRoleFilterOutput(target: "host" | "viewer") {
  return roleFilterOutput(target, {
    tokenEnv: "WINBRIDGE_RELAY_SHARED_TOKEN",
    tokenArgument: "--token-env 'WINBRIDGE_RELAY_SHARED_TOKEN'"
  });
}

function tokenEnvRelayRoleFilterOutput(options: { tokenEnv?: string; relayCommand?: string } = {}) {
  return roleFilterOutput("relay", {
    tokenEnv: options.tokenEnv ?? "WINBRIDGE_RELAY_SHARED_TOKEN",
    ...(options.relayCommand ? { relayCommand: options.relayCommand } : {})
  });
}

function tokenEnvBrowserRoleFilterOutput(options: { browserCommand?: string; tokenEnv?: string } = {}) {
  return roleFilterOutput("browser", {
    tokenEnv: options.tokenEnv ?? "WINBRIDGE_RELAY_SHARED_TOKEN",
    ...(options.browserCommand ? { browserCommand: options.browserCommand } : {})
  });
}

function tokenEnvPreflightRoleFilterOutput(options: { tokenEnv?: string } = {}) {
  return roleFilterOutput("preflight", {
    tokenEnv: options.tokenEnv ?? "WINBRIDGE_RELAY_SHARED_TOKEN"
  });
}

function roleFilterReadyReminder(target: string) {
  const role = target === "browser" ? "viewer" : target;
  return `Preflight reminder: run npm run mvp:ready -- --role ${role} on this machine before a live trial.`;
}

type TrialPlanRole = "preflight" | "relay" | "host" | "viewer" | "browser" | "evidence";

function trialPlanOutput(
  role?: TrialPlanRole,
  overrides: {
    mode?: string;
    nonExecuting?: boolean;
    relayHost?: string;
    roles?: unknown[];
    safety?: string[];
    extra?: Record<string, unknown>;
  } = {}
) {
  const roles = overrides.roles ?? (role
    ? [trialPlanRole(role, overrides.relayHost)]
    : ["preflight", "relay", "host", "viewer", "browser", "evidence"].map((item) =>
        trialPlanRole(item as TrialPlanRole, overrides.relayHost)
      ));
  return JSON.stringify({
    ok: true,
    mode: overrides.mode ?? "plan",
    nonExecuting: overrides.nonExecuting ?? true,
    roles,
    safety: overrides.safety ?? trialPlanSafety(),
    ...(overrides.extra ?? {})
  });
}

function trialPlanRole(role: TrialPlanRole, relayHost?: string) {
  const relayHostValue = relayHost ?? "<relay-pc-lan-ip>";
  const sections = {
    preflight: {
      role: "preflight",
      title: "Preflight dry run",
      steps: [
        {
          name: "session-bootstrap",
          command: `npm run mvp:commands -- --generate-session --generate-pairing --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        { name: "evidence-fixture", command: "npm run mvp:ready -- --include-evidence-fixture" },
        {
          name: "operator-check",
          command:
            "This generated local fixture dry run proves strict evidence gate wiring only; live trial proof still requires post-run role-bound evidence."
        }
      ]
    },
    relay: {
      role: "relay",
      title: "Relay PC",
      steps: [
        { name: "readiness", command: "npm run mvp:ready -- --role relay" },
        {
          name: "print-command",
          command:
            `npm run mvp:commands -- --only relay --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "run-role",
          command:
            `npm run mvp:run -- --role relay --session <session-id> --pairing <pairing-code> --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground`
        },
        {
          name: "operator-check",
          command:
            "Replace the session and pairing placeholders from preflight, then run the relay role in a visible PowerShell terminal."
        }
      ]
    },
    host: {
      role: "host",
      title: "Host PC",
      steps: [
        { name: "readiness", command: "npm run mvp:ready -- --role host" },
        {
          name: "print-command",
          command:
            `npm run mvp:commands -- --only host --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "lan-probe",
          command:
            `npm run mvp:lan-probe -- --role host --relay-host ${relayHostValue} --session <session-id> --pairing <pairing-code> --peer host-probe --device host-device --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "run-role",
          command:
            `npm run mvp:run -- --role host --session <session-id> --pairing <pairing-code> --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground`
        },
        {
          name: "operator-check",
          command:
            "Replace the session and pairing placeholders from preflight, approve only the visible host consent prompt, and keep pause, revoke, terminate, and disconnect controls available."
        }
      ]
    },
    viewer: {
      role: "viewer",
      title: "Viewer PC",
      steps: [
        { name: "readiness", command: "npm run mvp:ready -- --role viewer" },
        {
          name: "print-viewer-command",
          command:
            `npm run mvp:commands -- --only viewer --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "print-browser-command",
          command:
            `npm run mvp:commands -- --only browser --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "lan-probe",
          command:
            `npm run mvp:lan-probe -- --role viewer --relay-host ${relayHostValue} --session <session-id> --pairing <pairing-code> --peer viewer-probe --device viewer-device --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "run-role",
          command:
            `npm run mvp:run -- --role viewer --session <session-id> --pairing <pairing-code> --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN --i-understand-foreground`
        },
        {
          name: "operator-check",
          command:
            "Replace the session and pairing placeholders from preflight, then open the loopback viewer surface only after the viewer command reports readiness."
        }
      ]
    },
    browser: {
      role: "browser",
      title: "Viewer browser",
      steps: [
        { name: "readiness", command: "npm run mvp:ready -- --role viewer" },
        {
          name: "print-browser-command",
          command:
            `npm run mvp:commands -- --only browser --relay-host ${relayHostValue} --token-env WINBRIDGE_RELAY_SHARED_TOKEN`
        },
        {
          name: "operator-check",
          command:
            "Open the loopback viewer surface only after the viewer command reports readiness and prints the bounded local surface URL."
        }
      ]
    },
    evidence: {
      role: "evidence",
      title: "Post-run evidence",
      steps: [
        {
          name: "strict-evidence",
          command:
            "npm run mvp:trial -- --evidence --host-audit <host-audit-jsonl> --viewer-audit <viewer-audit-jsonl>"
        },
        {
          name: "underlying-gate",
          command:
            "npm run mvp:audit-summary -- --host <host-audit-jsonl> --viewer <viewer-audit-jsonl> --require-mvp-evidence"
        },
        {
          name: "operator-check",
          command: "Treat the two-PC MVP trial as unproven until strict role-bound evidence passes."
        }
      ]
    }
  };
  return sections[role];
}

function trialPlanRoleWithMutatedStep(
  role: Exclude<TrialPlanRole, "preflight" | "evidence">,
  stepName: string,
  search: string,
  replacement: string
) {
  const section = trialPlanRole(role);
  return {
    ...section,
    steps: section.steps.map((step) =>
      step.name === stepName ? { ...step, command: step.command.replace(search, replacement) } : step
    )
  };
}

function trialPlanSafety() {
  return [
    "host-consent-required",
    "host-visible-session-required",
    "host-can-pause-revoke-disconnect",
    "strict-audit-evidence-required",
    "plan-is-non-executing"
  ];
}

function smokeSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "indicator", ok: true },
    { name: "host-surface", ok: true },
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

function windowsInputSmokeSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "indicator", ok: true },
    { name: "host-surface", ok: true },
    { name: "frame", ok: true },
    { name: "surface", ok: true },
    { name: "signal", ok: true },
    { name: "surface-guards", ok: true },
    { name: "input", ok: true },
    { name: "windows-input", ok: true },
    { name: "audit", ok: true },
    { name: "lifecycle", ok: true },
    { name: "viewer-disconnect", ok: true }
  ];
}

function smokeFailureSubchecks() {
  return [
    { name: "relay", ok: true },
    { name: "indicator", ok: true },
    { name: "host-surface", ok: true },
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
      permissionRevoked: true,
      disconnectObserved: true
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
      permissionRevoked: false,
      disconnectObserved: true
    }
  };
}

function evidenceFixtureOutput(
  options: {
    ok?: boolean;
    hostRecords?: number;
    viewerRecords?: number;
    verified?: boolean;
  } = {}
) {
  return JSON.stringify({
    ok: options.ok ?? true,
    hostRecords: options.hostRecords ?? 5,
    viewerRecords: options.viewerRecords ?? 3,
    verified: options.verified ?? true
  });
}

type CommandPlanFixtureOptions = {
  relayUrl?: string;
  tokenEnv?: string | null;
  relayBindHost?: string | null;
  viewerSurfacePort?: number;
  browserCommand?: string;
  hostControlSurfaceArg?: string | null;
  hostConsentTimeoutArg?: string | null;
  hostApplyInputArg?: string | null;
  hostWindowsCaptureArg?: string | null;
  viewerRequestArg?: string | null;
  viewerFrameOutputArg?: string | null;
  windowsControlSmokeCommand?: string;
  evidenceFixtureReadyCommand?: string;
  auditSummaryCommand?: string;
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

function preflightCommandPlanOutput(
  options: {
    allSmokeCommand?: string;
    windowsControlSmokeCommand?: string;
    evidenceFixtureReadyCommand?: string;
    missing?: string;
    mode?: string;
    nonExecuting?: boolean;
    safety?: string[];
    tokenEnv?: string;
  } = {}
) {
  return JSON.stringify({
    ok: true,
    mode: options.mode ?? "preflight",
    nonExecuting: options.nonExecuting ?? true,
    commands: preflightCommandPlanCommands(options).filter((command) => command.name !== options.missing),
    safety: options.safety ?? commandPlanSafety(options.tokenEnv)
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
  const tokenEnv = effectiveCommandPlanTokenEnv(relayUrl, options.tokenEnv);
  const tokenArg = tokenEnv ? ` --token-env '${tokenEnv}'` : "";
  const hostConsentTimeoutArg = Object.hasOwn(options, "hostConsentTimeoutArg")
    ? options.hostConsentTimeoutArg
    : "--host-consent-timeout-ms '60000'";
  const hostControlSurfaceArg = Object.hasOwn(options, "hostControlSurfaceArg")
    ? options.hostControlSurfaceArg
    : "--host-control-surface-port '0'";
  const hostApplyInputArg = Object.hasOwn(options, "hostApplyInputArg")
    ? options.hostApplyInputArg
    : "--host-apply-input 'true'";
  const hostWindowsCaptureArg = Object.hasOwn(options, "hostWindowsCaptureArg")
    ? options.hostWindowsCaptureArg
    : "--dev-screen-frame-source 'windows-capture'";
  const viewerRequestArg = Object.hasOwn(options, "viewerRequestArg")
    ? options.viewerRequestArg
    : "--request 'screen:view,input:pointer,input:keyboard'";
  const viewerFrameOutputArg = Object.hasOwn(options, "viewerFrameOutputArg")
    ? options.viewerFrameOutputArg
    : "--viewer-screen-frame-output 'frames\\latest.jpg'";
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
    {
      name: "preflight.ready-all-smoke",
      command: allSmokePreflightCommand(tokenEnv)
    },
    {
      name: "preflight.ready-windows-control-smoke",
      command:
        options.windowsControlSmokeCommand ??
        "npm run mvp:ready -- --include-windows-control-smoke"
    },
    {
      name: "preflight.ready-evidence-fixture",
      command:
        options.evidenceFixtureReadyCommand ??
        "npm run mvp:ready -- --include-evidence-fixture"
    },
    {
      name: "preflight.audit-summary",
      command: auditSummaryCommand(options.auditSummaryCommand)
    },
    { name: "relay", command: relayCommand },
    {
      name: "host",
      command: `npm run dev:agent -- host --relay '${relayUrl}' --pairing '123-456' --host-consent-prompt 'true'${hostConsentTimeoutArg ? ` ${hostConsentTimeoutArg}` : ""}${hostControlSurfaceArg ? ` ${hostControlSurfaceArg}` : ""}${hostApplyInputArg ? ` ${hostApplyInputArg}` : ""}${hostWindowsCaptureArg ? ` ${hostWindowsCaptureArg}` : ""}${tokenArg}`
    },
    {
      name: "viewer",
      command: `npm run dev:agent -- viewer --relay '${relayUrl}' --pairing '123-456'${viewerRequestArg ? ` ${viewerRequestArg}` : ""}${viewerFrameOutputArg ? ` ${viewerFrameOutputArg}` : ""}${tokenArg}${viewerSurfaceArg}`
    },
    { name: "browser", command: options.browserCommand ?? "Start-Process 'http://127.0.0.1:35987/'" }
  ];
}

function effectiveCommandPlanTokenEnv(relayUrl: string, tokenEnv: string | null | undefined) {
  if (tokenEnv !== undefined) {
    return tokenEnv ?? undefined;
  }

  const hostname = new URL(relayUrl).hostname.toLowerCase();
  return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname)
    ? undefined
    : "WINBRIDGE_RELAY_SHARED_TOKEN";
}

function preflightCommandPlanCommands(
  options: {
    allSmokeCommand?: string;
    windowsControlSmokeCommand?: string;
    evidenceFixtureReadyCommand?: string;
    auditSummaryCommand?: string;
    tokenEnv?: string;
  } = {}
) {
  return [
    { name: "preflight.ready", command: "npm run mvp:ready" },
    { name: "preflight.doctor", command: "npm run mvp:doctor" },
    { name: "preflight.native", command: "npm run mvp:native-preflight" },
    { name: "preflight.smoke", command: "npm run mvp:smoke" },
    {
      name: "preflight.ready-all-smoke",
      command: options.allSmokeCommand ?? allSmokePreflightCommand(options.tokenEnv)
    },
    {
      name: "preflight.ready-windows-control-smoke",
      command:
        options.windowsControlSmokeCommand ??
        "npm run mvp:ready -- --include-windows-control-smoke"
    },
    {
      name: "preflight.ready-evidence-fixture",
      command:
        options.evidenceFixtureReadyCommand ??
        "npm run mvp:ready -- --include-evidence-fixture"
    },
    {
      name: "preflight.audit-summary",
      command: auditSummaryCommand(options.auditSummaryCommand)
    }
  ];
}

function auditSummaryCommand(command: string | undefined) {
  return (
    command ??
    "npm run mvp:audit-summary -- --host 'logs\\host-audit.jsonl' --viewer 'logs\\viewer-audit.jsonl' --require-mvp-evidence"
  );
}

function allSmokePreflightCommand(tokenEnv: string | undefined) {
  if (!tokenEnv || tokenEnv === "WINBRIDGE_RELAY_SHARED_TOKEN") {
    return "npm run mvp:ready -- --include-all-smoke";
  }

  return `$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:${tokenEnv}; npm run mvp:ready -- --include-all-smoke`;
}

function commandPlanSafety(tokenEnv?: string) {
  return [
    "Host consent and visible sessions are required before live assistance trials.",
    "This helper prints commands only.",
    "Do not share generated output outside the trusted test session.",
    ...(tokenEnv
      ? [`Token mode references $env:${tokenEnv}; the raw token value is not printed.`]
      : [])
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
