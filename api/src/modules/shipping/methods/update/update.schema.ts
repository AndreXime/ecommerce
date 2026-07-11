import { z } from "@hono/zod-openapi";
import { ShippingMethodSchema } from "../../shared/schemas";

export const MethodUpdateParamSchema = z.object({
	id: z.string().uuid(),
});

export const MethodUpdateBodySchema = z.object({
	name: z.string().min(2).optional(),
	code: z
		.string()
		.min(2)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Code deve ser kebab-case")
		.optional(),
	basePrice: z.number().min(0).optional(),
	pricePerKm: z.number().min(0).optional(),
	pricePerKg: z.number().min(0).optional(),
	daysBase: z.number().int().min(0).optional(),
	kmPerDay: z.number().int().positive().optional(),
	active: z.boolean().optional(),
});

export { ShippingMethodSchema as MethodUpdateResponseSchema };
