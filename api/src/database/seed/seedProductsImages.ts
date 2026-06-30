import storage from "@/lib/storage";

export type ImageDef = {
	url: string;
	position: number;
};

export type SeedImage = { url: string; position: number };

async function loadImageBuffer(url: string): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Falha ao baixar imagem: ${url} (${response.status})`);
	}
	return Buffer.from(await response.arrayBuffer());
}

async function uploadSeedImage(def: ImageDef, productTag: string, date: string): Promise<SeedImage> {
	const fileKey = `products/seed/${productTag}-${def.position}-${date}.webp`;
	const buffer = await loadImageBuffer(def.url);

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

	console.log("[imagens] fazendo upload das imagens para S3");

	for (const product of products) {
		console.log(`[imagens] enviando imagens de "${product.tag}"...`);
		result[product.tag] = await Promise.all(
			product.images.map((img) => uploadSeedImage(img, product.tag, date)),
		);
	}

	return result;
}
