import { z } from "@hono/zod-openapi";
import { CarrierListResponseSchema } from "../../shared/schemas";

export { CarrierListResponseSchema };

export const CarrierListQuerySchema = z.object({
	includeInactive: z
		.enum(["true", "false"])
		.optional()
		.transform((value) => value === "true"),
});
