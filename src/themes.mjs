// Paletas predefinidas. Cada tema é um conjunto coerente de cores; podes passar
// um objeto com as mesmas chaves para um tema à medida.
//
//   top/mid/bottom — gradiente de fundo (canto a canto)
//   shadow         — sombras projetadas
//   accent/accentDeep — dourado/cor de destaque (badge, checks, preço, moldura)
//   text           — cor do texto principal
//   tile           — cor da marca/monograma no cartão cerâmico
//   ceramic        — fundo do cartão da marca

export const THEMES = {
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

export const DEFAULT_THEME = 'ocean';

/** Resolve o tema: nome conhecido, objeto à medida, ou o default. */
export function resolveTheme(theme) {
  if (theme && typeof theme === 'object') {
    return { ...THEMES[DEFAULT_THEME], ...theme };
  }
  return THEMES[theme] ?? THEMES[DEFAULT_THEME];
}
