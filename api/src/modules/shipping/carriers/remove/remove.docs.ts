import { createRoute } from "@hono/zod-openapi";
import auth from "@/middlewares/auth";
import { CarrierRemoveParamSchema } from "./remove.schema";

export const CarrierRemoveRoute = createRoute({
	method: "delete",
	path: "/carriers/{id}",
	tags: ["Shipping"],
	summary: "Remover transportadora",
	description: "Remove a transportadora e seus métodos (cascade).",
	security: [{ Bearer: [] }],
	middleware: [auth(["ADMIN"])],
	request: {
		params: CarrierRemoveParamSchema,
	},
	responses: {
		204: { description: "Removida" },
		401: { description: "Não autenticado" },
		403: { description: "Acesso negado (Requer ADMIN)" },
		404: { description: "Não encontrada" },
	},
});
