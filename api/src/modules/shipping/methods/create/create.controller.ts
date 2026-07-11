import { MethodCreateRoute } from "./create.docs";
import { createShippingMethod } from "./create.service";

export const registerRoutesMethodCreate = (server: ServerType) => {
	server.openapi(MethodCreateRoute, async (ctx) => {
		const body = ctx.req.valid("json");
		const method = await createShippingMethod(body);
		return ctx.json(method, 201);
	});
};
