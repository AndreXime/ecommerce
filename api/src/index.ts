import { OpenAPIHono } from "@hono/zod-openapi";
import { csrf } from "hono/csrf";
import { secureHeaders } from "hono/secure-headers";
import type { AppBindings } from "@/@types/declarations";
import { registerRoutes } from "@/modules";
import { PrismaDatabase } from "./database/database";
import { log, setupDocs, showRoutes } from "./lib/dev";
import { setupAbandonedCartScheduler, setupEmailWorker, setupPromotionScheduler } from "./lib/email";
import environment from "./lib/environment";
import { printMetrics, registerMetrics } from "./lib/metrics";
import redis from "./lib/redis";
import storage from "./lib/storage";
import cors from "./middlewares/cors";
import database from "./middlewares/database";
import errors from "./middlewares/errors";
import requestLogger from "./middlewares/logger";
import rateLimiter from "./middlewares/rate-limiter";

const server = new OpenAPIHono<AppBindings>();

if (environment.ENV === "DEV") {
	server.use(requestLogger);
}

server.use("*", registerMetrics);
server.use(secureHeaders());
server.get("/metrics", printMetrics);
server.use(cors);
server.use(database);
server.use(
	csrf({
		origin: [environment.FRONTEND_URL],
	}),
);

// 100 requisições a cada 15 minutos por IP
server.use(rateLimiter(100, 15, "global"));

server.onError(errors);
registerRoutes(server);

if (environment.ENV === "DEV") {
	showRoutes(server);
	setupDocs(server);
}

server.notFound((c) => c.json({ message: "Rota não econtrada" }, 404));

log(`Iniciando servidor no modo: ${environment.ENV}`, "info");

log("Verificando S3...", "info");
await storage.testConnection();

log("Verificando banco de dados...", "info");
await PrismaDatabase.testConnection();

log("Verificando Redis...", "info");
await redis.testConnection();

log("Inicializando fila de email...", "info");
await setupEmailWorker();
await setupPromotionScheduler();
await setupAbandonedCartScheduler();

log(`Servidor pronto na porta ${environment.PORT}.`, "success");

export default server;
