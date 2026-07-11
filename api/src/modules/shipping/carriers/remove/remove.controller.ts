import { CarrierRemoveRoute } from "./remove.docs";
import { removeCarrier } from "./remove.service";

export const registerRoutesCarrierRemove = (server: ServerType) => {
	server.openapi(CarrierRemoveRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		await removeCarrier(id);
		return ctx.body(null, 204);
	});
};
