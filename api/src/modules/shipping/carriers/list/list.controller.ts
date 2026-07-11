import { CarrierListRoute } from "./list.docs";
import { listCarriers } from "./list.service";

export const registerRoutesCarrierList = (server: ServerType) => {
	server.openapi(CarrierListRoute, async (ctx) => {
		const { includeInactive } = ctx.req.valid("query");
		const carriers = await listCarriers(includeInactive ?? false);
		return ctx.json(carriers, 200);
	});
};
