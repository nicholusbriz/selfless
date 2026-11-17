import VerifiedBadge from '@/components/VerifiedBadge';

/**
 * Global user-name display with optional verified (blue tick) badge.
 *
 * Usage:
 *   <UserName firstName={user.firstName} lastName={user.lastName}
 *             hasVerifiedBadge={user.hasVerifiedBadge} />
 *
 * The tick only renders when `hasVerifiedBadge` is true, so it updates
 * automatically wherever the API returns the flag.
 */
export default function UserName({
  firstName,
  lastName,
  hasVerifiedBadge = false,
  className = '',
  badgeClassName = 'h-3.5 w-3.5',
}: {
  firstName?: string | null;
  lastName?: string | null;
  hasVerifiedBadge?: boolean | null;
  className?: string;
  badgeClassName?: string;
}) {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Unknown';

  return (
    <span className={`inline-flex min-w-0 items-center gap-1 ${className}`}>
      <span className="truncate">{name}</span>
      {hasVerifiedBadge && <VerifiedBadge className={badgeClassName} />}
    </span>
  );
}
