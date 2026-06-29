import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  formatMvpSessionCommandKitError,
  MvpSessionCommandKitUsageError,
  parseMvpSessionCommandArgs,
  renderMvpSessionCommands
} from "./mvp-session-commands.mjs";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(scriptDirectory, "mvp-session-commands.mjs");
const rootPackageJsonPath = join(scriptDirectory, "..", "package.json");

describe("MVP session command kit", () => {
  it("prints visible relay, host, viewer, and browser steps for defaults", () => {
    const output = renderMvpSessionCommands(parseMvpSessionCommandArgs([]));

    expect(output).toContain("0. Preflight before the two-PC trial:");
    expect(output).toContain("On each Windows machine:");
    expect(output).toContain("npm run mvp:ready");
    expect(output).toContain("Individual troubleshooting checks:");
    expect(output).toContain("npm run mvp:doctor");
    expect(output).toContain("npm run mvp:native-preflight");
    expect(output).toContain("npm run mvp:smoke");
    expect(output).toContain("Full local smoke coverage before the two-PC trial:");
    expect(output).toContain("Set $env:WINBRIDGE_RELAY_SHARED_TOKEN, then run:");
    expect(output).toContain("npm run mvp:ready -- --include-all-smoke");
    expect(output).toContain("Relay address:");
    expect(output).toContain("Current relay URL: ws://localhost:8787/");
    expect(output).toContain("localhost relay URLs are same-machine only");
    expect(output).toContain("rerun this helper with --relay-host <relay-pc-lan-ip>");
    expect(output).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
    expect(output).not.toContain("WINBRIDGE_RELAY_PORT");
    expect(output).toContain("npm run dev:relay");
    expect(output).toContain("npm run dev:agent -- host");
    expect(output).toContain("--name 'WinBridge Assisted Host'");
    expect(output).toContain("--host-consent-prompt 'true'");
    expect(output).not.toContain("--host-decision 'approve'");
    expect(output).toContain("--visible-session 'true'");
    expect(output).toContain("--host-control-prompt 'true'");
    expect(output).toContain("--host-signal-probe-ack 'true'");
    expect(output).toContain("--audit-log 'logs\\host-audit.jsonl'");
    expect(output).toContain("--host-apply-input 'true'");
    expect(output).toContain("--dev-screen-frame-source 'windows-capture'");
    expect(output).toContain("--dev-screen-frame-count '600'");
    expect(output).toContain("Host frame stream: 600 finite frame(s) at 1000 ms intervals.");
    expect(output).toContain("Duration shortcut: 10 minute(s)");
    expect(output).toContain("npm run dev:agent -- viewer");
    expect(output).toContain("--name 'WinBridge Support Viewer'");
    expect(output).toContain("--request 'screen:view,input:pointer,input:keyboard'");
    expect(output).toContain("--request-reason 'MVP remote assistance session'");
    expect(output).toContain("--viewer-signal-probe-after-ms '1000'");
    expect(output).toContain("--viewer-screen-frame-output 'frames\\latest.jpg'");
    expect(output).toContain("--viewer-control-surface-port '35987'");
    expect(output).toContain("Signal readiness:");
    expect(output).toContain("Viewer sends one bounded readiness probe 1000 ms");
    expect(output).toContain("Host acknowledgement is metadata-only");
    expect(output).toContain("4. Browser on the viewer PC:");
    expect(output).toContain("Start-Process 'http://127.0.0.1:35987/'");
    expect(output).toContain("Wait for frame=ready before browser pointer control.");
    expect(output).toContain("Click the visible Pointer Off/On control");
    expect(output).toContain("pause | resume");
    expect(output).toContain("Run the preflight commands manually");
    expect(output).toContain("This helper printed commands only");
  });

  it("uses token environment references without accepting raw token values", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--token-env", "WINBRIDGE_TEST_RELAY_TOKEN"])
    );

    expect(output).toContain("$env:WINBRIDGE_TEST_RELAY_TOKEN");
    expect(output).toContain(
      "$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_TEST_RELAY_TOKEN; npm run dev:relay"
    );
    expect(output).toContain(
      "$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_TEST_RELAY_TOKEN; npm run mvp:ready -- --include-all-smoke"
    );
    expect(output).toContain("--token $env:WINBRIDGE_TEST_RELAY_TOKEN");
    expect(output).not.toContain("dev-shared-token");
  });

  it("prints only bounded readiness commands for preflight-only mode", () => {
    const output = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--preflight-only"]));

    expect(output).toContain("# WinBridge MVP preflight commands");
    expect(output).toContain("0. Preflight before the two-PC trial:");
    expect(output).toContain("On each Windows machine:");
    expect(output).toContain("npm run mvp:ready");
    expect(output).toContain("Individual troubleshooting checks:");
    expect(output).toContain("npm run mvp:doctor");
    expect(output).toContain("npm run mvp:native-preflight");
    expect(output).toContain("npm run mvp:smoke");
    expect(output).toContain("Full local smoke coverage before the two-PC trial:");
    expect(output).toContain("npm run mvp:ready -- --include-all-smoke");
    expect(output).toContain("Host consent and visible sessions are required");
    expect(output).toContain("This helper printed commands only");
    expect(output).not.toContain("Relay address:");
    expect(output).not.toContain("npm run dev:relay");
    expect(output).not.toContain("npm run dev:agent -- host");
    expect(output).not.toContain("npm run dev:agent -- viewer");
    expect(output).not.toContain("Start-Process");
    expect(output).not.toContain("--host-apply-input");
    expect(output).not.toContain("--request 'screen:view,input:pointer,input:keyboard'");
    expect(output).not.toContain("--viewer-control-surface-port");
    expect(output).not.toContain("--dev-screen-frame-source");
    expect(output).not.toContain("Pointer Off/On");
    expect(output).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
    expect(output).not.toContain("WINBRIDGE_RELAY_PORT");
    expect(output).not.toContain("dev-shared-token");
  });

  it("prints only the selected bounded command target", () => {
    const relay = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--only", "relay"]));
    expect(relay).toContain("# WinBridge MVP relay command");
    expect(relay).toContain("Preflight reminder: run npm run mvp:ready -- --role relay on this machine before a live trial.");
    expect(relay).toContain("relay command:");
    expect(relay).toContain("npm run dev:relay");
    expect(relay).not.toContain("npm run dev:agent -- host");
    expect(relay).not.toContain("npm run dev:agent -- viewer");
    expect(relay).not.toContain("Start-Process");

    const host = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--only", "host"]));
    expect(host).toContain("# WinBridge MVP host command");
    expect(host).toContain("Preflight reminder: run npm run mvp:ready -- --role host on this machine before a live trial.");
    expect(host).toContain("host command:");
    expect(host).toContain("npm run dev:agent -- host");
    expect(host).toContain("--host-consent-prompt 'true'");
    expect(host).toContain("--pairing '123-456'");
    expect(host).toContain("pause | resume");
    expect(host).not.toContain("npm run dev:relay");
    expect(host).not.toContain("npm run dev:agent -- viewer");
    expect(host).not.toContain("Start-Process");

    const viewer = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--only", "viewer"]));
    expect(viewer).toContain("# WinBridge MVP viewer command");
    expect(viewer).toContain("Preflight reminder: run npm run mvp:ready -- --role viewer on this machine before a live trial.");
    expect(viewer).toContain("viewer command:");
    expect(viewer).toContain("npm run dev:agent -- viewer");
    expect(viewer).toContain("--pairing '123-456'");
    expect(viewer).toContain("Open the separate browser command");
    expect(viewer).not.toContain("npm run dev:relay");
    expect(viewer).not.toContain("npm run dev:agent -- host");
    expect(viewer).not.toContain("Start-Process");

    const browser = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--only", "browser"]));
    expect(browser).toContain("# WinBridge MVP browser command");
    expect(browser).toContain("Preflight reminder: run npm run mvp:ready -- --role viewer on this machine before a live trial.");
    expect(browser).toContain("browser command:");
    expect(browser).toContain("Start-Process 'http://127.0.0.1:35987/'");
    expect(browser).toContain("Wait for frame=ready");
    expect(browser).not.toContain("npm run dev:relay");
    expect(browser).not.toContain("npm run dev:agent -- host");
    expect(browser).not.toContain("npm run dev:agent -- viewer");

    const preflight = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--only", "preflight"]));
    expect(preflight).toContain("# WinBridge MVP preflight commands");
    expect(preflight).toContain("npm run mvp:ready");
    expect(preflight).toContain("npm run mvp:ready -- --include-all-smoke");
    expect(preflight).not.toContain("npm run dev:relay");
    expect(preflight).not.toContain("npm run dev:agent -- host");
    expect(preflight).not.toContain("Start-Process");
  });

  it("rejects malformed command target filters without echoing raw values", () => {
    const invalidInputs = [
      ["--only"],
      ["--only", "raw-secret-token"],
      ["--only", "host", "--only", "viewer"],
      ["--only", "host", "--json"],
      ["--json", "--only", "host"],
      ["--only", "host", "--preflight-only"],
      ["--preflight-only", "--only", "host"],
      ["--only", "preflight", "--relay-host", "192.168.1.10"],
      ["--only", "preflight", "--generate-pairing"],
      ["--generate-pairing", "--only", "preflight"]
    ];

    for (const invalidInput of invalidInputs) {
      let thrown: unknown;

      try {
        parseMvpSessionCommandArgs(invalidInput);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("192.168.1.10");
    }
  });

  it("rejects generated pairing with role filters before generating a code", () => {
    const targets = ["relay", "host", "viewer", "browser", "preflight"];

    for (const target of targets) {
      for (const invalidInput of [
        ["--only", target, "--generate-pairing"],
        ["--generate-pairing", "--only", target]
      ]) {
        let thrown: unknown;

        try {
          parseMvpSessionCommandArgs(invalidInput, {
            generatePairingCode: () => {
              throw new Error("pairing generation should not run");
            }
          });
        } catch (error) {
          thrown = error;
        }

        expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
        expect(formatMvpSessionCommandKitError(thrown)).not.toContain("234-567");
        expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
      }
    }
  });

  it("keeps role filters available with an explicit shared pairing code", () => {
    const host = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--only", "host", "--pairing", "234-567"])
    );
    const viewer = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--only", "viewer", "--pairing", "234-567"])
    );

    expect(host).toContain("--pairing '234-567'");
    expect(viewer).toContain("--pairing '234-567'");
    expect(host).not.toContain("--pairing '123-456'");
    expect(viewer).not.toContain("--pairing '123-456'");
  });

  it("prints bounded JSON for the full session command plan", () => {
    const output = renderMvpSessionCommands(parseMvpSessionCommandArgs(["--json"]));
    const parsed = JSON.parse(output);

    expect(parsed.ok).toBe(true);
    expect(parsed.mode).toBe("session");
    expect(parsed.nonExecuting).toBe(true);
    expect(parsed.commands).toEqual(
      expect.arrayContaining([
        { name: "preflight.ready", command: "npm run mvp:ready" },
        { name: "preflight.doctor", command: "npm run mvp:doctor" },
        { name: "preflight.native", command: "npm run mvp:native-preflight" },
        { name: "preflight.smoke", command: "npm run mvp:smoke" },
        { name: "preflight.ready-all-smoke", command: "npm run mvp:ready -- --include-all-smoke" },
        { name: "relay", command: "npm run dev:relay" },
        expect.objectContaining({ name: "host" }),
        expect.objectContaining({ name: "viewer" }),
        { name: "browser", command: "Start-Process 'http://127.0.0.1:35987/'" }
      ])
    );
    expect(output).toContain("--host-consent-prompt 'true'");
    expect(output).toContain("--name 'WinBridge Assisted Host'");
    expect(output).toContain("--name 'WinBridge Support Viewer'");
    expect(output).toContain("--visible-session 'true'");
    expect(output).toContain("--request-reason 'MVP remote assistance session'");
    expect(output).toContain("--host-signal-probe-ack 'true'");
    expect(output).toContain("--viewer-signal-probe-after-ms '1000'");
    expect(output).toContain("--host-apply-input 'true'");
    expect(output).toContain("--dev-screen-frame-count '600'");
    expect(output).toContain("--viewer-control-surface-port '35987'");
    expect(output).not.toContain("raw-secret-token");
    expect(output).not.toContain("dev-shared-token");
  });

  it("prints all-smoke JSON token-env references without raw token values", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--json", "--token-env", "WINBRIDGE_TEST_RELAY_TOKEN"])
    );
    const parsed = JSON.parse(output);
    const allSmokeCommand = parsed.commands.find(
      (command: { name: string }) => command.name === "preflight.ready-all-smoke"
    )?.command;

    expect(allSmokeCommand).toBe(
      "$env:WINBRIDGE_RELAY_SHARED_TOKEN = $env:WINBRIDGE_TEST_RELAY_TOKEN; npm run mvp:ready -- --include-all-smoke"
    );
    expect(output).toContain("--token $env:WINBRIDGE_TEST_RELAY_TOKEN");
    expect(output).not.toContain("dev-shared-token");
    expect(output).not.toContain("--token '");
  });

  it("prints bounded ephemeral viewer surface instructions without fabricating a browser URL", () => {
    const text = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--viewer-control-surface-port", "0"])
    );
    const json = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--viewer-control-surface-port", "0", "--json"])
    );
    const filteredBrowser = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--viewer-control-surface-port", "0", "--only", "browser"])
    );
    const parsed = JSON.parse(json);
    const browserCommand = parsed.commands.find((command: { name: string }) => command.name === "browser")
      ?.command;

    expect(text).toContain("--viewer-control-surface-port '0'");
    expect(text).toContain("Open the viewer local control surface URL printed by the viewer command log.");
    expect(text).not.toContain("http://127.0.0.1:0/");
    expect(browserCommand).toBe("Open the viewer local control surface URL printed by the viewer command log.");
    expect(json).not.toContain("http://127.0.0.1:0/");
    expect(filteredBrowser).toContain("browser command:");
    expect(filteredBrowser).toContain("Open the viewer local control surface URL printed by the viewer command log.");
    expect(filteredBrowser).not.toContain("http://127.0.0.1:0/");
  });

  it("uses a deterministic generated pairing code consistently in text output", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--generate-pairing"], {
        generatePairingCode: () => "234-567"
      })
    );

    expect(output).toContain("--pairing '234-567'");
    expect(output.match(/--pairing '234-567'/g)).toHaveLength(2);
    expect(output).not.toContain("--pairing '123-456'");
    expect(output).toContain("This helper printed commands only");
  });

  it("uses a deterministic generated pairing code consistently in JSON output", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--generate-pairing", "--json"], {
        generatePairingCode: () => "345-678"
      })
    );
    const parsed = JSON.parse(output);

    const hostCommand = parsed.commands.find((command: { name: string }) => command.name === "host")
      ?.command;
    const viewerCommand = parsed.commands.find(
      (command: { name: string }) => command.name === "viewer"
    )?.command;

    expect(hostCommand).toContain("--pairing '345-678'");
    expect(viewerCommand).toContain("--pairing '345-678'");
    expect(output).not.toContain("--pairing '123-456'");
    expect(output).not.toContain("raw-secret-token");
  });

  it("prints bounded JSON for preflight-only mode without live session commands", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--preflight-only", "--json"])
    );
    const parsed = JSON.parse(output);

    expect(parsed).toEqual({
      ok: true,
      mode: "preflight",
      nonExecuting: true,
      commands: [
        { name: "preflight.ready", command: "npm run mvp:ready" },
        { name: "preflight.doctor", command: "npm run mvp:doctor" },
        { name: "preflight.native", command: "npm run mvp:native-preflight" },
        { name: "preflight.smoke", command: "npm run mvp:smoke" },
        { name: "preflight.ready-all-smoke", command: "npm run mvp:ready -- --include-all-smoke" }
      ],
      safety: expect.arrayContaining([
        "Host consent and visible sessions are required before live assistance trials.",
        "This helper prints commands only."
      ])
    });
    expect(output).not.toContain("npm run dev:relay");
    expect(output).not.toContain("npm run dev:agent -- host");
    expect(output).not.toContain("npm run dev:agent -- viewer");
    expect(output).not.toContain("Start-Process");
    expect(output).not.toContain("--host-apply-input");
    expect(output).not.toContain("--viewer-control-surface-port");
    expect(output).not.toContain("$env:WINBRIDGE_RELAY_SHARED_TOKEN");
  });

  it("rejects malformed preflight-only combinations without echoing raw values", () => {
    const invalidInputs = [
      ["--preflight-only", "raw-secret-token"],
      ["--preflight-only", "--relay", "ws://192.168.1.10:8787"],
      ["--relay", "ws://192.168.1.10:8787", "--preflight-only"],
      ["--json", "raw-secret-token"],
      ["--json", "--json"],
      ["--preflight-only", "--json", "--relay", "ws://192.168.1.10:8787"]
    ];

    for (const invalidInput of invalidInputs) {
      let thrown: unknown;

      try {
        parseMvpSessionCommandArgs(invalidInput);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("192.168.1.10");
    }
  });

  it("rejects malformed generated pairing usage without echoing raw values", () => {
    const invalidInputs = [
      ["--generate-pairing", "--pairing", "999-999"],
      ["--generate-pairing", "raw-secret-token"],
      ["--generate-pairing", "--generate-pairing"],
      ["--generate-pairing", "999-999"],
      ["--generate-pairing=999-999"],
      ["--preflight-only", "--generate-pairing"],
      ["--generate-pairing", "--preflight-only"]
    ];

    for (const invalidInput of invalidInputs) {
      let thrown: unknown;

      try {
        parseMvpSessionCommandArgs(invalidInput);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("999-999");
    }
  });

  it("prints the validated custom relay URL for two-PC command output", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay", "ws://192.168.1.10:8787"])
    );

    expect(output).toContain("Current relay URL: ws://192.168.1.10:8787/");
    expect(output).toContain("$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay");
    expect(output).toContain("--relay 'ws://192.168.1.10:8787/'");
    expect(output).toContain("localhost relay URLs are same-machine only");
    expect(output).not.toContain("--token");
    expect(output).not.toContain("raw-secret-token");
  });

  it("prints a validated relay-host shortcut for two-PC command output", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay-host", "192.168.1.10"])
    );

    expect(output).toContain("Current relay URL: ws://192.168.1.10:8787/");
    expect(output).toContain("$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay");
    expect(output).toContain("--relay 'ws://192.168.1.10:8787/'");
    expect(output).toContain("localhost relay URLs are same-machine only");
    expect(output).not.toContain("WINBRIDGE_RELAY_PORT");
    expect(output).not.toContain("raw-secret-token");
  });

  it("prints custom bounded host and viewer display names", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs([
        "--host-name",
        "Assisted PC",
        "--viewer-name",
        "Support Viewer"
      ])
    );

    expect(output).toContain("--name 'Assisted PC'");
    expect(output).toContain("--name 'Support Viewer'");
    expect(output).toContain("This helper printed commands only");
    expect(output).not.toContain("verified");
  });

  it("prints a custom bounded viewer request reason", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs([
        "--request-reason",
        "Troubleshoot display settings"
      ])
    );

    expect(output).toContain("--request-reason 'Troubleshoot display settings'");
    expect(output).toContain("--request 'screen:view,input:pointer,input:keyboard'");
    expect(output).toContain("This helper printed commands only");
    expect(output).not.toContain("verified");
  });

  it("prints a custom bounded viewer signal probe delay", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs([
        "--viewer-signal-probe-after-ms",
        "0"
      ])
    );

    expect(output).toContain("--host-signal-probe-ack 'true'");
    expect(output).toContain("--viewer-signal-probe-after-ms '0'");
    expect(output).toContain("Viewer sends one bounded readiness probe 0 ms");
    expect(output).toContain("This helper printed commands only");
    expect(output).not.toContain("authorized because");
  });

  it("prints a custom bounded capture duration as a derived finite frame count", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs([
        "--capture-duration-minutes",
        "5",
        "--capture-interval-ms",
        "2000"
      ])
    );

    expect(output).toContain("--dev-screen-frame-count '150'");
    expect(output).toContain("--dev-screen-frame-interval-ms '2000'");
    expect(output).toContain("Host frame stream: 150 finite frame(s) at 2000 ms intervals.");
    expect(output).toContain("Duration shortcut: 5 minute(s)");
    expect(output).not.toContain("infinite");
  });

  it("keeps explicit capture counts as a manual finite override", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--capture-count", "42", "--capture-interval-ms", "1500"])
    );

    expect(output).toContain("--dev-screen-frame-count '42'");
    expect(output).toContain("--dev-screen-frame-interval-ms '1500'");
    expect(output).toContain("Manual count override: duration shortcut disabled");
    expect(output).not.toContain("Duration shortcut:");
  });

  it("prints bounded JSON for a validated relay-host shortcut", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay-host", "relay-pc.local", "--json"])
    );
    const parsed = JSON.parse(output);

    expect(parsed.commands).toEqual(
      expect.arrayContaining([
        {
          name: "relay",
          command: "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; npm run dev:relay"
        },
        expect.objectContaining({
          name: "host",
          command: expect.stringContaining("--relay 'ws://relay-pc.local:8787/'")
        }),
        expect.objectContaining({
          name: "viewer",
          command: expect.stringContaining("--relay 'ws://relay-pc.local:8787/'")
        })
      ])
    );
    expect(output).not.toContain("raw-secret-token");
  });

  it("prints the validated custom relay port for relay startup", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay", "ws://localhost:18787"])
    );

    expect(output).toContain("Current relay URL: ws://localhost:18787/");
    expect(output).toContain("$env:WINBRIDGE_RELAY_PORT = '18787'; npm run dev:relay");
    expect(output).toContain("--relay 'ws://localhost:18787/'");
    expect(output).not.toContain("WINBRIDGE_RELAY_BIND_HOST");
  });

  it("composes LAN relay bind host and custom relay port", () => {
    const output = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay", "ws://192.168.1.10:18787"])
    );

    expect(output).toContain(
      "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; $env:WINBRIDGE_RELAY_PORT = '18787'; npm run dev:relay"
    );
    expect(output).toContain("--relay 'ws://192.168.1.10:18787/'");
  });

  it("rejects unsafe full relay URL connect targets without echoing raw values", () => {
    const invalidInputs = [
      ["--relay", "ws://0.0.0.0:8787"],
      ["--relay", "ws://[::]:8787"],
      ["--relay", "ws://192.168.1.10:8787/relay"],
      ["--relay", "ws://192.168.1.10:8787/path/to/raw-secret-token"],
      ["--relay", "ws://192.168.1.10:8787?token=raw-secret-token"],
      ["--relay", "ws://user:raw-secret-token@192.168.1.10:8787"]
    ];

    for (const invalidInput of invalidInputs) {
      let thrown: unknown;

      try {
        parseMvpSessionCommandArgs(invalidInput);
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("0.0.0.0");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("192.168.1.10");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
      expect(formatMvpSessionCommandKitError(thrown)).not.toContain("/relay");
    }
  });

  it("keeps root localhost and LAN relay URLs valid", () => {
    const localhost = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay", "ws://localhost:18787/"])
    );
    expect(localhost).toContain("$env:WINBRIDGE_RELAY_PORT = '18787'; npm run dev:relay");
    expect(localhost).not.toContain("WINBRIDGE_RELAY_BIND_HOST");

    const lan = renderMvpSessionCommands(
      parseMvpSessionCommandArgs(["--relay", "ws://192.168.1.10:18787/"])
    );
    expect(lan).toContain(
      "$env:WINBRIDGE_RELAY_BIND_HOST = '0.0.0.0'; $env:WINBRIDGE_RELAY_PORT = '18787'; npm run dev:relay"
    );
    expect(lan).toContain("--relay 'ws://192.168.1.10:18787/'");
  });

  it("keeps the root agent helper aligned with generated MVP dependencies", () => {
    const packageJson = JSON.parse(readFileSync(rootPackageJsonPath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    const devAgentScript = packageJson.scripts?.["dev:agent"] ?? "";

    expect(renderMvpSessionCommands(parseMvpSessionCommandArgs([]))).toContain(
      "--host-apply-input 'true'"
    );
    expect(devAgentScript).toContain("npm --workspace @winbridge/protocol run build");
    expect(devAgentScript).toContain("npm --workspace @winbridge/audit-log run build");
    expect(devAgentScript).toContain("npm --workspace @winbridge/windows-capture run build");
    expect(devAgentScript).toContain("npm --workspace @winbridge/windows-input run build");
    expect(devAgentScript).toContain("npm --workspace @winbridge/agent-shell run dev --");
    expect(devAgentScript.indexOf("@winbridge/protocol")).toBeLessThan(
      devAgentScript.indexOf("@winbridge/audit-log")
    );
    expect(devAgentScript.indexOf("@winbridge/audit-log")).toBeLessThan(
      devAgentScript.indexOf("@winbridge/agent-shell")
    );
    expect(devAgentScript.indexOf("@winbridge/windows-input")).toBeLessThan(
      devAgentScript.indexOf("@winbridge/agent-shell")
    );
  });

  it("keeps the root relay helper aligned with generated MVP dependencies", () => {
    const packageJson = JSON.parse(readFileSync(rootPackageJsonPath, "utf8")) as {
      scripts?: Record<string, string>;
    };
    const devRelayScript = packageJson.scripts?.["dev:relay"] ?? "";

    expect(renderMvpSessionCommands(parseMvpSessionCommandArgs([]))).toContain(
      "npm run dev:relay"
    );
    expect(devRelayScript).toContain("npm --workspace @winbridge/protocol run build");
    expect(devRelayScript).toContain("npm --workspace @winbridge/audit-log run build");
    expect(devRelayScript).toContain("npm --workspace @winbridge/relay run dev");
    expect(devRelayScript.indexOf("@winbridge/protocol")).toBeLessThan(
      devRelayScript.indexOf("@winbridge/audit-log")
    );
    expect(devRelayScript.indexOf("@winbridge/audit-log")).toBeLessThan(
      devRelayScript.indexOf("@winbridge/relay")
    );
  });

  it("rejects malformed and duplicate options before rendering commands", () => {
    const invalidInputs = [
      ["--session", "token-demo"],
      ["--pairing", "123456"],
      ["--relay", "http://localhost:8787"],
      ["--relay", "ws://user:pass@localhost:8787"],
      ["--relay", "ws://localhost:8787?token=abc"],
      ["--relay", "ws://0.0.0.0:8787"],
      ["--relay", "ws://[::]:8787"],
      ["--relay", "ws://localhost:8787/relay"],
      ["--relay-host", "localhost"],
      ["--relay-host", "127.0.0.1"],
      ["--relay-host", "0.0.0.0"],
      ["--relay-host", "ws://192.168.1.10"],
      ["--relay-host", "192.168.1.10:8787"],
      ["--relay-host", "999.999.999.999"],
      ["--relay-host", "token-relay"],
      ["--relay-host", "192.168.1.10", "--relay", "ws://192.168.1.10:8787"],
      ["--relay-host", "192.168.1.10", "--relay-host", "192.168.1.11"],
      ["--host-name", ""],
      ["--host-name", " Assisted PC"],
      ["--host-name", "Assisted PC "],
      ["--host-name", "Assisted\nPC"],
      ["--host-name", `Assisted${"\u202e"}PC`],
      ["--host-name", "token=raw-host"],
      ["--host-name", "A".repeat(121)],
      ["--viewer-name", ""],
      ["--viewer-name", " Support Viewer"],
      ["--viewer-name", "Support Viewer "],
      ["--viewer-name", "Support\tViewer"],
      ["--viewer-name", `Support${"\ufeff"}Viewer`],
      ["--viewer-name", "Authorization: Bearer raw-viewer-token"],
      ["--viewer-name", "A".repeat(121)],
      ["--request-reason", ""],
      ["--request-reason", " Troubleshoot display settings"],
      ["--request-reason", "Troubleshoot display settings "],
      ["--request-reason", "Troubleshoot\ndisplay"],
      ["--request-reason", `Troubleshoot${"\u202e"}display`],
      ["--request-reason", "token=raw-reason"],
      ["--request-reason", "A".repeat(241)],
      ["--viewer-signal-probe-after-ms", ""],
      ["--viewer-signal-probe-after-ms", "-1"],
      ["--viewer-signal-probe-after-ms", "1.5"],
      ["--viewer-signal-probe-after-ms", "2147483648"],
      ["--viewer-signal-probe-after-ms", "token=raw-signal-delay"],
      ["--viewer-frame-output", "frames\\latest.png:hidden"],
      ["--viewer-control-surface-port", "80"],
      ["--capture-duration-minutes", "0"],
      ["--capture-duration-minutes", "17"],
      ["--capture-duration-minutes", "1.5"],
      ["--capture-duration-minutes", "10", "--capture-count", "600"],
      ["--capture-duration-minutes", "10", "--capture-interval-ms", "500"],
      ["--capture-duration-minutes", "10", "--capture-duration-minutes", "5"],
      ["--capture-count", "1001"],
      ["--capture-interval-ms", "0"],
      ["--token-env", "relay-token"],
      ["--session", "demo", "--session", "other"]
    ];

    for (const invalidInput of invalidInputs) {
      expect(() => parseMvpSessionCommandArgs(invalidInput)).toThrow(
        MvpSessionCommandKitUsageError
      );
    }
  });

  it("rejects raw token attempts without echoing the provided value", () => {
    let thrown: unknown;

    try {
      parseMvpSessionCommandArgs(["--token", "raw-secret-token"]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-secret-token");
  });

  it("rejects unsafe display names without echoing the provided value", () => {
    const unsafeName = "Authorization: Bearer raw-display-token";
    let thrown: unknown;

    try {
      parseMvpSessionCommandArgs(["--viewer-name", unsafeName]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain(unsafeName);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-display-token");
  });

  it("rejects unsafe request reasons without echoing the provided value", () => {
    const unsafeReason = "Authorization: Bearer raw-reason-token";
    let thrown: unknown;

    try {
      parseMvpSessionCommandArgs(["--request-reason", unsafeReason]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain(unsafeReason);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-reason-token");
  });

  it("rejects unsafe signal probe delays without echoing the provided value", () => {
    const unsafeDelay = "token=raw-signal-delay";
    let thrown: unknown;

    try {
      parseMvpSessionCommandArgs(["--viewer-signal-probe-after-ms", unsafeDelay]);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(MvpSessionCommandKitUsageError);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain(unsafeDelay);
    expect(formatMvpSessionCommandKitError(thrown)).not.toContain("raw-signal-delay");
  });

  it("does not import process, socket, HTTP, or filesystem APIs in the command generator", () => {
    const source = readFileSync(scriptPath, "utf8");

    expect(source).not.toContain("node:child_process");
    expect(source).not.toContain("spawn(");
    expect(source).not.toContain("exec(");
    expect(source).not.toContain("node:net");
    expect(source).not.toContain("node:http");
    expect(source).not.toContain("node:https");
    expect(source).not.toContain("node:fs");
    expect(source).not.toContain("createServer");
    expect(source).not.toContain("WebSocket");
    expect(source).not.toContain("writeFile");
    expect(source).not.toContain("readFile");
  });
});
