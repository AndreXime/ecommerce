import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { toCarrier } from "../../shared/mapper";
import type { CarrierUpdateBodySchema } from "./update.schema";

type Body = z.infer<typeof CarrierUpdateBodySchema>;

export async function updateCarrier(id: string, body: Body) {
	const existing = await database.carrier.findUnique({ where: { id } });
	if (!existing) {
		throw new HTTPException(404, { message: "Transportadora não encontrada." });
	}

	if (body.slug && body.slug !== existing.slug) {
		const slugTaken = await database.carrier.findUnique({ where: { slug: body.slug } });
		if (slugTaken) {
			throw new HTTPException(409, { message: "Já existe uma transportadora com este slug." });
		}
	}

	const carrier = await database.carrier.update({
		where: { id },
		data: body,
		include: {
			methods: { orderBy: [{ basePrice: "asc" }, { name: "asc" }] },
		},
	});

	return toCarrier(carrier);
}
