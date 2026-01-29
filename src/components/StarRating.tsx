import { Star } from "lucide-preact";

export default function StarRating({ rating }: { rating: number }) {
	return (
		<div style={{ display: "flex", gap: "4px" }}>
			{Array.from({ length: 5 }).map((_, i) => {
				const isFull = i < Math.floor(rating);
				const isHalf = i === Math.floor(rating) && rating % 1 !== 0;

				if (isFull) {
					// Estrela preenchida
					return <Star key={i} size={16} fill="currentColor" color="currentColor" />;
				}

				if (isHalf) {
					// Estrela pela metade
					return (
						<div key={i} style={{ position: "relative", display: "inline-block" }}>
							<Star size={16} color="currentColor" />
							<div style={{ position: "absolute", top: 0, left: 0, width: "50%", overflow: "hidden" }}>
								<Star size={16} fill="currentColor" color="currentColor" />
							</div>
						</div>
					);
				}

				// Estrela vazia
				return <Star key={i} size={16} color="currentColor" />;
			})}
		</div>
	);
}
