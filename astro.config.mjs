import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://el-brieff.fei-d02.workers.dev',
  adapter: cloudflare(),
});
