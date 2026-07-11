import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { toShippingMethod } from "../../shared/mapper";
import type { MethodCreateBodySchema } from "./create.schema";

type Body = z.infer<typeof MethodCreateBodySchema>;

export async function createShippingMethod(body: Body) {
	const carrier = await database.carrier.findUnique({ where: { id: body.carrierId } });
	if (!carrier) {
		throw new HTTPException(404, { message: "Transportadora não encontrada." });
	}

	const duplicate = await database.shippingMethod.findUnique({
		where: {
			carrierId_code: {
				carrierId: body.carrierId,
				code: body.code,
			},
		},
	});
	if (duplicate) {
		throw new HTTPException(409, { message: "Já existe um método com este code nesta transportadora." });
	}

	const method = await database.shippingMethod.create({ data: body });
	return toShippingMethod(method);
}
