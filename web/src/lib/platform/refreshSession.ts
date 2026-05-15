function getSafeRedirect(): string {
	const params = new URLSearchParams(window.location.search);
	const redirect = params.get("redirect") ?? "/perfil";

	if (!redirect.startsWith("/") || redirect.startsWith("//")) {
		return "/perfil";
	}

	return redirect;
}

export async function resolveRefreshRedirect(): Promise<string> {
	const redirect = getSafeRedirect();
	const apiUrl = import.meta.env.PUBLIC_API_URL;

	try {
		const response = await fetch(`${apiUrl}/auth/refresh`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
		});

		return response.ok ? redirect : "/login";
	} catch {
		return "/login";
	}
}
