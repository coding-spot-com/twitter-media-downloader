// API pública do iap-promo.
//
//   import { generatePromo, renderToFile, THEMES } from 'iap-promo';
//   await renderToFile({ title: 'My App Premium', badge: 'PREMIUM',
//     benefits: ['No ads', 'Offline mode'], price: '$2.99/mo', icon: './icon.png' },
//     './promo.png');

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { buildSvg } from './template.mjs';
import { renderPng } from './render.mjs';
import { resolveTheme, THEMES } from './themes.mjs';

export { THEMES };

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' };

async function iconToDataUri(iconPath) {
  const ext = path.extname(iconPath).toLowerCase();
  const mime = MIME[ext] ?? 'image/png';
  const buf = await readFile(iconPath);
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/** Normaliza a config do utilizador para o formato que o template espera. */
async function normalize(config = {}) {
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

/**
 * Gera a imagem promocional. Devolve o PNG (Buffer) e o SVG (string).
 * @param {object} config
 * @returns {Promise<{ png: Buffer, svg: string, size: number }>}
 */
export async function generatePromo(config = {}) {
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

/**
 * Gera e grava em disco. Se `outPath` terminar noutra extensão que não .png,
 * grava na mesma o PNG (a App Store exige PNG/JPEG sem alpha).
 * @returns {Promise<{ outPath: string, size: number }>}
 */
export async function renderToFile(config, outPath) {
  const { png, size } = await generatePromo(config);
  const dir = path.dirname(outPath);
  if (dir && dir !== '.') await mkdir(dir, { recursive: true });
  await writeFile(outPath, png);
  return { outPath, size };
}
