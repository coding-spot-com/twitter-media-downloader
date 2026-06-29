# iap-promo

[![CI](https://github.com/coding-spot-com/iap-promo/actions/workflows/ci.yml/badge.svg)](https://github.com/coding-spot-com/iap-promo/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/iap-promo.svg)](https://www.npmjs.com/package/iap-promo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/iap-promo.svg)](./dist/index.d.ts)

Generate **App Store-compliant promoted In-App Purchase images** — 1024×1024
original artwork, not screenshots.

Apple's **Guideline 2.3.2** rejects promotional images for promoted IAPs when
they're just a screenshot of your app:

> _"Your promotional image is a screenshot taken from the app."_

`iap-promo` renders original marketing art that is **compliant by construction**:
1024×1024, sRGB, **no alpha/transparency**, no rounded corners (Apple adds those).
Point it at your icon, give it a title/benefits/price, and ship.

![example](docs/example.png)

## Install

```bash
npm i -D iap-promo
# or run once:
npx iap-promo --help
```

## CLI

```bash
npx iap-promo \
  --title "My App Premium" \
  --badge PREMIUM \
  --subtitle "Unlock everything" \
  --benefits "No ads|Offline mode|Pro themes" \
  --price "$2.99/mo" \
  --icon ./assets/icon.png \
  --theme ocean \
  --out promo.png
```

Or from a config file (flags override it):

```bash
npx iap-promo --config iap-promo.config.json
```

```json
{
  "title": "Quiz Diário",
  "badge": "PREMIUM",
  "subtitle": "Tudo desbloqueado",
  "benefits": ["Arquivo de 30 dias", "Modos temáticos", "Sem limites"],
  "price": "1,99 €/mês",
  "theme": "ocean",
  "out": "promo.png"
}
```

### Brand font

`librsvg`-based tools can't embed custom fonts; `iap-promo` uses
[`@resvg/resvg-js`](https://github.com/yisibl/resvg-js), so you can pass your
own. Match the family name to the font file's internal name:

```bash
npx iap-promo --title "My App" --font ./Nunito-Black.ttf --font-family Nunito ...
```

Without `--font`, it uses an available system sans-serif.

## Programmatic API

```js
import { generatePromo, renderToFile, THEMES } from 'iap-promo';

await renderToFile(
  {
    title: 'My App Premium',
    badge: 'PREMIUM',
    benefits: ['No ads', 'Offline mode', 'Pro themes'],
    price: '$2.99/mo',
    icon: './assets/icon.png',
    theme: 'ocean',          // or a custom { top, mid, bottom, accent, ... }
    fontFiles: ['./Nunito.ttf'],
    fontFamily: 'Nunito',
  },
  './promo.png',
);

// or get the buffers (e.g. to upload via the App Store Connect API):
const { png, svg } = await generatePromo({ title: 'My App', theme: 'midnight' });
```

## Options

| Option | Description |
| --- | --- |
| `title` | Product/app name (required) |
| `badge` | Pill text (e.g. `PREMIUM`); empty hides it |
| `subtitle` | One-line subtitle |
| `benefits` | Up to 3 benefits (array, or `"a\|b\|c"`) |
| `price` | Price line (e.g. `"$2.99/mo"`) |
| `icon` | App icon path (png/jpg) shown in the card |
| `monogram` | Fallback letter when no `icon` |
| `theme` | `ocean` · `midnight` · `sunset` · `forest`, or a custom object |
| `fontFiles` / `font` | Font file(s) to embed |
| `fontFamily` | Family name used in the artwork |
| `pattern` | Background tile pattern (default on; `--no-pattern` to disable) |
| `size` | Output size (Apple requires `1024`) |

## Themes

`ocean` (default), `midnight`, `sunset`, `forest`. Or pass a custom palette:

```js
theme: {
  top: '#3A82C8', mid: '#0E3A66', bottom: '#0A2A4D', shadow: '#04162B',
  accent: '#F4C95D', accentDeep: '#DDA12A', text: '#FFFFFF',
  tile: '#1D5C9E', ceramic: '#F3EEE3',
}
```

## What it guarantees

- **1024×1024**, square (Apple's required size)
- **sRGB, no alpha** — flattened, so it never trips the "transparency" checks
- **Original art** — no screenshots, no device frames → passes Guideline 2.3.2
- Deterministic output (same input → same image)

## Development

Written in TypeScript, bundled with [tsup](https://tsup.egoist.dev/) (ESM + type
declarations).

```bash
npm install
npm run build      # -> dist/ (index.js, cli.js, index.d.ts)
npm test           # vitest
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
```

## License

MIT

