import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CarrierListQuerySchema, CarrierListResponseSchema } from "./list.schema";

export const CarrierListRoute = createRoute({
	method: "get",
	path: "/carriers",
	tags: ["Shipping"],
	summary: "Listar transportadoras",
	description: "Lista carriers com seus métodos de frete. Apenas ADMIN.",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		query: CarrierListQuerySchema,
	},
	responses: {
		200: {
			description: "Lista de transportadoras",
			content: { "application/json": { schema: CarrierListResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
	},
});
