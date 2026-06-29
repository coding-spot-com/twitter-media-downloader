#!/usr/bin/env node
// CLI do iap-promo.
//
//   npx iap-promo --title "My App Premium" --badge PREMIUM \
//     --subtitle "Unlock everything" --benefits "No ads|Offline mode|Pro themes" \
//     --price "$2.99/mo" --icon ./icon.png --theme ocean --out promo.png
//
//   npx iap-promo --config iap-promo.config.json
//   npx iap-promo --font ./Nunito.ttf --font-family Nunito ...

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { renderToFile, THEMES } from '../src/index.mjs';

const HELP = `iap-promo — App Store-compliant promoted IAP images (1024x1024, original art).

Usage:
  iap-promo [options]

Options:
  --title <text>            Product/app name (required)            [default: "My App"]
  --badge <text>            Pill text (e.g. PREMIUM). Empty to hide.
  --subtitle <text>         One-line subtitle.
  --benefits "a|b|c"        Up to 3 benefits, pipe-separated.
  --price <text>            Price line (e.g. "$2.99/mo").
  --icon <path>             App icon (png/jpg) shown in the card.
  --monogram <char>         Fallback letter when no --icon (default: first letter of title).
  --theme <name|json>       ${Object.keys(THEMES).join(' | ')}      [default: ocean]
  --font <path>             Font file (.ttf/.otf). Repeatable.
  --font-family <name>      Font family name used in the artwork (match the font's name).
  --no-pattern             Disable the background tile pattern.
  --size <px>               Output size (Apple requires 1024).      [default: 1024]
  --config <path>           Load options from a JSON file (flags override it).
  --out <path>              Output PNG path.                         [default: promo.png]
  -h, --help                Show this help.

Why: Apple Guideline 2.3.2 rejects promoted-IAP images that are screenshots.
iap-promo renders ORIGINAL art that is compliant by construction (1024x1024,
sRGB, no alpha, no rounded corners).`;

function parse(argv) {
  const opts = { fontFiles: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[(i += 1)];
    switch (a) {
      case '-h': case '--help': opts.help = true; break;
      case '--title': opts.title = next(); break;
      case '--badge': opts.badge = next(); break;
      case '--subtitle': opts.subtitle = next(); break;
      case '--benefits': opts.benefits = next(); break;
      case '--price': opts.price = next(); break;
      case '--icon': opts.icon = next(); break;
      case '--monogram': opts.monogram = next(); break;
      case '--theme': opts.theme = next(); break;
      case '--font': opts.fontFiles.push(next()); break;
      case '--font-family': opts.fontFamily = next(); break;
      case '--no-pattern': opts.pattern = false; break;
      case '--size': opts.size = Number(next()); break;
      case '--config': opts.config = next(); break;
      case '--out': opts.out = next(); break;
      default:
        if (a.startsWith('--theme=')) opts.theme = a.slice(8);
        else console.warn(`iap-promo: opção desconhecida ignorada: ${a}`);
    }
  }
  return opts;
}

async function main() {
  const cli = parse(process.argv.slice(2));
  if (cli.help) {
    console.log(HELP);
    return;
  }

  let fileCfg = {};
  if (cli.config) {
    fileCfg = JSON.parse(await readFile(cli.config, 'utf8'));
  }

  // theme pode vir como JSON inline a partir do ficheiro de config.
  const out = cli.out ?? fileCfg.out ?? 'promo.png';
  const { config: _ignore, out: _o, help: _h, ...cliRest } = cli;
  const config = { ...fileCfg, ...cliRest };
  if (config.fontFiles && config.fontFiles.length === 0) delete config.fontFiles;

  const { outPath, size } = await renderToFile(config, out);

  if (size !== 1024) {
    console.warn(`⚠ tamanho ${size}px — a App Store exige 1024×1024 para imagens promocionais.`);
  }
  console.log(`✓ ${path.resolve(outPath)}  (${size}×${size}, sRGB, sem alpha — pronto para o App Store Connect)`);
}

main().catch((err) => {
  console.error('iap-promo: erro —', err.message);
  process.exit(1);
});
