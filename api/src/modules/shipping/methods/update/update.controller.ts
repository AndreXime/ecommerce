import { MethodUpdateRoute } from "./update.docs";
import { updateShippingMethod } from "./update.service";

export const registerRoutesMethodUpdate = (server: ServerType) => {
	server.openapi(MethodUpdateRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const method = await updateShippingMethod(id, body);
		return ctx.json(method, 200);
	});
};
