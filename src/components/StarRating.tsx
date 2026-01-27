export default function StarRating({ rating }: { rating: number }) {
	return Array.from({ length: 5 }).map((_, i) => {
		let iconClass = "far fa-star";

		if (i < Math.floor(rating)) {
			iconClass = "fas fa-star";
		} else if (i === Math.floor(rating) && rating % 1 !== 0) {
			iconClass = "fas fa-star-half-alt";
		}

		return <i key={i} class={iconClass} />;
	});
}
