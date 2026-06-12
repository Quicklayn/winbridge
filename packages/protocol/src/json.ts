import { z } from "zod";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };
export type JsonObject = Record<string, JsonValue>;
export type JsonObjectSchema = z.ZodType<JsonObject, z.ZodTypeDef, unknown>;

type CanonicalizeOptions = {
  omitUndefinedObjectProperties: boolean;
};

const rejectUndefinedProperties: CanonicalizeOptions = {
  omitUndefinedObjectProperties: false
};
const omitUndefinedProperties: CanonicalizeOptions = {
  omitUndefinedObjectProperties: true
};

export function createJsonObjectSchema(message: string): JsonObjectSchema {
  return z.unknown().transform((value, context): JsonObject => {
    const parsed = canonicalizeJsonObject(value);
    if (!parsed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message
      });
      return z.NEVER;
    }

    return parsed;
  });
}

export function stringifyJson(value: unknown): string {
  const parsed = canonicalizeJsonValue(value, new WeakSet<object>(), omitUndefinedProperties);
  if (parsed === undefined) {
    throw new Error("Value must be JSON-compatible");
  }

  return JSON.stringify(parsed);
}

export function isJsonObject(value: unknown): value is JsonObject {
  return canonicalizeJsonObject(value) !== undefined;
}

function canonicalizeJsonObject(value: unknown): JsonObject | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value) || !isPlainJsonObject(value)) {
    return undefined;
  }

  const ancestors = new WeakSet<object>();
  ancestors.add(value);
  const parsed = canonicalizeObjectEntries(value, ancestors, rejectUndefinedProperties);
  ancestors.delete(value);
  return parsed;
}

function canonicalizeJsonValue(
  value: unknown,
  ancestors = new WeakSet<object>(),
  options = rejectUndefinedProperties
): JsonValue | undefined {
  if (value === null) {
    return null;
  }

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  if (ancestors.has(value)) {
    return undefined;
  }
  ancestors.add(value);

  const parsed = Array.isArray(value)
    ? canonicalizeJsonArray(value, ancestors, options)
    : isPlainJsonObject(value)
      ? canonicalizeObjectEntries(value, ancestors, options)
      : undefined;

  ancestors.delete(value);
  return parsed;
}

function isPlainJsonObject(value: object): value is Record<string, unknown> {
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

function canonicalizeJsonArray(
  value: unknown[],
  ancestors: WeakSet<object>,
  options: CanonicalizeOptions
): JsonValue[] | undefined {
  let propertyNames: string[];
  try {
    if (Object.getOwnPropertySymbols(value).length > 0) {
      return undefined;
    }
    propertyNames = Object.getOwnPropertyNames(value);
  } catch {
    return undefined;
  }

  const lengthDescriptor = getOwnPropertyDescriptor(value, "length");
  if (!lengthDescriptor || !("value" in lengthDescriptor) || !isSafeArrayLength(lengthDescriptor.value)) {
    return undefined;
  }
  const length = lengthDescriptor.value;

  for (const key of propertyNames) {
    if (key === "length") {
      continue;
    }

    const descriptor = getOwnPropertyDescriptor(value, key);
    if (
      !descriptor?.enumerable ||
      !("value" in descriptor) ||
      !isArrayIndexKey(key, length)
    ) {
      return undefined;
    }
  }

  const result: JsonValue[] = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      return undefined;
    }

    const parsed = canonicalizeJsonValue(descriptor.value, ancestors, options);
    if (parsed === undefined) {
      return undefined;
    }
    result.push(parsed);
  }

  Object.setPrototypeOf(result, null);
  return result;
}

function canonicalizeObjectEntries(
  value: object,
  ancestors: WeakSet<object>,
  options: CanonicalizeOptions
): JsonObject | undefined {
  let propertyNames: string[];
  try {
    if (Object.getOwnPropertySymbols(value).length > 0) {
      return undefined;
    }
    propertyNames = Object.getOwnPropertyNames(value);
  } catch {
    return undefined;
  }

  const result = Object.create(null) as JsonObject;
  for (const key of propertyNames) {
    const descriptor = getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !("value" in descriptor)) {
      return undefined;
    }

    const parsed = canonicalizeJsonValue(descriptor.value, ancestors, options);
    if (parsed === undefined) {
      if (options.omitUndefinedObjectProperties && descriptor.value === undefined) {
        continue;
      }

      return undefined;
    }

    Object.defineProperty(result, key, {
      configurable: true,
      enumerable: true,
      value: parsed,
      writable: true
    });
  }

  return result;
}

function getOwnPropertyDescriptor(
  value: object,
  key: string
): PropertyDescriptor | undefined {
  try {
    return Object.getOwnPropertyDescriptor(value, key);
  } catch {
    return undefined;
  }
}

function isSafeArrayLength(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= Number.MAX_SAFE_INTEGER
  );
}

function isArrayIndexKey(key: string, length: number): boolean {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < length && String(index) === key;
}
