// lib/social/constants.ts
// Shared tech-center hue map.

export const TECH_CENTER_HUES: Record<string, string> = {
  'Freedom City Tech Center': '#55705B',
  'Kampala Central': '#3E5C76',
  'Gulu Hub': '#7C3AED',
  'Mbarara Tech': '#B98A3E',
  'Jinja Center': '#A4462F',
};

export function getTechCenterHue(name?: string): string {
  if (!name) return '#9CA3AF';
  if (TECH_CENTER_HUES[name]) return TECH_CENTER_HUES[name];

  const palette = ['#55705B', '#3E5C76', '#7C3AED', '#B98A3E', '#A4462F', '#0F766E'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
