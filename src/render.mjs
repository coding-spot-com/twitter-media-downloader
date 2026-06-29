// Renderização SVG → PNG, com a conformidade da App Store garantida:
// tamanho quadrado (1024 por defeito), sRGB e SEM canal alpha (a Apple rejeita
// transparência). Usa @resvg/resvg-js (suporta fontes embebidas) + um passe
// final pelo sharp para impor dimensões e remover o alpha.

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

/**
 * @param {string} svg
 * @param {{ size?: number, fontFiles?: string[], fontFamily?: string, background?: string }} opts
 * @returns {Promise<Buffer>} PNG 1:1, sRGB, sem alpha
 */
export async function renderPng(svg, opts = {}) {
  const size = opts.size ?? 1024;
  const background = opts.background ?? '#000000';

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    font: {
      fontFiles: opts.fontFiles ?? [],
      loadSystemFonts: true,
      defaultFontFamily: opts.fontFamily ?? 'sans-serif',
    },
    background,
  });
  const png = resvg.render().asPng();

  return sharp(png)
    .resize(size, size)
    .flatten({ background }) // remove qualquer transparência
    .png()
    .toBuffer();
}
