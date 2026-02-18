// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	site: "https://ecommerce.andreximenes.xyzs",

	vite: {
		plugins: [tailwindcss()],
	},
	build: {
		inlineStylesheets: "always",
	},
	integrations: [preact()],
	adapter: node({
		mode: "standalone",
	}),
});
