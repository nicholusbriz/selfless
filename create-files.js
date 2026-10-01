// ============================================================
//  create-files.js
//  Creates empty files for the social setup.
//  Run from C:\selfless\my-app\  with:  node create-files.js
// ============================================================

const fs = require('fs');
const path = require('path');

const root = process.cwd();

console.log(`=== Creating files in ${root} ===`);

// ---------- folders ----------
const folders = [
  'lib/social',
  'lib/hooks',
  'components/social',
];

for (const folder of folders) {
  const full = path.join(root, folder);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log(`  created folder ${folder}`);
  } else {
    console.log(`  folder already exists ${folder}`);
  }
}

// ---------- files ----------
const files = [
  // lib/social
  'lib/social/types.ts',
  'lib/social/endpoints.ts',
  'lib/social/cacheKeys.ts',
  'lib/social/patchHelpers.ts',
  'lib/social/ranking.ts',
  'lib/social/constants.ts',

  // lib/hooks
  'lib/hooks/useSocialActions.ts',

  // components/social
  'components/social/SocialActions.tsx',
  'components/social/UnfollowButton.tsx',
  'components/social/UnlikeButton.tsx',
  'components/social/index.ts',
];

for (const file of files) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, '', 'utf8');
    console.log(`  created ${file}`);
  } else {
    console.log(`  skipped (already exists) ${file}`);
  }
}

// ---------- summary ----------
console.log('');
console.log('=== Summary ===');
console.log('');

const listDir = (dir) => {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) return;
  console.log(`${dir}:`);
  for (const name of fs.readdirSync(full)) {
    const stat = fs.statSync(path.join(full, name));
    if (stat.isFile()) console.log(`  ${name}`);
  }
  console.log('');
};

listDir('lib/social');
listDir('lib/hooks');
listDir('components/social');

console.log('=== Done — 11 empty files ready ===');
console.log('Paste code into each file one by one.');