import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FileViewerScreenFrameOutputSink,
  type ViewerScreenFrameOutputFrame
} from "./screen-frame-output.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("FileViewerScreenFrameOutputSink", () => {
  it("publishes complete frame bytes through a same-directory temporary file replacement", () => {
    const tempDir = createTempDir();
    const outputPath = join(tempDir, "latest.jpg");
    const sink = new FileViewerScreenFrameOutputSink(outputPath);
    const frameBytes = Buffer.from("complete-frame-bytes");

    sink.writeFrame(createFrame(frameBytes));

    expect(readFileSync(outputPath)).toEqual(frameBytes);
    expect(readdirSync(tempDir)).toEqual(["latest.jpg"]);
  });

  it("creates the output directory before publishing a frame", () => {
    const outputPath = "frames/latest.jpg";
    const calls: string[] = [];
    const fileSystem = {
      mkdirSync: vi.fn((path: string, options: { recursive: true }) => {
        calls.push(`mkdir:${path}:${String(options.recursive)}`);
      }),
      rmSync: vi.fn((path: string) => {
        calls.push(`rm:${path}`);
      }),
      writeFileSync: vi.fn((path: string) => {
        calls.push(`write:${path}`);
      }),
      renameSync: vi.fn((oldPath: string, newPath: string) => {
        calls.push(`rename:${oldPath}->${newPath}`);
      })
    };
    const sink = new FileViewerScreenFrameOutputSink(outputPath, fileSystem);

    sink.writeFrame(createFrame(Buffer.from("complete-frame-bytes")));

    expect(fileSystem.mkdirSync).toHaveBeenCalledWith("frames", { recursive: true });
    expect(calls[0]).toBe("mkdir:frames:true");
    expect(calls[1]).toEqual(expect.stringContaining("rm:frames"));
    expect(calls[2]).toEqual(expect.stringContaining("write:frames"));
    expect(calls[3]).toEqual(expect.stringContaining("rename:frames"));
    expect(calls[3]).toEqual(expect.stringContaining("->frames/latest.jpg"));
  });

  it("preserves the previous complete frame when replacement fails", () => {
    const outputPath = "frames/latest.jpg";
    const previousFrame = Buffer.from("previous-complete-frame");
    const nextFrame = Buffer.from("next-complete-frame");
    const files = new Map<string, Buffer>([[outputPath, previousFrame]]);
    let temporaryPath: string | undefined;
    const fileSystem = {
      mkdirSync: vi.fn(),
      rmSync: vi.fn((path: string) => {
        files.delete(path);
      }),
      writeFileSync: vi.fn((path: string, data: Buffer) => {
        temporaryPath = path;
        files.set(path, Buffer.from(data));
      }),
      renameSync: vi.fn(() => {
        throw new Error("replace failed");
      })
    };
    const sink = new FileViewerScreenFrameOutputSink(outputPath, fileSystem);

    expect(() => sink.writeFrame(createFrame(nextFrame))).toThrow("replace failed");

    expect(files.get(outputPath)).toEqual(previousFrame);
    expect(temporaryPath).toBeDefined();
    expect(files.has(temporaryPath ?? "")).toBe(false);
    expect(fileSystem.rmSync).toHaveBeenCalledWith(expect.stringContaining("latest.jpg"), { force: true });
  });

  it("cleans a partial temporary frame when the temporary write fails", () => {
    const outputPath = "frames/latest.jpg";
    const files = new Map<string, Buffer>();
    let temporaryPath: string | undefined;
    const fileSystem = {
      mkdirSync: vi.fn(),
      rmSync: vi.fn((path: string) => {
        files.delete(path);
      }),
      writeFileSync: vi.fn((path: string) => {
        temporaryPath = path;
        files.set(path, Buffer.from("partial-frame"));
        throw new Error("write failed");
      }),
      renameSync: vi.fn()
    };
    const sink = new FileViewerScreenFrameOutputSink(outputPath, fileSystem);

    expect(() => sink.writeFrame(createFrame(Buffer.from("complete-frame")))).toThrow("write failed");

    expect(temporaryPath).toBeDefined();
    expect(files.has(temporaryPath ?? "")).toBe(false);
    expect(fileSystem.renameSync).not.toHaveBeenCalled();
  });

  it("overwrites a stale temporary file before publishing a frame", () => {
    const tempDir = createTempDir();
    const outputPath = join(tempDir, "latest.jpg");
    const staleTempPath = join(tempDir, `.latest.jpg.winbridge-${process.pid}.tmp`);
    writeFileSync(staleTempPath, Buffer.from("stale-temp-frame"));
    const sink = new FileViewerScreenFrameOutputSink(outputPath);
    const frameBytes = Buffer.from("complete-frame-after-stale-temp");

    sink.writeFrame(createFrame(frameBytes));

    expect(readFileSync(outputPath)).toEqual(frameBytes);
    expect(existsSync(staleTempPath)).toBe(false);
  });
});

function createTempDir(): string {
  const tempDir = mkdtempSync(join(tmpdir(), "winbridge-frame-output-"));
  tempDirs.push(tempDir);
  return tempDir;
}

function createFrame(frameBytes: Buffer): ViewerScreenFrameOutputFrame {
  return {
    authorizationId: "authz_frame_output_1",
    frameId: "frame_output_1",
    sequence: 0,
    capturedAt: "2026-06-18T04:00:00.000Z",
    format: "image/jpeg",
    width: 2,
    height: 2,
    dataBase64: frameBytes.toString("base64")
  };
}
