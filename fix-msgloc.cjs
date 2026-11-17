const fs = require('fs');
const eol = (s) => (s.includes('\r\n') ? '\r\n' : '\n');

// /api/users — resolve previousTechCenter for super_admin
{
  const p = 'app/api/users/route.ts';
  let s = fs.readFileSync(p, 'utf8');
  const e = eol(s);
  const J = (l) => l.join(e);
  // select previousTechCenterId
  s = s.replace(
    J(['        techCenter: {', '          select: {', '            id: true,', '            name: true,', '          },', '        },']),
    J(['        previousTechCenterId: true,', '        techCenter: {', '          select: {', '            id: true,', '            name: true,', '          },', '        },']),
  );
  // resolve + map
  const oldMap = J([
    '    // Map profileImageUrl to image for frontend compatibility',
    '    const usersWithImage = users',
    '      .map((user) => ({',
  ]);
  const newMap = J([
    '    // Super admins keep their previous tech center — resolve it for display',
    '    const prevIds = Array.from(',
    '      new Set(',
    '        users',
    "          .filter((u) => u.role?.name === 'super_admin' && !u.techCenter && u.previousTechCenterId)",
    '          .map((u) => u.previousTechCenterId as string),',
    '      ),',
    '    );',
    '    const prevCenters = prevIds.length',
    '      ? await prisma.techCenter.findMany({',
    '          where: { id: { in: prevIds } },',
    '          select: { id: true, name: true },',
    '        })',
    '      : [];',
    '    const prevById = new Map(prevCenters.map((c) => [c.id, c]));',
    '',
    '    // Map profileImageUrl to image for frontend compatibility',
    '    const usersWithImage = users',
    '      .map((user) => {',
    '        const techCenter =',
    "          user.techCenter ??",
    "          (user.role?.name === 'super_admin' && user.previousTechCenterId",
    '            ? prevById.get(user.previousTechCenterId) ?? null',
    '            : null);',
    '        return {',
    '          ...user,',
    '          techCenter,',
    '          image: user.profileImageUrl,',
    "          roleName: user.role?.name ?? '',",
    "          roleDisplayName: user.role?.displayName ?? '',",
    '        };',
    '      })',
  ]);
  if (!s.includes(oldMap)) { console.log('MISS users map'); process.exit(1); }
  s = s.replace(oldMap, newMap);
  // close the map callback: original ended ".map((user) => ({...}))" — our version returns object then needs "));" fixed below
  // The original chain was .map((user) => ({ ...fields })).sort(...)
  // We replaced the opening; now fix the tail: original had "      }))\n      .sort"
  s = s.replace(
    J(['      }))', '      .sort((a, b) => {']),
    J(['        };', '      })', '      .sort((a, b) => {']),
  );
  fs.writeFileSync(p, s);
  console.log('users route done');
}
