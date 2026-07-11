import { z } from "@hono/zod-openapi";

export const OrderItemSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	variant: z.string().nullable().optional(),
	img: z.string().nullable().optional(),
	quantity: z.number().int(),
	price: z.number(),
	unitPrice: z.number(),
	discountPercentage: z.number().nullable().optional(),
	subtotal: z.number(),
});

export const OrderShipmentSchema = z.object({
	id: z.string().uuid(),
	carrierName: z.string(),
	methodName: z.string(),
	methodCode: z.string(),
	cost: z.number(),
	estimatedDays: z.number().int(),
	destinationCep: z.string(),
	distanceKm: z.number().nullable(),
	status: z.enum(["pending", "in_transit", "delivered"]),
});

export const OrderSchema = z.object({
	id: z.string().uuid(),
	date: z.iso.datetime(),
	subtotal: z.number(),
	shippingCost: z.number(),
	total: z.number(),
	status: z.enum(["pending", "intransit", "delivered", "cancelled"]),
	items: z.array(OrderItemSchema),
	shipment: OrderShipmentSchema.nullable(),
});

export const OrderListResponseSchema = z.object({
	data: z.array(OrderSchema),
	meta: z.object({
		page: z.number().int(),
		limit: z.number().int(),
		total: z.number().int(),
		totalPages: z.number().int(),
	}),
});
