import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
export default defineConfig({
  integrations: [mdx()],
  site: 'https://adrianrusu.dev',
  output: 'static',
  trailingSlash: 'always',
  server: { host: '0.0.0.0', port: 4173, allowedHosts: ['terminal.local'] },
});
