import { describe, expect, test } from "bun:test";
import { buildAuthCookieBase, resolveCookieDomain } from "./cookies";

describe("resolveCookieDomain", () => {
	test("DEV não define domain", () => {
		expect(
			resolveCookieDomain({
				ENV: "DEV",
				FRONTEND_URL: "http://localhost:4321",
				COOKIE_DOMAIN: undefined,
			}),
		).toBeUndefined();
	});

	test("PROD usa COOKIE_DOMAIN explícito", () => {
		expect(
			resolveCookieDomain({
				ENV: "PROD",
				FRONTEND_URL: "https://ecommerce.andreximenes.xyz",
				COOKIE_DOMAIN: ".custom.domain",
			}),
		).toBe(".custom.domain");
	});

	test("PROD deriva domain a partir de FRONTEND_URL", () => {
		expect(
			resolveCookieDomain({
				ENV: "PROD",
				FRONTEND_URL: "https://ecommerce.andreximenes.xyz",
				COOKIE_DOMAIN: undefined,
			}),
		).toBe(".andreximenes.xyz");
	});

	test("PROD com localhost não define domain", () => {
		expect(
			resolveCookieDomain({
				ENV: "PROD",
				FRONTEND_URL: "http://localhost:4321",
				COOKIE_DOMAIN: undefined,
			}),
		).toBeUndefined();
	});
});

describe("buildAuthCookieBase", () => {
	test("DEV usa Strict e sem Secure", () => {
		expect(
			buildAuthCookieBase({
				ENV: "DEV",
				FRONTEND_URL: "http://localhost:4321",
				COOKIE_DOMAIN: undefined,
			}),
		).toEqual({
			httpOnly: true,
			secure: false,
			sameSite: "Strict",
		});
	});

	test("PROD usa Lax, Secure e Domain", () => {
		expect(
			buildAuthCookieBase({
				ENV: "PROD",
				FRONTEND_URL: "https://ecommerce.andreximenes.xyz",
				COOKIE_DOMAIN: ".andreximenes.xyz",
			}),
		).toEqual({
			httpOnly: true,
			secure: true,
			sameSite: "Lax",
			domain: ".andreximenes.xyz",
		});
	});
});
