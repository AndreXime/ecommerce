import { z } from "@hono/zod-openapi";

export const CarrierRemoveParamSchema = z.object({
	id: z.string().uuid(),
});
