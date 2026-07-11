export interface Coordinate {
	lat: number;
	lng: number;
}

let cepMap: Map<string, Coordinate> | null = null;

export async function getCepDatabase(): Promise<Map<string, Coordinate>> {
	if (cepMap) return cepMap;

	const text = await Bun.file(new URL("./code_cep_coordinates.csv", import.meta.url)).text();
	const map = new Map<string, Coordinate>();

	for (const line of text.split("\n").slice(1)) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		const [postcode, lon, lat] = trimmed.split(",");
		if (!postcode || lon === undefined || lat === undefined) continue;

		const latitude = Number(lat);
		const longitude = Number(lon);
		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;

		map.set(postcode, { lat: latitude, lng: longitude });
	}

	cepMap = map;
	return map;
}

export function normalizeCepPrefix(cep: string): string | null {
	const digits = cep.replace(/\D/g, "");
	if (digits.length < 5) return null;
	return digits.substring(0, 5);
}

export function formatCep(cep: string): string | null {
	const digits = cep.replace(/\D/g, "");
	if (digits.length !== 8) return null;
	return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export async function lookupCepCoordinate(cep: string): Promise<Coordinate | null> {
	const prefix = normalizeCepPrefix(cep);
	if (!prefix) return null;

	const map = await getCepDatabase();
	return map.get(prefix) ?? null;
}
