import Redis from "ioredis";
import { log, withStartupTimeout } from "./dev";
import environment from "./environment";

const REDIS_URL = environment.REDIS_URL || "redis://localhost:6379";

class RedisProvider {
	public client: Redis;

	constructor() {
		this.client = new Redis(REDIS_URL, {
			maxRetriesPerRequest: null,
			enableReadyCheck: false,
			connectTimeout: 10_000,
			retryStrategy: (times) => (times > 3 ? null : Math.min(times * 500, 2_000)),
		});

		this.client.on("error", (error) => {
			console.error("Erro Redis:", error.message);
		});
	}

	async testConnection(): Promise<boolean> {
		try {
			await withStartupTimeout("Redis", 15_000, this.client.ping());

			log("Conexão Redis bem-sucedida.", "success");
			return true;
		} catch (error) {
			console.error("Falha na conexão Redis:", error);
			return false;
		}
	}
}

const redis = new RedisProvider();
export default redis;
