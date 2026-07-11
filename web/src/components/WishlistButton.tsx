import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import { Heart } from "lucide-preact";
import { useState } from "preact/hooks";

interface WishlistButtonProps {
	productId: string;
	initialWishlisted?: boolean;
	className?: string;
}

export default function WishlistButton({
	productId,
	initialWishlisted = false,
	className = "",
}: WishlistButtonProps) {
	const [wishlisted, setWishlisted] = useState(initialWishlisted);
	const [loading, setLoading] = useState(false);

	const handleToggle = async (e: MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (loading) return;

		setLoading(true);
		const response = await request.post<{ wishlisted: boolean }>(`/wishlist/${productId}`);

		if (!response.ok) {
			if (response.message.toLowerCase().includes("autenti") || response.message.includes("401")) {
				toast.error("Faça login para salvar favoritos");
				setTimeout(() => {
					window.location.href = "/login";
				}, 1200);
			} else {
				toast.error(response.message || "Não foi possível atualizar a lista de desejos");
			}
			setLoading(false);
			return;
		}

		setWishlisted(response.data.wishlisted);
		toast.success(
			response.data.wishlisted ? "Adicionado à lista de desejos" : "Removido da lista de desejos",
		);
		setLoading(false);
	};

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={loading}
			aria-pressed={wishlisted}
			aria-label={wishlisted ? "Remover da lista de desejos" : "Adicionar à lista de desejos"}
			class={`inline-flex items-center justify-center rounded-full border transition disabled:opacity-60 ${
				wishlisted
					? "border-accent bg-accent-soft text-accent"
					: "border-rule bg-paper text-muted hover:text-accent hover:border-accent"
			} ${className}`}
		>
			<Heart class={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} aria-hidden="true" />
		</button>
	);
}
