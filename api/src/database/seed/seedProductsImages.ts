import { join } from "node:path";
import storage from "@/lib/storage";

export type ImageDef = {
	file: string;
	position: number;
};

export type SeedImage = { url: string; position: number };

const SEED_IMAGES_DIR = join(import.meta.dir, "images");

async function uploadSeedImage(def: ImageDef, productTag: string, date: string): Promise<SeedImage> {
	const sourcePath = join(SEED_IMAGES_DIR, def.file);
	const fileKey = `products/seed/${productTag}-${def.position}-${date}.webp`;
	const buffer = Buffer.from(await Bun.file(sourcePath).arrayBuffer());

	await storage.uploadFile({
		data: buffer,
		fileType: "image/webp",
		fileKey,
		cacheControl: "public, max-age=31536000, immutable",
	});

	return { url: storage.getPublicUrl(fileKey), position: def.position };
}

export async function generateSeedProductImages(
	products: { tag: string; images: ImageDef[] }[],
): Promise<Record<string, SeedImage[]>> {
	const result: Record<string, SeedImage[]> = {};
	const date = new Date().toISOString().slice(0, 19).replace("T", "-").replace(/:/g, "-");

	console.log("[imagens] fazendo upload das imagens .webp para S3");

	for (const product of products) {
		console.log(`[imagens] enviando imagens de "${product.tag}"...`);
		result[product.tag] = await Promise.all(
			product.images.map((img) => uploadSeedImage(img, product.tag, date)),
		);
	}

	return result;
}
