const fs = require('fs');
const eol = (s) => (s.includes('\r\n') ? '\r\n' : '\n');
const J = (lines, e) => lines.join(e);

// 1) OnlineUsersContext — types + map
{
  const p = 'lib/contexts/OnlineUsersContext.tsx';
  let s = fs.readFileSync(p, 'utf8');
  const e = eol(s);
  // OnlineUser interface
  s = s.replace(
    J(['  fullName?: string;', '  image?: string | null;'], e),
    J(['  fullName?: string;', '  hasVerifiedBadge?: boolean | null;', '  image?: string | null;'], e),
  );
  // PresenceProfile interface — add after profileImageUrl
  s = s.replace(
    J(['  profileImageUrl: string | null;', '  techCenter: {'], e),
    J(['  profileImageUrl: string | null;', '  hasVerifiedBadge?: boolean | null;', '  techCenter: {'], e),
  );
  // map profile -> onlineUser
  s = s.replace(
    J(['                    fullName: `${profile.firstName} ${profile.lastName}`.trim(),', '                    image: profile.profileImageUrl,'], e),
    J(['                    fullName: `${profile.firstName} ${profile.lastName}`.trim(),', '                    hasVerifiedBadge: profile.hasVerifiedBadge,', '                    image: profile.profileImageUrl,'], e),
  );
  fs.writeFileSync(p, s);
  console.log('context done');
}

// 2) GlobalOnlineUsersPopup — badge next to name
{
  const p = 'components/GlobalOnlineUsersPopup.tsx';
  let s = fs.readFileSync(p, 'utf8');
  const e = eol(s);
  // find name render — look for displayName usage in JSX
  const nameIdx = s.indexOf('displayName');
  console.log('popup displayName idx:', nameIdx);
  // add import if missing
  if (!s.includes('VerifiedBadge')) {
    s = s.replace(/(import .* from '.*';\n)/, "$1import VerifiedBadge from '@/components/VerifiedBadge';\n");
  }
  fs.writeFileSync(p, s);
  console.log('popup import done');
}
