import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CarrierCreateBodySchema, CarrierCreateResponseSchema } from "./create.schema";

export const CarrierCreateRoute = createRoute({
	method: "post",
	path: "/carriers",
	tags: ["Shipping"],
	summary: "Criar transportadora",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		body: { content: { "application/json": { schema: CarrierCreateBodySchema } } },
	},
	responses: {
		201: {
			description: "Transportadora criada",
			content: { "application/json": { schema: CarrierCreateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		409: { description: "Slug já existe" },
	},
});
