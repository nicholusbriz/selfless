interface NameParts {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
}

function cleanNamePart(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  const cleaned = value.trim();
  return /^(undefined|null)$/i.test(cleaned) ? '' : cleaned;
}

export function getDisplayName(
  user: NameParts | null | undefined,
  fallback = 'Unknown User',
): string {
  if (!user) return fallback;

  const fullName = cleanNamePart(user.fullName);
  if (fullName) {
    const parts = fullName.split(/\s+/);
    if (!parts.some((part) => /^(undefined|null)$/i.test(part))) {
      return fullName;
    }
  }

  const profileName = [user.firstName, user.lastName]
    .map(cleanNamePart)
    .filter(Boolean)
    .join(' ');

  return profileName || fallback;
}
