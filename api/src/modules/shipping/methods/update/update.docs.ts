import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { MethodUpdateBodySchema, MethodUpdateParamSchema, MethodUpdateResponseSchema } from "./update.schema";

export const MethodUpdateRoute = createRoute({
	method: "patch",
	path: "/methods/{id}",
	tags: ["Shipping"],
	summary: "Atualizar método de frete",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: MethodUpdateParamSchema,
		body: { content: { "application/json": { schema: MethodUpdateBodySchema } } },
	},
	responses: {
		200: {
			description: "Método atualizado",
			content: { "application/json": { schema: MethodUpdateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Não encontrado" },
		409: { description: "Code duplicado" },
	},
});
