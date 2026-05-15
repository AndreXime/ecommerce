import { request } from "@/lib/request";

interface UploadedProductImage {
	readonly id: string;
	readonly url: string;
	readonly key: string;
	readonly position: number;
}

interface UploadProductImageResult {
	readonly uploadUrl: string;
	readonly image: UploadedProductImage;
}

export async function uploadProductImage(
	productId: string,
	file: File,
): Promise<{ ok: true; data: UploadProductImageResult } | { ok: false; message: string }> {
	const presignResponse = await request.post<UploadProductImageResult>(`/products/${productId}/images`, {
		contentType: file.type,
	});

	if (!presignResponse.ok) {
		return { ok: false, message: presignResponse.message };
	}

	const uploadResponse = await fetch(presignResponse.data.uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": file.type },
		body: file,
	});

	if (!uploadResponse.ok) {
		return { ok: false, message: "Erro ao enviar imagem para o storage." };
	}

	return { ok: true, data: presignResponse.data };
}
