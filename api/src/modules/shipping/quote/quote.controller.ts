import { ShippingQuoteRoute } from "./quote.docs";
import { quoteShipping } from "./quote.service";

export const registerRoutesShippingQuote = (server: ServerType) => {
	server.openapi(ShippingQuoteRoute, async (ctx) => {
		const { id } = ctx.get("user");
		const body = ctx.req.valid("json");
		const quote = await quoteShipping(id, body);
		return ctx.json(quote, 200);
	});
};
