import { CarrierUpdateRoute } from "./update.docs";
import { updateCarrier } from "./update.service";

export const registerRoutesCarrierUpdate = (server: ServerType) => {
	server.openapi(CarrierUpdateRoute, async (ctx) => {
		const { id } = ctx.req.valid("param");
		const body = ctx.req.valid("json");
		const carrier = await updateCarrier(id, body);
		return ctx.json(carrier, 200);
	});
};
