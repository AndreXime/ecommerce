// @ts-check
import { defineConfig, envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";
import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel";

const useNodeAdapter = process.env.ASTRO_ADAPTER === "node";

// https://astro.build/config
export default defineConfig({
	site: "https://ecommerce.andreximenes.xyz",

	env: {
		schema: {
			PUBLIC_API_URL: envField.string({
				context: "client",
				access: "public",
			}),
		},
	},

	vite: {
		plugins: [tailwindcss()],
		optimizeDeps: {
			include: ["nanostores", "@nanostores/preact"],
		},
		ssr: {
			noExternal: ["lucide-preact"],
		},
	},
	build: {
		inlineStylesheets: "always",
	},
	integrations: [preact()],
	adapter: useNodeAdapter ? node({ mode: "standalone" }) : vercel(),
});
