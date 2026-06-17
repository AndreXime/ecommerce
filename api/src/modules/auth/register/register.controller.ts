import type { OpenAPIHono } from "@hono/zod-openapi";
import type { AppBindings } from "@/@types/declarations";
import { setAuthCookies } from "../shared/cookies";
import { RegisterRoute } from "./register.docs";
import { signUp } from "./register.service";

const registerRoutesSignUp = (server: OpenAPIHono<AppBindings>) => {
	server.openapi(RegisterRoute, async (ctx) => {
		const validatedData = ctx.req.valid("json");

		const { accessToken, refreshToken, role } = await signUp(validatedData);

		setAuthCookies(ctx, accessToken, refreshToken);

		return ctx.json({ message: "Cadastro enviado com sucesso", role }, 201);
	});
};

export { registerRoutesSignUp };
