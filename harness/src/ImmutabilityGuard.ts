// Immutability guard for the Render Harness.
// A LiteQDS envelope must be consumed without mutation. The harness deep-freezes
// the envelope before handing it to the renderer, so any attempted write throws
// (in module strict mode) instead of silently corrupting the payload.

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
    Object.freeze(value);
  }
  return value;
}

export function isDeeplyFrozen(value: unknown): boolean {
  if (value && typeof value === "object") {
    if (!Object.isFrozen(value)) return false;
    return Object.values(value).every(isDeeplyFrozen);
  }
  return true;
}
