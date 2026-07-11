import { MethodRemoveRoute } from "./remove.docs";
import { removeShippingMethod } from "./remove.service";

export const registerRoutesMethodRemove = (server: ServerType) => {
	server.openapi(MethodRemoveRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		await removeShippingMethod(id);
		return ctx.body(null, 204);
	});
};
