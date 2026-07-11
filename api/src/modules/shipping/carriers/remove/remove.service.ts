import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";

export async function removeCarrier(id: string) {
	const existing = await database.carrier.findUnique({ where: { id } });
	if (!existing) {
		throw new HTTPException(404, { message: "Transportadora não encontrada." });
	}

	await database.carrier.delete({ where: { id } });
}
