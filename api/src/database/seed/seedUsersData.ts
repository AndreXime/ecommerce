import { join } from "node:path";

const USERS_PATH = join(import.meta.dir, "users.json");

interface UsersJsonEntry {
	id: number;
	name: string;
	email: string;
	phone: string;
	image: string;
	username: string;
}

interface UsersJsonResponse {
	users: UsersJsonEntry[];
}

export type SeedUser = {
	name: string;
	email: string;
	phone: string;
	image: string;
	registration: string;
};

export async function loadSeedUsers(): Promise<SeedUser[]> {
	const raw = (await Bun.file(USERS_PATH).json()) as UsersJsonResponse;

	return raw.users.map((user) => ({
		name: user.name,
		email: user.email,
		phone: user.phone,
		image: user.image,
		registration: `USR-${user.username.toUpperCase()}`,
	}));
}

export function buildEmailToUserMap(
	seedUsers: SeedUser[],
	emailToUserId: Map<string, string>,
): Map<string, { id: string; avatar: string }> {
	const result = new Map<string, { id: string; avatar: string }>();

	for (const user of seedUsers) {
		const id = emailToUserId.get(user.email);
		if (id) {
			result.set(user.email, { id, avatar: user.image });
		}
	}

	return result;
}
