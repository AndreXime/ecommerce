import createRouter from "@/lib/createRouter";
import { registerRoutesCarrierCreate } from "./carriers/create/create.controller";
import { registerRoutesCarrierList } from "./carriers/list/list.controller";
import { registerRoutesCarrierRemove } from "./carriers/remove/remove.controller";
import { registerRoutesCarrierUpdate } from "./carriers/update/update.controller";
import { registerRoutesMethodCreate } from "./methods/create/create.controller";
import { registerRoutesMethodRemove } from "./methods/remove/remove.controller";
import { registerRoutesMethodUpdate } from "./methods/update/update.controller";
import { registerRoutesShippingQuote } from "./quote/quote.controller";

export const createShippingRoutes = () => {
	const app = createRouter();

	registerRoutesShippingQuote(app);
	registerRoutesCarrierList(app);
	registerRoutesCarrierCreate(app);
	registerRoutesCarrierUpdate(app);
	registerRoutesCarrierRemove(app);
	registerRoutesMethodCreate(app);
	registerRoutesMethodUpdate(app);
	registerRoutesMethodRemove(app);

	return app;
};
