import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import vercel from "@sveltejs/adapter-vercel";

export default {
	kit: {
		adapter: vercel(),
		paths: {
			base: '/admin' // Admin base path
		}
	},
	preprocess: vitePreprocess()
};
