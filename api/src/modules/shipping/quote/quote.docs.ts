import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { ShippingQuoteBodySchema, ShippingQuoteResponseSchema } from "./quote.schema";

export const ShippingQuoteRoute = createRoute({
	method: "post",
	path: "/quote",
	tags: ["Shipping"],
	summary: "Cotar frete",
	description:
		"Calcula opções de frete mock a partir do CEP e do peso dos itens (carrinho atual ou lista explícita).",
	security: [{ Bearer: [] }],
	middleware: [auth([])],
	request: {
		body: { content: { "application/json": { schema: ShippingQuoteBodySchema } } },
	},
	responses: {
		200: {
			description: "Opções de frete",
			content: { "application/json": { schema: ShippingQuoteResponseSchema } },
		},
		400: { description: "Carrinho vazio" },
		401: { description: "Não autenticado" },
		422: { description: "CEP inválido ou sem cobertura" },
	},
});
