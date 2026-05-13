// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
	site: "https://ecommerce.andreximenes.xyz",

	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: ["nanostores", "@nanostores/preact"],
		},
	},
	build: {
		inlineStylesheets: "always",
	},
	integrations: [preact()],
	adapter: vercel(),
});
