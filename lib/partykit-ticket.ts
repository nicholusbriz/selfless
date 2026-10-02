function encodeBytes(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBytes(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function createPartyTicket(
  userId: string,
  secret: string,
): Promise<{ ticket: string; expiresAt: number }> {
  const expiresAt = Date.now() + 2 * 60 * 1000;
  const payload = encodeBytes(
    new TextEncoder().encode(JSON.stringify({ userId, expiresAt })),
  );
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );

  return { ticket: `${payload}.${encodeBytes(new Uint8Array(signature))}`, expiresAt };
}

export async function verifyPartyTicket(
  ticket: string,
  secret: string,
): Promise<string | null> {
  try {
    const [payload, signature, extra] = ticket.split('.');
    if (!payload || !signature || extra !== undefined) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBytes(signature),
      new TextEncoder().encode(payload),
    );
    if (!valid) return null;

    const claims = JSON.parse(
      new TextDecoder().decode(decodeBytes(payload)),
    ) as { userId?: unknown; expiresAt?: unknown };
    if (
      typeof claims.userId !== 'string' ||
      typeof claims.expiresAt !== 'number' ||
      claims.expiresAt <= Date.now() ||
      claims.expiresAt > Date.now() + 3 * 60 * 1000
    ) {
      return null;
    }

    return claims.userId;
  } catch {
    return null;
  }
}