import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { MethodRemoveParamSchema } from "./remove.schema";

export const MethodRemoveRoute = createRoute({
	method: "delete",
	path: "/methods/{id}",
	tags: ["Shipping"],
	summary: "Remover método de frete",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: MethodRemoveParamSchema,
	},
	responses: {
		204: { description: "Removido" },
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Não encontrado" },
	},
});
