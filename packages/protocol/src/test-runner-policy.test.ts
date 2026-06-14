import { describe, expect, it } from "vitest";
import {
  buildVitestArgs,
  isTransientVitestIpcFailure,
  prioritizeTestFiles,
  runTestFile,
  shouldRetryVitestRun,
  VITEST_SERIAL_FLAGS
} from "../../../scripts/run-tests-lib.mjs";

describe("local test runner policy", () => {
  it("classifies only recognized transient Vitest IPC failures as retryable", () => {
    expect(isTransientVitestIpcFailure("Serialized Error: { code: 'ERR_IPC_CHANNEL_CLOSED' }")).toBe(true);
    expect(isTransientVitestIpcFailure("Error: Channel closed")).toBe(true);
    expect(isTransientVitestIpcFailure("AssertionError: expected true to be false")).toBe(false);

    expect(
      shouldRetryVitestRun({
        status: 1,
        stdout: "",
        stderr: "Unhandled Rejection Error: Channel closed"
      })
    ).toBe(true);
    expect(
      shouldRetryVitestRun({
        status: 1,
        stdout: "AssertionError: expected value",
        stderr: ""
      })
    ).toBe(false);
    expect(
      shouldRetryVitestRun({
        status: 0,
        stdout: "Error: Channel closed",
        stderr: ""
      })
    ).toBe(false);
  });

  it("builds serial forks Vitest arguments without disabling isolation", () => {
    const args = buildVitestArgs("apps/agent-shell/src/runtime.integration.test.ts", "node_modules/vitest/vitest.mjs");

    expect(args).toEqual([
      "node_modules/vitest/vitest.mjs",
      "run",
      "apps/agent-shell/src/runtime.integration.test.ts",
      ...VITEST_SERIAL_FLAGS
    ]);
    expect(args).toContain("--pool");
    expect(args).toContain("forks");
    expect(args).toContain("--maxWorkers");
    expect(args).toContain("--minWorkers");
    expect(args).toContain("--no-file-parallelism");
    expect(args).not.toContain("--no-isolate");
  });

  it("prioritizes runtime integration suites before other tests", () => {
    expect(
      prioritizeTestFiles([
        "packages/protocol/src/messages.test.ts",
        "apps/relay/src/server.integration.test.ts",
        "apps/agent-shell/src/runtime.integration.test.ts"
      ])
    ).toEqual([
      "apps/agent-shell/src/runtime.integration.test.ts",
      "apps/relay/src/server.integration.test.ts",
      "packages/protocol/src/messages.test.ts"
    ]);
  });

  it("retries a transient IPC failure once", () => {
    const calls = [];
    const stdout = createWritableCapture();
    const stderr = createWritableCapture();

    const result = runTestFile("packages/protocol/src/messages.test.ts", {
      cwd: "E:/Projects/prototype_3",
      vitestBin: "node_modules/vitest/vitest.mjs",
      vitestCommand: "node",
      streams: { stdout, stderr },
      spawn(command, args, options) {
        calls.push({ command, args, options });

        if (calls.length === 1) {
          return { status: 1, stdout: "", stderr: "Error: Channel closed" };
        }

        return { status: 0, stdout: "retry passed", stderr: "" };
      }
    });

    expect(result).toEqual({ status: 0, attempts: 2 });
    expect(calls).toHaveLength(2);
    expect(stderr.text()).toContain("retrying once");
    expect(stdout.text()).toContain("retry passed");
  });

  it("does not retry non-transient test failures", () => {
    const calls = [];
    const stdout = createWritableCapture();
    const stderr = createWritableCapture();

    const result = runTestFile("packages/protocol/src/messages.test.ts", {
      streams: { stdout, stderr },
      spawn(command, args, options) {
        calls.push({ command, args, options });
        return { status: 1, stdout: "AssertionError: expected true to be false", stderr: "" };
      }
    });

    expect(result).toEqual({ status: 1, attempts: 1 });
    expect(calls).toHaveLength(1);
    expect(stderr.text()).not.toContain("retrying once");
  });

  it("returns non-zero when a transient retry also fails", () => {
    const calls = [];
    const stderr = createWritableCapture();

    const result = runTestFile("packages/protocol/src/messages.test.ts", {
      streams: { stdout: createWritableCapture(), stderr },
      spawn(command, args, options) {
        calls.push({ command, args, options });
        return { status: 1, stdout: "", stderr: "Serialized Error: { code: 'ERR_IPC_CHANNEL_CLOSED' }" };
      }
    });

    expect(result).toEqual({ status: 1, attempts: 2 });
    expect(calls).toHaveLength(2);
    expect(stderr.text()).toContain("retrying once");
  });

  it("reports startup errors from a transient retry attempt", () => {
    const calls = [];
    const stderr = createWritableCapture();

    const result = runTestFile("packages/protocol/src/messages.test.ts", {
      streams: { stdout: createWritableCapture(), stderr },
      spawn(command, args, options) {
        calls.push({ command, args, options });

        if (calls.length === 1) {
          return { status: 1, stdout: "", stderr: "Error: Channel closed" };
        }

        return { status: null, stdout: "", stderr: "", error: new Error("spawn failed") };
      }
    });

    expect(result).toEqual({ status: 1, attempts: 2 });
    expect(calls).toHaveLength(2);
    expect(stderr.text()).toContain("retrying once");
    expect(stderr.text()).toContain("Failed to start Vitest");
  });
});

function createWritableCapture() {
  const chunks = [];

  return {
    write(chunk) {
      chunks.push(String(chunk));
    },
    text() {
      return chunks.join("");
    }
  };
}
