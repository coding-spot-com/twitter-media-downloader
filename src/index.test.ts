import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { generatePromo, THEMES } from './index.js';

describe('iap-promo', () => {
  it('exposes the built-in themes', () => {
    expect(Object.keys(THEMES)).toEqual(expect.arrayContaining(['ocean', 'midnight', 'sunset', 'forest']));
  });

  it('embeds the (escaped) title in the SVG', async () => {
    const { svg } = await generatePromo({ title: 'My <App>', badge: 'PRO' });
    expect(svg).toContain('My &lt;App&gt;');
    expect(svg).not.toContain('<App>');
  });

  it('renders a compliant 1024x1024 PNG with no alpha', async () => {
    const { png, size } = await generatePromo({
      title: 'Test',
      badge: 'PRO',
      benefits: ['No ads', 'Offline mode', 'Pro themes'],
      price: '$1.99/mo',
    });
    expect(size).toBe(1024);
    const meta = await sharp(png).metadata();
    expect(meta.format).toBe('png');
    expect(meta.width).toBe(1024);
    expect(meta.height).toBe(1024);
    expect(meta.hasAlpha).toBe(false);
    expect(meta.space).toBe('srgb');
  });

  it('accepts a custom theme object', async () => {
    const { png } = await generatePromo({
      title: 'Custom',
      theme: { top: '#111', mid: '#222', bottom: '#000', shadow: '#000', accent: '#fff', accentDeep: '#ccc', text: '#fff', tile: '#333', ceramic: '#eee' },
    });
    expect(png.length).toBeGreaterThan(0);
  });
});
