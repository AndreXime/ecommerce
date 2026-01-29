// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";

import vercel from "@astrojs/vercel";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: "https://ecommerce.andreximenes.xyzs",

	vite: {
		plugins: [tailwindcss()],
	},

	integrations: [
		preact(),
		icon({
			include: {
				lucide: ["*"],
			},
		}),
	],
	adapter: vercel(),
});
