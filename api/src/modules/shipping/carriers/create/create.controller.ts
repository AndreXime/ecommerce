import { CarrierCreateRoute } from "./create.docs";
import { createCarrier } from "./create.service";

export const registerRoutesCarrierCreate = (server: ServerType) => {
	server.openapi(CarrierCreateRoute, async (ctx) => {
		const body = ctx.req.valid("json");
		const carrier = await createCarrier(body);
		return ctx.json(carrier, 201);
	});
};
