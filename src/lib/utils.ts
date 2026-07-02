export function getContrastColor(hexColor: string) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export const DEFAULT_TIER_COLORS: Record<string, string> = {
  "91~100": "#FF7043",
  "81~90": "#FFA726",
  "71~80": "#FFEE58",
  "61~70": "#66BB6A",
  "51~60": "#42A5F5",
  "41~50": "#5C6BC0",
  "31~40": "#AB47BC",
  "21~30": "#EF5350",
  "11~20": "#8D6E63",
  "0~10": "#78909C"
};
