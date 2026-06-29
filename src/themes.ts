// Built-in color presets. Each theme is a coherent palette; pass an object with
// the same keys for a custom theme.

export interface Theme {
  /** Background gradient (corner to corner). */
  top: string;
  mid: string;
  bottom: string;
  /** Drop shadows. */
  shadow: string;
  /** Highlight color used by the badge, checks, price and frame. */
  accent: string;
  accentDeep: string;
  /** Primary text color. */
  text: string;
  /** Brand mark / monogram color on the ceramic card. */
  tile: string;
  /** Ceramic card background. */
  ceramic: string;
}

export type ThemeName = 'ocean' | 'midnight' | 'sunset' | 'forest';

export const THEMES: Record<ThemeName, Theme> = {
  ocean: {
    top: '#3A82C8', mid: '#0E3A66', bottom: '#0A2A4D', shadow: '#04162B',
    accent: '#F4C95D', accentDeep: '#DDA12A', text: '#FFFFFF', tile: '#1D5C9E', ceramic: '#F3EEE3',
  },
  midnight: {
    top: '#3B3A86', mid: '#1E1B4B', bottom: '#121029', shadow: '#0A0820',
    accent: '#FBBF24', accentDeep: '#D99A1C', text: '#FFFFFF', tile: '#4338CA', ceramic: '#F5F3FF',
  },
  sunset: {
    top: '#FB7185', mid: '#9D174D', bottom: '#6B1133', shadow: '#4C0519',
    accent: '#FDE68A', accentDeep: '#F59E0B', text: '#FFFFFF', tile: '#BE123C', ceramic: '#FFF7ED',
  },
  forest: {
    top: '#34D399', mid: '#065F46', bottom: '#043D2C', shadow: '#022C22',
    accent: '#FDE68A', accentDeep: '#D97706', text: '#FFFFFF', tile: '#047857', ceramic: '#ECFDF5',
  },
};

export const DEFAULT_THEME: ThemeName = 'ocean';

/** Resolve a theme: a known name, a custom object, or the default. */
export function resolveTheme(theme?: ThemeName | Theme): Theme {
  if (theme && typeof theme === 'object') {
    return { ...THEMES[DEFAULT_THEME], ...theme };
  }
  return THEMES[theme as ThemeName] ?? THEMES[DEFAULT_THEME];
}
