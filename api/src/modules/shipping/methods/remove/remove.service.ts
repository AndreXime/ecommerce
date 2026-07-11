import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";

export async function removeShippingMethod(id: string) {
	const existing = await database.shippingMethod.findUnique({ where: { id } });
	if (!existing) {
		throw new HTTPException(404, { message: "Método de frete não encontrado." });
	}

	await database.shippingMethod.delete({ where: { id } });
}
