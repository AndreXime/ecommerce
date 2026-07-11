import { z } from "@hono/zod-openapi";

export const ShippingMethodSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	code: z.string(),
	basePrice: z.number(),
	pricePerKm: z.number(),
	pricePerKg: z.number(),
	daysBase: z.number().int(),
	kmPerDay: z.number().int(),
	active: z.boolean(),
	carrierId: z.string().uuid(),
});

export const CarrierSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	active: z.boolean(),
	hubLat: z.number(),
	hubLng: z.number(),
	methods: z.array(ShippingMethodSchema).optional(),
});

export const CarrierListResponseSchema = z.array(CarrierSchema);
