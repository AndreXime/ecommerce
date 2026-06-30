import storage from "@/lib/storage";
import type { SeedUser } from "./seedUsersData";

async function loadImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Falha ao baixar avatar: ${url} (${response.status})`);
	}

	const contentType = response.headers.get("content-type") ?? "image/png";
	return { buffer: Buffer.from(await response.arrayBuffer()), contentType };
}

function fileExtension(contentType: string): string {
	if (contentType.includes("webp")) return "webp";
	if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
	if (contentType.includes("png")) return "png";
	return "png";
}

async function uploadSeedAvatar(user: SeedUser, date: string): Promise<string> {
	const { buffer, contentType } = await loadImageBuffer(user.image);
	const ext = fileExtension(contentType);
	const fileKey = `users/seed/${user.registration.toLowerCase()}-${date}.${ext}`;

	await storage.uploadFile({
		data: buffer,
		fileType: contentType,
		fileKey,
		cacheControl: "public, max-age=31536000, immutable",
	});

	return storage.getPublicUrl(fileKey);
}

export async function uploadSeedUserAvatars(users: SeedUser[]): Promise<SeedUser[]> {
	const date = new Date().toISOString().slice(0, 19).replace("T", "-").replace(/:/g, "-");

	console.log("[avatars] fazendo upload dos avatares para S3");

	const result: SeedUser[] = [];
	for (const user of users) {
		console.log(`[avatars] enviando avatar de "${user.email}"...`);
		const image = await uploadSeedAvatar(user, date);
		result.push({ ...user, image });
	}

	return result;
}
