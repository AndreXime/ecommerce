import { z } from "@hono/zod-openapi";

export const AddressSchema = z.object({
	id: z.string().uuid(),
	type: z.string(),
	street: z.string(),
	city: z.string(),
	cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
	isDefault: z.boolean(),
});

export const PaymentCardSchema = z.object({
	id: z.string().uuid(),
	brand: z.string(),
	last4: z.string().length(4),
	holder: z.string(),
	expiry: z.string(),
});
