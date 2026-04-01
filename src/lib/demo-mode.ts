export const DEMO_SESSION_COOKIE = "demo_session";
export const DEMO_CART_COOKIE = "demo_cart";

export const isDemoMode =
	import.meta.env.PUBLIC_DEMO_MODE === "true" || !import.meta.env.PUBLIC_API_URL;

export function hasDemoSession(cookieHeader?: string | null): boolean {
	if (!cookieHeader) return false;
	return cookieHeader
		.split(";")
		.map((part) => part.trim())
		.some((part) => part.startsWith(`${DEMO_SESSION_COOKIE}=`));
}

export function enableDemoSession(): void {
	if (typeof document === "undefined") return;
	document.cookie = `${DEMO_SESSION_COOKIE}=1; path=/; max-age=2592000; samesite=lax`;
}

export function clearDemoSession(): void {
	if (typeof document === "undefined") return;
	document.cookie = `${DEMO_SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

export function writeDemoCartCookie(serializedCart: string): void {
	if (typeof document === "undefined") return;
	document.cookie = `${DEMO_CART_COOKIE}=${encodeURIComponent(serializedCart)}; path=/; max-age=2592000; samesite=lax`;
}
