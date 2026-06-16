import { describe, expect, it, vi } from "vitest";
import {
  capturePrimaryScreen,
  createPowerShellPrimaryScreenCaptureCommand,
  createWindowsScreenCaptureAdapter,
  WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE,
  WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE,
  type WindowsScreenCaptureGrant,
  type WindowsScreenCaptureNativeRunner
} from "./index.js";

const now = new Date("2026-06-16T05:00:00.000Z");
const validGrant: WindowsScreenCaptureGrant = {
  authorizationId: "authz_screen_123",
  authorizationStatus: "active",
  visibleToHost: true,
  permissions: ["screen:view"],
  peerConnected: true,
  expiresAt: "2026-06-16T05:10:00.000Z"
};

const validNativeOutput = JSON.stringify({
  format: "png",
  width: 2,
  height: 1,
  dataBase64: "iVBORw0KGgo="
});

describe("windows screen capture adapter", () => {
  it("captures a bounded PNG frame when the visible grant is active", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    const frame = await capturePrimaryScreen(validGrant, {
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith({
      timeoutMs: 5000,
      maxOutputBytes: 53248
    });
    expect(frame).toEqual({
      authorizationId: "authz_screen_123",
      capturedAt: "2026-06-16T05:00:00.000Z",
      format: "png",
      width: 2,
      height: 1,
      dataBase64: "iVBORw0KGgo=",
      dataBase64Bytes: 12
    });
  });

  it("does not invoke native capture when the platform is not Windows", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "linux",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_PLATFORM_ERROR_MESSAGE);

    expect(runner).not.toHaveBeenCalled();
  });

  it("does not invoke native capture for inactive or unsafe grants", async () => {
    const cases: ReadonlyArray<Partial<WindowsScreenCaptureGrant>> = [
      { authorizationId: "bad" },
      { authorizationStatus: "paused" as WindowsScreenCaptureGrant["authorizationStatus"] },
      { visibleToHost: false },
      { permissions: [] },
      { permissions: ["input:pointer" as WindowsScreenCaptureGrant["permissions"][number]] },
      { peerConnected: false },
      { expiresAt: "2026-06-16T05:00:00.000Z" },
      { expiresAt: "not-a-date" }
    ];

    for (const override of cases) {
      const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
      await expect(
        capturePrimaryScreen(
          {
            ...validGrant,
            ...override
          },
          {
            runner,
            platform: "win32",
            now: () => now
          }
        )
      ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_GRANT_ERROR_MESSAGE);
      expect(runner).not.toHaveBeenCalled();
    }
  });

  it("does not run native capture at adapter construction", () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);
    createWindowsScreenCaptureAdapter({
      runner,
      platform: "win32",
      now: () => now
    });

    expect(runner).not.toHaveBeenCalled();
  });

  it("rejects malformed native output with a metadata-only error", async () => {
    const runner = vi
      .fn<WindowsScreenCaptureNativeRunner>()
      .mockResolvedValue("{\"format\":\"png\",\"dataBase64\":\"credential-token-secret\"}");

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/credential-token-secret/);
  });

  it("rejects runner failures without exposing command output", async () => {
    const runner = vi
      .fn<WindowsScreenCaptureNativeRunner>()
      .mockRejectedValue(new Error("raw-screen-bytes pairing-code=123-456"));

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_RUNNER_ERROR_MESSAGE);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.not.toThrow(/raw-screen-bytes|123-456/);
  });

  it("rejects oversized encoded frame data", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(
      JSON.stringify({
        format: "png",
        width: 1,
        height: 1,
        dataBase64: "AAAA"
      })
    );

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now,
        maxDataBase64Bytes: 3
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  });

  it("rejects base64 data that is not a PNG frame", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(
      JSON.stringify({
        format: "png",
        width: 1,
        height: 1,
        dataBase64: "QUJDREVGR0g="
      })
    );

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
  });

  it("rejects unsafe adapter bounds before native capture", async () => {
    const runner = vi.fn<WindowsScreenCaptureNativeRunner>().mockResolvedValue(validNativeOutput);

    await expect(
      capturePrimaryScreen(validGrant, {
        runner,
        platform: "win32",
        now: () => now,
        maxDataBase64Bytes: 48 * 1024 + 1
      })
    ).rejects.toThrow(WINDOWS_SCREEN_CAPTURE_OUTPUT_ERROR_MESSAGE);
    expect(runner).not.toHaveBeenCalled();
  });

  it("uses a fixed non-interactive PowerShell command", () => {
    expect(createPowerShellPrimaryScreenCaptureCommand().slice(0, 3)).toEqual([
      "-NoProfile",
      "-NonInteractive",
      "-Command"
    ]);
    expect(createPowerShellPrimaryScreenCaptureCommand().join(" ")).not.toMatch(
      /ExecutionPolicy|Bypass|Invoke-Expression/
    );
  });
});
