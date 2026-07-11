import { z } from "@hono/zod-openapi";

export const MethodRemoveParamSchema = z.object({
	id: z.string().uuid(),
});
