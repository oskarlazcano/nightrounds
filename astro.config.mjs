// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://nightrounds.example', // TBD at kickoff: confirmed domain (also in src/data/site.ts)
  integrations: [
    sitemap({
      // The brand sheet is an internal review page.
      filter: (page) => !page.includes('/brand'),
    }),
  ],
});
