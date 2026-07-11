import { database } from "@/database/database";
import { toCarrier } from "../../shared/mapper";

export async function listCarriers(includeInactive = false) {
	const carriers = await database.carrier.findMany({
		where: includeInactive ? undefined : { active: true },
		include: {
			methods: {
				where: includeInactive ? undefined : { active: true },
				orderBy: [{ basePrice: "asc" }, { name: "asc" }],
			},
		},
		orderBy: { name: "asc" },
	});

	return carriers.map(toCarrier);
}
