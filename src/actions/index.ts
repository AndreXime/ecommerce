import { defineAction } from "astro:actions";
import { z } from "astro:schema";

import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode("c0W4HR4xx1u5yPZHx57iOKkpc0rN46Ng");

async function createToken(payload: { email: string }) {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.sign(SECRET);
}

export async function readToken(token: string | undefined) {
	if (!token) {
		return undefined;
	}

	try {
		const { payload } = await jwtVerify(token, SECRET);
		return payload;
	} catch {
		return undefined;
	}
}

export const server = {
	login: defineAction({
		// Aceita qualquer par email/senha para fins de teste
		input: z.object({
			email: z.string().email(),
			password: z.string(),
			rememberMe: z.boolean().optional(),
		}),
		handler: async (input, context) => {
			const token = await createToken({ email: input.email });

			context.cookies.set("auth_token", token, {
				path: "/",
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: "lax",
				maxAge: input.rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 dias se marcar "lembrar"
			});

			return { success: true, user: input.email };
		},
	}),

	register: defineAction({
		input: z
			.object({
				name: z.string().min(2),
				email: z.string().email(),
				password: z.string().min(8),
				confirmPassword: z.string(),
			})
			.refine((data) => data.password === data.confirmPassword, {
				message: "As senhas não coincidem",
				path: ["confirmPassword"],
			}),
		handler: async (input, context) => {
			const token = await createToken({ email: input.email });

			context.cookies.set("auth_token", token, {
				path: "/",
				httpOnly: true,
				secure: import.meta.env.PROD,
				sameSite: "lax",
				maxAge: 60 * 60 * 24, // 24 horas
			});

			return { success: true };
		},
	}),
};
