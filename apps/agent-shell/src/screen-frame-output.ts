import { mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { assertAuditLogPath } from "@winbridge/audit-log";
import type { ProtocolEnvelope } from "@winbridge/protocol";

type ScreenFrameEnvelope = Extract<ProtocolEnvelope, { type: "screen-frame" }>;

export type ViewerScreenFrameOutputFrame = Readonly<
  Pick<
    ScreenFrameEnvelope,
    | "authorizationId"
    | "frameId"
    | "sequence"
    | "capturedAt"
    | "format"
    | "width"
    | "height"
    | "dataBase64"
  >
>;

export type ViewerScreenFrameOutputSink = {
  writeFrame(frame: ViewerScreenFrameOutputFrame): void;
};

type ViewerScreenFrameOutputFileSystem = {
  mkdirSync(path: string, options: { recursive: true }): void;
  renameSync(oldPath: string, newPath: string): void;
  rmSync(path: string, options: { force: true }): void;
  writeFileSync(path: string, data: Buffer): void;
};

const VIEWER_SCREEN_FRAME_OUTPUT_PATH_ERROR_MESSAGE =
  "Viewer screen-frame output path must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, contain no Windows reserved device path segments, contain no Windows alternate data stream path segments, and not use a Windows device namespace prefix";

const nodeViewerScreenFrameOutputFileSystem: ViewerScreenFrameOutputFileSystem = {
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync
};

export class FileViewerScreenFrameOutputSink implements ViewerScreenFrameOutputSink {
  private readonly path: string;
  private readonly fileSystem: ViewerScreenFrameOutputFileSystem;

  constructor(path: string, fileSystem = nodeViewerScreenFrameOutputFileSystem) {
    assertViewerScreenFrameOutputPath(path);
    this.path = path;
    this.fileSystem = fileSystem;
  }

  writeFrame(frame: ViewerScreenFrameOutputFrame): void {
    const frameBytes = Buffer.from(frame.dataBase64, "base64");
    const outputDirectory = dirname(this.path);
    const temporaryPath = createViewerScreenFrameOutputTemporaryPath(this.path);
    this.fileSystem.mkdirSync(outputDirectory, { recursive: true });
    this.fileSystem.rmSync(temporaryPath, { force: true });

    try {
      this.fileSystem.writeFileSync(temporaryPath, frameBytes);
      this.fileSystem.renameSync(temporaryPath, this.path);
    } catch (error) {
      this.fileSystem.rmSync(temporaryPath, { force: true });
      throw error;
    }
  }
}

export function assertViewerScreenFrameOutputPath(value: unknown): asserts value is string {
  assertAuditLogPath(value, VIEWER_SCREEN_FRAME_OUTPUT_PATH_ERROR_MESSAGE);
}

function createViewerScreenFrameOutputTemporaryPath(outputPath: string): string {
  return join(
    dirname(outputPath),
    `.${basename(outputPath)}.winbridge-${process.pid}.tmp`
  );
}
