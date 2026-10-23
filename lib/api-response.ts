export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function readJsonObject(
  response: Response,
): Promise<Record<string, unknown>> {
  const value: unknown = await response.json();
  return isJsonObject(value) ? value : {};
}

export function getStringProperty(
  value: Record<string, unknown>,
  key: string,
): string | undefined {
  const property = value[key];
  return typeof property === 'string' ? property : undefined;
}

export function getApiErrorMessage(value: unknown, fallback: string): string {
  if (!isJsonObject(value)) return fallback;

  const error = value.error;
  if (typeof error === 'string' && error) return error;

  const message = value.message;
  return typeof message === 'string' && message ? message : fallback;
}
