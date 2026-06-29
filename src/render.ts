// SVG -> PNG with App Store compliance enforced: square (1024 by default),
// sRGB and NO alpha channel (Apple rejects transparency). Uses
// @resvg/resvg-js (supports embedded fonts) + a final sharp pass to enforce
// the dimensions and strip the alpha channel.

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

export interface RenderOptions {
  size?: number;
  fontFiles?: string[];
  fontFamily?: string;
  background?: string;
}

/** Render an SVG string to a 1:1, sRGB, alpha-free PNG buffer. */
export async function renderPng(svg: string, opts: RenderOptions = {}): Promise<Buffer> {
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
    .flatten({ background }) // remove any transparency
    .png()
    .toBuffer();
}
