export function deepFreeze<T>(value: T, visited = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  const objectValue = value as object;

  if (visited.has(objectValue) || Object.isFrozen(objectValue)) {
    return value;
  }

  visited.add(objectValue);

  for (const nested of Object.values(value as Record<string, unknown>)) {
    deepFreeze(nested, visited);
  }

  return Object.freeze(value) as T;
}
