// Public API for iap-promo.
//
//   import { generatePromo, renderToFile, THEMES } from 'iap-promo';
//   await renderToFile(
//     { title: 'My App Premium', badge: 'PREMIUM', benefits: ['No ads', 'Offline mode'],
//       price: '$2.99/mo', icon: './icon.png' },
//     './promo.png',
//   );

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSvg, type RenderConfig } from './template.js';
import { renderPng } from './render.js';
import { resolveTheme, THEMES } from './themes.js';
import type { Theme, ThemeName } from './themes.js';

export { THEMES };
export type { Theme, ThemeName };

/** User-facing configuration. */
export interface PromoConfig {
  /** Product/app name (required in practice; defaults to "My App"). */
  title?: string;
  /** One-line subtitle. */
  subtitle?: string;
  /** Pill text (e.g. "PREMIUM"); empty hides it. */
  badge?: string;
  /** Up to 3 benefits, as an array or a pipe-separated string. */
  benefits?: string[] | string;
  /** Price line (e.g. "$2.99/mo"). */
  price?: string;
  /** App icon path (png/jpg) shown in the card. */
  icon?: string;
  /** Fallback letter when no icon is given (defaults to the title initial). */
  monogram?: string;
  /** Built-in theme name or a custom palette. */
  theme?: ThemeName | Theme;
  /** Font files to embed (.ttf/.otf). */
  fontFiles?: string[];
  /** Font family name used in the artwork (match the embedded font's name). */
  fontFamily?: string;
  /** Background tile pattern (default true). */
  pattern?: boolean;
  /** Output size in px (Apple requires 1024). */
  size?: number;
}

export interface PromoResult {
  png: Buffer;
  svg: string;
  size: number;
}

const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

async function iconToDataUri(iconPath: string): Promise<string> {
  const ext = path.extname(iconPath).toLowerCase();
  const mime = MIME[ext] ?? 'image/png';
  const buf = await readFile(iconPath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function normalize(config: PromoConfig): Promise<RenderConfig & { size: number; fontFiles: string[] }> {
  const benefits = Array.isArray(config.benefits)
    ? config.benefits
    : typeof config.benefits === 'string'
      ? config.benefits.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

  const title = (config.title ?? 'My App').trim();

  return {
    title,
    subtitle: config.subtitle ?? '',
    badge: config.badge ?? '',
    benefits: benefits.slice(0, 3),
    price: config.price ?? '',
    monogram: (config.monogram ?? title.charAt(0) ?? '?').toUpperCase(),
    iconDataUri: config.icon ? await iconToDataUri(config.icon) : null,
    theme: resolveTheme(config.theme),
    fontFamily: config.fontFamily ?? 'sans-serif',
    fontFiles: config.fontFiles ?? [],
    pattern: config.pattern !== false,
    size: config.size ?? 1024,
  };
}

/** Generate the promo image. Returns the PNG buffer and the SVG source. */
export async function generatePromo(config: PromoConfig = {}): Promise<PromoResult> {
  const cfg = await normalize(config);
  const svg = buildSvg(cfg);
  const png = await renderPng(svg, {
    size: cfg.size,
    fontFiles: cfg.fontFiles,
    fontFamily: cfg.fontFamily,
    background: cfg.theme.bottom,
  });
  return { png, svg, size: cfg.size };
}

/** Generate and write to disk (creates parent dirs as needed). */
export async function renderToFile(
  config: PromoConfig,
  outPath: string,
): Promise<{ outPath: string; size: number }> {
  const { png, size } = await generatePromo(config);
  const dir = path.dirname(outPath);
  if (dir && dir !== '.') await mkdir(dir, { recursive: true });
  await writeFile(outPath, png);
  return { outPath, size };
}
