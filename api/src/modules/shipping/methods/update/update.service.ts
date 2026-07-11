import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { toShippingMethod } from "../../shared/mapper";
import type { MethodUpdateBodySchema } from "./update.schema";

type Body = z.infer<typeof MethodUpdateBodySchema>;

export async function updateShippingMethod(id: string, body: Body) {
	const existing = await database.shippingMethod.findUnique({ where: { id } });
	if (!existing) {
		throw new HTTPException(404, { message: "Método de frete não encontrado." });
	}

	if (body.code && body.code !== existing.code) {
		const duplicate = await database.shippingMethod.findUnique({
			where: {
				carrierId_code: {
					carrierId: existing.carrierId,
					code: body.code,
				},
			},
		});
		if (duplicate) {
			throw new HTTPException(409, { message: "Já existe um método com este code nesta transportadora." });
		}
	}

	const method = await database.shippingMethod.update({
		where: { id },
		data: body,
	});

	return toShippingMethod(method);
}
