import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";

interface ReviewResponse {
	id: string;
	author: string;
	avatar?: string | null;
	initials?: string | null;
	rating: number;
	date: string;
	title: string;
	content: string;
}

interface ProductReviewFormProps {
	productId: string;
}

export default function ProductReviewForm({ productId }: ProductReviewFormProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [rating, setRating] = useState(5);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const title = String(formData.get("title") ?? "").trim();
		const content = String(formData.get("content") ?? "").trim();

		const response = await request.post<ReviewResponse>(`/products/${productId}/reviews`, {
			rating,
			title,
			content,
		});

		if (!response.ok) {
			if (response.message.toLowerCase().includes("autenti") || response.message.includes("401")) {
				toast.error("Faça login para avaliar");
				setTimeout(() => {
					window.location.href = "/login";
				}, 1200);
			} else {
				toast.error(response.message || "Não foi possível enviar a avaliação");
			}
			setLoading(false);
			return;
		}

		toast.success("Avaliação publicada!");
		window.location.hash = "reviews";
		window.location.reload();
	};

	if (!open) {
		return (
			<button
				type="button"
				class="btn btn-secondary w-full !py-2 text-sm"
				onClick={() => setOpen(true)}
			>
				Escrever avaliação
			</button>
		);
	}

	return (
		<form onSubmit={handleSubmit} class="space-y-3 text-left">
			<div>
				<label htmlFor="review-rating" class="block text-sm font-medium text-ink-2 mb-1">
					Nota
				</label>
				<select
					id="review-rating"
					class="input"
					value={rating}
					onChange={(e) => setRating(Number((e.target as HTMLSelectElement).value))}
				>
					{[5, 4, 3, 2, 1].map((value) => (
						<option key={value} value={value}>
							{value}
						</option>
					))}
				</select>
			</div>
			<div>
				<label htmlFor="review-title" class="block text-sm font-medium text-ink-2 mb-1">
					Título
				</label>
				<input
					id="review-title"
					name="title"
					class="input"
					required
					minLength={3}
					placeholder="Resumo da sua experiência"
				/>
			</div>
			<div>
				<label htmlFor="review-content" class="block text-sm font-medium text-ink-2 mb-1">
					Avaliação
				</label>
				<textarea
					id="review-content"
					name="content"
					class="input min-h-24"
					required
					minLength={10}
					placeholder="Conte o que achou do produto"
				/>
			</div>
			<div class="flex gap-2">
				<button
					type="button"
					class="btn btn-secondary flex-1 !py-2 text-sm"
					onClick={() => setOpen(false)}
					disabled={loading}
				>
					Cancelar
				</button>
				<button type="submit" class="btn btn-primary flex-1 !py-2 text-sm" disabled={loading}>
					{loading ? "Enviando..." : "Publicar"}
				</button>
			</div>
		</form>
	);
}
