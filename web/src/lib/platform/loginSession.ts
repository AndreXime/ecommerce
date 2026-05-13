import { DEMO_SESSION_COOKIE, isDemoMode } from "@/lib/demo-mode";

interface CookieStoreLike {
	delete(name: string, options?: { path?: string }): void;
}

interface PrepareLoginPageSessionOptions {
	readonly cookies: CookieStoreLike;
	readonly cookieHeader: string | null;
	readonly searchParams: URLSearchParams;
}

export function prepareLoginPageSession({
	cookies,
	cookieHeader,
	searchParams,
}: PrepareLoginPageSessionOptions): string {
	const isLoggingOutFromDemo = isDemoMode && searchParams.get("logout") === "1";

	if (isLoggingOutFromDemo) {
		cookies.delete(DEMO_SESSION_COOKIE, { path: "/" });
		return "";
	}

	return cookieHeader ?? "";
}
