import { z } from "@hono/zod-openapi";

export const ShippingQuoteItemSchema = z.object({
	productId: z.string().uuid(),
	quantity: z.number().int().min(1),
});

export const ShippingQuoteBodySchema = z.object({
	cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000 ou 00000000"),
	items: z.array(ShippingQuoteItemSchema).min(1).optional(),
});

export const ShippingQuoteOptionSchema = z.object({
	methodId: z.string().uuid(),
	carrierName: z.string(),
	methodName: z.string(),
	methodCode: z.string(),
	cost: z.number(),
	estimatedDays: z.number().int(),
	distanceKm: z.number(),
});

export const ShippingQuoteResponseSchema = z.object({
	options: z.array(ShippingQuoteOptionSchema),
});
