import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { toCarrier } from "../../shared/mapper";
import type { CarrierCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof CarrierCreateBodySchema>;

export async function createCarrier(body: Body) {
	const existing = await database.carrier.findUnique({ where: { slug: body.slug } });
	if (existing) {
		throw new HTTPException(409, { message: "Já existe uma transportadora com este slug." });
	}

	const carrier = await database.carrier.create({
		data: body,
		include: { methods: true },
	});

	return toCarrier(carrier);
}
