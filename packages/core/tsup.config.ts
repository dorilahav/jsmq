import { defineConfig } from 'tsup';

const entryUrl = 'src/index.ts';
const outDir = 'lib';

const baseConfiguration = defineConfig({
  entry: [entryUrl],
  clean: true,
  treeshake: true,
  format: 'cjs',
  platform: 'node',
  outDir,
  target: 'es2022',
  dts: true
});

const productionConfiguration = defineConfig({
  ...baseConfiguration,
  minify: true
});

export default [productionConfiguration];