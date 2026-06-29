// Template "card": fundo com padrão + brilho, marca (ícone ou monograma) num
// cartão cerâmico, badge de destaque, título, subtítulo, painel de benefícios
// com checks, e preço. Constrói um SVG 1024×1024 puro (depois renderizado em PNG).

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Estrela de 5 pontas centrada em (cx,cy). */
function star(cx, cy, r, fill) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + rad * Math.cos(ang)).toFixed(1)},${(cy + rad * Math.sin(ang)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
}

/** Check (círculo de destaque + visto) centrado em (cx,cy). */
function check(cx, cy, t) {
  return `<circle cx="${cx}" cy="${cy}" r="19" fill="url(#gAccent)"/>
    <path d="M${cx - 8} ${cy} l5 6 l11 -13" fill="none" stroke="${t.bottom}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function defs(t) {
  return `<defs>
    <linearGradient id="gBg" x1="0.15" y1="0" x2="0.85" y2="1">
      <stop offset="0" stop-color="${t.top}"/><stop offset="0.55" stop-color="${t.mid}"/><stop offset="1" stop-color="${t.bottom}"/>
    </linearGradient>
    <radialGradient id="gGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.28"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gCeramic" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${t.ceramic}"/>
    </linearGradient>
    <linearGradient id="gAccent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.55"/><stop offset="0.18" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accentDeep}"/>
    </linearGradient>
    <pattern id="tilePattern" width="168" height="168" patternUnits="userSpaceOnUse" patternTransform="rotate(45 512 512)">
      <g fill="none" stroke="#FFFFFF" stroke-opacity="0.06" stroke-width="3">
        <circle cx="84" cy="0" r="40"/><circle cx="0" cy="84" r="40"/>
        <circle cx="168" cy="84" r="40"/><circle cx="84" cy="168" r="40"/>
      </g>
      <circle cx="84" cy="84" r="7" fill="#FFFFFF" fill-opacity="0.06"/>
    </pattern>
    <filter id="blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22"/></filter>
  </defs>`;
}

/** Marca: ícone fornecido (dentro de cartão cerâmico) ou monograma. */
function mark(cfg, t) {
  const size = 300;
  const cx = 512;
  const cy = 268;
  const x = cx - size / 2;
  const y = cy - size / 2;
  const shadow = `<rect x="${x}" y="${y + 14}" width="${size}" height="${size}" rx="68" fill="${t.shadow}" opacity="0.32" filter="url(#blur)"/>`;
  const card = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="68" fill="url(#gCeramic)"/>`;
  let inner;
  if (cfg.iconDataUri) {
    const pad = 16;
    inner = `<clipPath id="clipIcon"><rect x="${x + pad}" y="${y + pad}" width="${size - 2 * pad}" height="${size - 2 * pad}" rx="54"/></clipPath>
      <image href="${cfg.iconDataUri}" x="${x + pad}" y="${y + pad}" width="${size - 2 * pad}" height="${size - 2 * pad}" preserveAspectRatio="xMidYMid slice" clip-path="url(#clipIcon)"/>`;
  } else {
    inner = `<text x="${cx}" y="${cy + size * 0.17}" font-family="${cfg.fontFamily}" font-size="${size * 0.5}" font-weight="900" fill="${t.tile}" text-anchor="middle">${esc(cfg.monogram)}</text>`;
  }
  const border = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="68" fill="none" stroke="${t.tile}" stroke-opacity="0.16" stroke-width="6"/>`;
  return shadow + card + inner + border;
}

export function buildSvg(cfg) {
  const t = cfg.theme;
  const f = `font-family="${cfg.fontFamily}"`;

  const bg = `<rect width="1024" height="1024" fill="url(#gBg)"/>
    ${cfg.pattern ? '<rect width="1024" height="1024" fill="url(#tilePattern)"/>' : ''}
    <ellipse cx="512" cy="270" rx="300" ry="250" fill="url(#gGlow)"/>`;

  const frame = `<rect x="46" y="46" width="932" height="932" rx="76" fill="none" stroke="${t.accent}" stroke-opacity="0.28" stroke-width="2.5"/>`;

  // Badge com gloss e sombra.
  const badgeText = esc((cfg.badge || '').toUpperCase());
  const badge = badgeText
    ? (() => {
      const w = Math.max(300, 150 + badgeText.length * 30);
      const bx = 512 - w / 2;
      return `<g transform="translate(${bx} 452)">
        <rect x="0" y="7" width="${w}" height="72" rx="36" fill="${t.shadow}" opacity="0.28" filter="url(#blur)"/>
        <rect width="${w}" height="72" rx="36" fill="url(#gAccent)"/>
        <rect x="3" y="3" width="${w - 6}" height="34" rx="31" fill="#FFFFFF" fill-opacity="0.22"/>
        ${star(44, 36, 19, t.bottom)}
        <text x="${(w + 44) / 2 + 8}" y="49" ${f} font-size="38" font-weight="800" fill="${t.bottom}" text-anchor="middle" letter-spacing="5">${badgeText}</text>
      </g>`;
    })()
    : '';

  const titleY = badgeText ? 620 : 590;
  const title = `<text x="512" y="${titleY + 4}" ${f} font-size="102" font-weight="900" fill="${t.shadow}" fill-opacity="0.35" text-anchor="middle">${esc(cfg.title)}</text>
    <text x="512" y="${titleY}" ${f} font-size="102" font-weight="900" fill="${t.text}" text-anchor="middle">${esc(cfg.title)}</text>`;

  const subtitle = cfg.subtitle
    ? `<text x="512" y="${titleY + 56}" ${f} font-size="42" font-weight="600" fill="${t.text}" fill-opacity="0.8" text-anchor="middle">${esc(cfg.subtitle)}</text>`
    : '';

  // Painel "vidro" com os benefícios.
  let panel = '';
  if (cfg.benefits && cfg.benefits.length) {
    const px = 162;
    const pw = 700;
    const py = cfg.subtitle ? 712 : 690;
    const ph = 196;
    const rows = cfg.benefits.length;
    const firstY = py + ph / (rows * 2) + 8;
    const stepY = ph / rows;
    const items = cfg.benefits
      .map((b, i) => {
        const cy = firstY + i * stepY;
        return `${check(px + 62, cy - 12, t)}<text x="${px + 100}" y="${cy}" ${f} font-size="38" font-weight="600" fill="${t.text}" fill-opacity="0.95">${esc(b)}</text>`;
      })
      .join('\n');
    panel = `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="40" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.14" stroke-width="1.5"/>${items}`;
  }

  const price = cfg.price
    ? `<text x="512" y="966" ${f} font-size="56" font-weight="800" fill="url(#gAccent)" text-anchor="middle">${esc(cfg.price)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs(t)}${bg}${frame}${mark(cfg, t)}${badge}${title}${subtitle}${panel}${price}</svg>`;
}
