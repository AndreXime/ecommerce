import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CarrierUpdateBodySchema, CarrierUpdateParamSchema, CarrierUpdateResponseSchema } from "./update.schema";

export const CarrierUpdateRoute = createRoute({
	method: "patch",
	path: "/carriers/{id}",
	tags: ["Shipping"],
	summary: "Atualizar transportadora",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: CarrierUpdateParamSchema,
		body: { content: { "application/json": { schema: CarrierUpdateBodySchema } } },
	},
	responses: {
		200: {
			description: "Transportadora atualizada",
			content: { "application/json": { schema: CarrierUpdateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Não encontrada" },
		409: { description: "Slug já existe" },
	},
});
