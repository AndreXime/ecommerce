import { z } from "@hono/zod-openapi";
import { CarrierSchema } from "../../shared/schemas";

export const CarrierUpdateParamSchema = z.object({
	id: z.string().uuid(),
});

export const CarrierUpdateBodySchema = z.object({
	name: z.string().min(2).optional(),
	slug: z
		.string()
		.min(2)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve ser kebab-case")
		.optional(),
	active: z.boolean().optional(),
	hubLat: z.number().min(-90).max(90).optional(),
	hubLng: z.number().min(-180).max(180).optional(),
});

export { CarrierSchema as CarrierUpdateResponseSchema };
