import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import {
  createAuditRecord,
  stringifyJson,
  type AuditRecord,
  type AuditRecordInput
} from "@winbridge/protocol";

export type AuditSink = {
  write(input: AuditRecordInput): AuditRecord;
};

export const MAX_AUDIT_LOG_PATH_BYTES = 1024;
const AUDIT_LOG_PATH_ERROR_MESSAGE =
  "Audit log path must be non-blank, already trimmed, 1024 UTF-8 bytes or less, contain no ASCII control characters, contain no Unicode bidi or zero-width formatting controls, contain no Windows reserved device path segments, contain no Windows alternate data stream path segments, and not use a Windows device namespace prefix";
const WINDOWS_DEVICE_NAMESPACE_PREFIX = /^[\\/]{2}[.?](?:[\\/]|$)/;
const WINDOWS_RESERVED_DEVICE_NAMES = new Set([
  "AUX",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "CON",
  "CONIN$",
  "CONOUT$",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
  "NUL",
  "PRN"
]);

export class MemoryAuditSink implements AuditSink {
  private readonly entries: AuditRecord[] = [];

  write(input: AuditRecordInput): AuditRecord {
    const record = deepFreeze(createAuditRecord(input));
    this.entries.push(record);
    return record;
  }

  records(): readonly AuditRecord[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

function deepFreeze<T>(value: T, visited = new WeakSet<object>()): T {
  const valueType = typeof value;
  if (!value || (valueType !== "object" && valueType !== "function")) {
    return value;
  }

  const objectValue = value as object;
  if (visited.has(objectValue)) {
    return value;
  }
  visited.add(objectValue);

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested, visited);
  }

  if (!Object.isFrozen(objectValue)) {
    Object.freeze(objectValue);
  }

  return value;
}

export class ConsoleAuditSink implements AuditSink {
  constructor(private readonly writer: (line: string) => void = console.log) {}

  write(input: AuditRecordInput): AuditRecord {
    const record = createAuditRecord(input);
    this.writer(stringifyJson(record));
    return record;
  }
}

export class FileAuditSink implements AuditSink {
  private readonly path: string;

  constructor(path: string) {
    assertAuditLogPath(path);
    this.path = path;
  }

  write(input: AuditRecordInput): AuditRecord {
    const record = createAuditRecord(input);
    mkdirSync(dirname(this.path), { recursive: true });
    appendFileSync(this.path, `${stringifyJson(record)}\n`, { encoding: "utf8" });
    return record;
  }
}

export function assertAuditLogPath(
  value: unknown,
  message = AUDIT_LOG_PATH_ERROR_MESSAGE
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value !== value.trim() ||
    Buffer.byteLength(value, "utf8") > MAX_AUDIT_LOG_PATH_BYTES ||
    hasAsciiControlCharacter(value) ||
    hasUnsafePathFormatCharacter(value) ||
    hasWindowsDeviceNamespacePrefix(value) ||
    hasWindowsReservedDevicePathSegment(value) ||
    hasWindowsAlternateDataStreamPathSegment(value)
  ) {
    throw new Error(message);
  }
}

function hasWindowsDeviceNamespacePrefix(path: string): boolean {
  return WINDOWS_DEVICE_NAMESPACE_PREFIX.test(path);
}

function hasWindowsAlternateDataStreamPathSegment(path: string): boolean {
  return path.split(/[\\/]+/).some((segment, index) => {
    if (segment === "") {
      return false;
    }

    if (index === 0 && /^[A-Za-z]:$/.test(segment)) {
      return false;
    }

    return segment.includes(":");
  });
}

function hasWindowsReservedDevicePathSegment(path: string): boolean {
  return path.split(/[\\/]+/).some((segment) => {
    const deviceName = windowsDeviceNameFromPathSegment(segment);
    return deviceName !== "" && WINDOWS_RESERVED_DEVICE_NAMES.has(deviceName);
  });
}

function windowsDeviceNameFromPathSegment(segment: string): string {
  const withoutDrivePrefix = segment.replace(/^[A-Za-z]:/, "");
  const withoutStreamName = withoutDrivePrefix.split(":")[0] ?? "";
  const baseName = withoutStreamName.split(".")[0] ?? "";

  return baseName.replace(/[ .]+$/g, "").toUpperCase();
}

function hasAsciiControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) {
      return true;
    }
  }

  return false;
}

function hasUnsafePathFormatCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);

    if (
      codePoint === 0x061c ||
      codePoint === 0x200b ||
      codePoint === 0x200c ||
      codePoint === 0x200d ||
      codePoint === 0x200e ||
      codePoint === 0x200f ||
      codePoint === 0x2060 ||
      codePoint === 0xfeff ||
      (codePoint !== undefined && codePoint >= 0x202a && codePoint <= 0x202e) ||
      (codePoint !== undefined && codePoint >= 0x2066 && codePoint <= 0x2069)
    ) {
      return true;
    }
  }

  return false;
}
