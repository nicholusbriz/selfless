export const CHAT_THEMES = [
  {
    id: 'classic',
    label: 'Classic',
    preview: '#1A2B4C',
    canvasColor: '#E8EDF2',
    incomingBubbleColor: '#FFFFFF',
    incomingTextColor: '#26354D',
    outgoingBubbleColor: '#1A2B4C',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    preview: '#176B83',
    canvasColor: '#B8DCE5',
    incomingBubbleColor: '#E8F7FA',
    incomingTextColor: '#244754',
    outgoingBubbleColor: '#176B83',
  },
  {
    id: 'forest',
    label: 'Forest',
    preview: '#315C3C',
    canvasColor: '#C8DEC9',
    incomingBubbleColor: '#EDF6EF',
    incomingTextColor: '#344A39',
    outgoingBubbleColor: '#315C3C',
  },
  {
    id: 'terracotta',
    label: 'Terracotta',
    preview: '#9B4E35',
    canvasColor: '#F0D3C4',
    incomingBubbleColor: '#FFF3ED',
    incomingTextColor: '#5D4036',
    outgoingBubbleColor: '#9B4E35',
  },
  {
    id: 'lavender',
    label: 'Lavender',
    preview: '#594477',
    canvasColor: '#D9CFE8',
    incomingBubbleColor: '#F5F0FB',
    incomingTextColor: '#443A55',
    outgoingBubbleColor: '#594477',
  },
  {
    id: 'profile-image',
    label: 'Profile image',
    preview: '#E8EDF2',
    canvasColor: '#F1F3F6',
    incomingBubbleColor: '#FFFFFF',
    incomingTextColor: '#26354D',
    outgoingBubbleColor: '#1A2B4C',
  },
] as const;

export type ChatTheme = (typeof CHAT_THEMES)[number]['id'];

export function isChatTheme(value: unknown): value is ChatTheme {
  return (
    typeof value === 'string' &&
    CHAT_THEMES.some((theme) => theme.id === value)
  );
}

export function getChatTheme(themeId: ChatTheme) {
  return CHAT_THEMES.find((theme) => theme.id === themeId) ?? CHAT_THEMES[0];
}
