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
  "Audit log path must be non-blank, already trimmed, 1024 UTF-8 bytes or less, and contain no ASCII control characters";

export class MemoryAuditSink implements AuditSink {
  private readonly entries: AuditRecord[] = [];

  write(input: AuditRecordInput): AuditRecord {
    const record = deepFreeze(createAuditRecord(input));
    this.entries.push(record);
    return record;
  }

  records(): AuditRecord[] {
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
    hasAsciiControlCharacter(value)
  ) {
    throw new Error(message);
  }
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
