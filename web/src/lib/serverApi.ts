import { PUBLIC_API_URL } from "astro:env/client";

type Params = Record<string, string | number | boolean | null | undefined>;

export async function serverGet<T>(
	path: string,
	cookieHeader: string | null,
	params?: Params,
): Promise<{ data: T | null; status: number }> {
	let url: URL;
	try {
		url = new URL(`${PUBLIC_API_URL}${path}`);
	} catch {
		console.error("PUBLIC_API_URL inválida:", PUBLIC_API_URL);
		return { data: null, status: 0 };
	}

	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined && value !== null && value !== "") {
				url.searchParams.append(key, String(value));
			}
		}
	}

	try {
		const res = await fetch(url.toString(), {
			headers: {
				"Content-Type": "application/json",
				...(cookieHeader ? { Cookie: cookieHeader } : {}),
			},
		});

		if (!res.ok) {
			return { data: null, status: res.status };
		}

		const data = await res.json();
		return { data: data as T, status: res.status };
	} catch {
		return { data: null, status: 0 };
	}
}
