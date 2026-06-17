import { getCookie } from "hono/cookie";
import { clearAuthCookies } from "../shared/cookies";
import { LogoutRoute } from "./logout.docs";
import { invalidateSession } from "./logout.service";

export const registerRoutesLogout = (server: ServerType) => {
	server.openapi(LogoutRoute, async (ctx) => {
		const accessToken = getCookie(ctx, "accessToken") || ctx.req.header("Authorization")?.replace("Bearer ", "");
		const refreshToken = getCookie(ctx, "refreshToken");

		await invalidateSession(accessToken, refreshToken);

		clearAuthCookies(ctx);

		return ctx.json({ message: "Logout com sucesso" }, 200);
	});
};
