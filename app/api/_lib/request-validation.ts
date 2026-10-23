export type JsonGuard<T> = (value: unknown) => value is T;

type JsonSchema = Record<string, (value: unknown) => boolean>;
type ParsedJsonSchema<Schema extends JsonSchema> = {
  [Key in keyof Schema]: Schema[Key] extends JsonGuard<infer Value>
    ? Value
    : never;
};

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const isString: JsonGuard<string> = (
  value,
): value is string => typeof value === 'string';

export const isNumber: JsonGuard<number> = (
  value,
): value is number => typeof value === 'number' && Number.isFinite(value);

export const isBoolean: JsonGuard<boolean> = (
  value,
): value is boolean => typeof value === 'boolean';

export const isStringOrNumber: JsonGuard<string | number> = (
  value,
): value is string | number =>
  typeof value === 'string' ||
  (typeof value === 'number' && Number.isFinite(value));

export const isArray: JsonGuard<unknown[]> = (
  value,
): value is unknown[] => Array.isArray(value);

export const isStringArray: JsonGuard<string[]> = (
  value,
): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

export const isStringOrStringArray: JsonGuard<string | string[]> = (
  value,
): value is string | string[] =>
  typeof value === 'string' ||
  (Array.isArray(value) && value.every((item) => typeof item === 'string'));

export function optional<T>(guard: JsonGuard<T>): JsonGuard<T | undefined> {
  return (value): value is T | undefined =>
    value === undefined || guard(value);
}

export function nullable<T>(guard: JsonGuard<T>): JsonGuard<T | null> {
  return (value): value is T | null => value === null || guard(value);
}

export async function parseJsonBody<Schema extends JsonSchema>(
  request: Request,
  schema: Schema,
): Promise<ParsedJsonSchema<Schema> | null> {
  let parsed: unknown;

  try {
    parsed = await request.json();
  } catch {
    return null;
  }

  if (!isJsonObject(parsed)) {
    return null;
  }

  for (const [key, guard] of Object.entries(schema)) {
    if (!guard(parsed[key])) {
      return null;
    }
  }

  return parsed as ParsedJsonSchema<Schema>;
}

export function invalidJsonBodyResponse(): Response {
  return Response.json({ error: 'Invalid request body' }, { status: 400 });
}
