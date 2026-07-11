import { z } from "@hono/zod-openapi";
import { CarrierSchema } from "../../shared/schemas";

export const CarrierCreateBodySchema = z.object({
	name: z.string().min(2),
	slug: z
		.string()
		.min(2)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve ser kebab-case"),
	active: z.boolean().optional().default(true),
	hubLat: z.number().min(-90).max(90),
	hubLng: z.number().min(-180).max(180),
});

export { CarrierSchema as CarrierCreateResponseSchema };
