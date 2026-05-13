import { request } from "@/lib/request";
import { isDemoMode } from "@/lib/demo-mode";

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

async function readFileAsDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			if (typeof reader.result === "string") {
				resolve(reader.result);
				return;
			}

			reject(new Error("Falha ao ler a imagem."));
		};

		reader.onerror = () => reject(new Error("Falha ao ler a imagem."));
		reader.readAsDataURL(file);
	});
}

export async function uploadProductImage(
	productId: string,
	file: File,
): Promise<{ ok: true; data: UploadProductImageResult } | { ok: false; message: string }> {
	if (isDemoMode) {
		try {
			const imageUrl = await readFileAsDataUrl(file);
			const response = await request.post<UploadProductImageResult>(`/products/${productId}/images`, {
				contentType: file.type,
				imageUrl,
			});

			if (!response.ok) {
				return { ok: false, message: response.message };
			}

			return { ok: true, data: response.data };
		} catch {
			return { ok: false, message: "Erro ao processar a imagem." };
		}
	}

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
