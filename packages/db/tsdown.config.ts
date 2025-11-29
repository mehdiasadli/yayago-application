import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/generated/zod/enums.ts', 'src/generated/zod/models.ts'],
  sourcemap: true,
  dts: true,
});
