import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { MethodCreateBodySchema, MethodCreateResponseSchema } from "./create.schema";

export const MethodCreateRoute = createRoute({
	method: "post",
	path: "/methods",
	tags: ["Shipping"],
	summary: "Criar método de frete",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		body: { content: { "application/json": { schema: MethodCreateBodySchema } } },
	},
	responses: {
		201: {
			description: "Método criado",
			content: { "application/json": { schema: MethodCreateResponseSchema } },
		},
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Transportadora não encontrada" },
		409: { description: "Code duplicado na transportadora" },
	},
});
