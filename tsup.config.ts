import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: { entry: 'src/index.ts' },
  target: 'node18',
  clean: true,
  splitting: false,
  sourcemap: false,
  shims: false,
});
