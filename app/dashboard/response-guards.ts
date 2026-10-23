export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRecordArray(
  value: unknown,
): value is Record<string, unknown>[] {
  return Array.isArray(value) && value.every(isRecord);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function getResponseError(
  value: unknown,
  fallback: string,
): string {
  if (!isRecord(value)) return fallback;
  if (typeof value.error === 'string' && value.error) return value.error;
  if (typeof value.message === 'string' && value.message) return value.message;
  return fallback;
}
