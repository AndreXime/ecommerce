import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import environment from "@/lib/environment";
import type { environmentType } from "@/lib/environment";

interface AuthCookieBase {
	httpOnly: true;
	secure: boolean;
	sameSite: "Lax" | "Strict";
	domain?: string;
}

export type CookieEnv = Pick<environmentType, "ENV" | "FRONTEND_URL" | "COOKIE_DOMAIN">;

export function resolveCookieDomain(config: CookieEnv): string | undefined {
	if (config.COOKIE_DOMAIN) return config.COOKIE_DOMAIN;
	if (config.ENV !== "PROD") return undefined;

	const { hostname } = new URL(config.FRONTEND_URL);
	if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return undefined;

	const parts = hostname.split(".");
	if (parts.length < 2) return undefined;

	return `.${parts.slice(-2).join(".")}`;
}

export function buildAuthCookieBase(config: CookieEnv): AuthCookieBase {
	const isProd = config.ENV === "PROD";
	const domain = resolveCookieDomain(config);

	return {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? "Lax" : "Strict",
		...(domain ? { domain } : {}),
	};
}

export function setAuthCookies(ctx: Context, accessToken: string, refreshToken: string) {
	const base = buildAuthCookieBase(environment);

	setCookie(ctx, "accessToken", accessToken, {
		...base,
		path: "/",
		maxAge: environment.JWT_ACCESS_EXPIRATION,
	});

	setCookie(ctx, "refreshToken", refreshToken, {
		...base,
		path: "/auth",
		maxAge: environment.JWT_REFRESH_EXPIRATION,
	});
}

export function clearAuthCookies(ctx: Context) {
	const base = buildAuthCookieBase(environment);

	deleteCookie(ctx, "accessToken", { ...base, path: "/" });
	deleteCookie(ctx, "refreshToken", { ...base, path: "/auth" });
}
