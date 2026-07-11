import createRouter from "@/lib/createRouter";
import { registerRoutesShippingQuote } from "./quote/quote.controller";

export const createShippingRoutes = () => {
	const app = createRouter();
	registerRoutesShippingQuote(app);
	return app;
};
