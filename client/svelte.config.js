import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $lib: 'src/lib',
      $api: 'src/lib/api',
      $stores: 'src/lib/stores',
      $components: 'src/lib/components',
      $types: 'src/lib/types',
      $utils: 'src/lib/utils'
    }
  }
};

export default config;
