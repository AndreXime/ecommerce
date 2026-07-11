import { z } from "@hono/zod-openapi";
import { ShippingMethodSchema } from "../../shared/schemas";

export const MethodCreateBodySchema = z.object({
	carrierId: z.string().uuid(),
	name: z.string().min(2),
	code: z
		.string()
		.min(2)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Code deve ser kebab-case"),
	basePrice: z.number().min(0),
	pricePerKm: z.number().min(0),
	pricePerKg: z.number().min(0),
	daysBase: z.number().int().min(0),
	kmPerDay: z.number().int().positive(),
	active: z.boolean().optional().default(true),
});

export { ShippingMethodSchema as MethodCreateResponseSchema };
