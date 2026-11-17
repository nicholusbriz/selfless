import { BadgeCheck } from 'lucide-react';

export default function VerifiedBadge({
  className = 'h-4 w-4',
}: {
  className?: string;
}) {
  return (
    <BadgeCheck
      className={`shrink-0 fill-[#1D9BF0] text-white ${className}`}
      aria-label="Verified"
      role="img"
    />
  );
}
