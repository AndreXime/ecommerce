import { Star } from "lucide-preact";

export default function StarRating({ rating }: { rating: number }) {
	return (
		<div
			role="img"
			aria-label={`${rating} de 5 estrelas`}
			style={{ display: "flex", gap: "4px" }}
		>
			{Array.from({ length: 5 }).map((_, i) => {
				const isFull = i < Math.floor(rating);
				const isHalf = i === Math.floor(rating) && rating % 1 !== 0;

				if (isFull) {
					return <Star key={i} size={16} fill="currentColor" color="currentColor" aria-hidden="true" />;
				}

				if (isHalf) {
					return (
						<div key={i} style={{ position: "relative", display: "inline-block" }} aria-hidden="true">
							<Star size={16} color="currentColor" />
							<div style={{ position: "absolute", top: 0, left: 0, width: "50%", overflow: "hidden" }}>
								<Star size={16} fill="currentColor" color="currentColor" />
							</div>
						</div>
					);
				}

				return <Star key={i} size={16} color="currentColor" aria-hidden="true" />;
			})}
		</div>
	);
}
