export interface ProductImage {
	id: string;
	url: string;
	position: number;
}

export interface ProductSummary {
	id: string;
	name: string;
	tag: string;
	price: number;
	category: string;
	discountPercentage?: number | null;
	images: string[];
	rating: number;
	reviewsCount: number;
	isNew?: boolean;
	inStock: boolean;
}

export interface ProductDetails extends Omit<ProductSummary, "images"> {
	quantitySold: number;
	description: string;
	specs: Record<string, string>;
	images: ProductImage[];
	options?: SelectableOption[];
	fullReviews?: Review[];
}

export interface CartItem extends ProductSummary {
	quantity: number;
	selectedVariant?: Record<string, string> | null;
	cartItemId: string;
}

export interface SelectableOption {
	id: string;
	label: string;
	uiType: "color" | "pill" | "select";
	values: string[];
}

export interface Review {
	id: string;
	author: string;
	avatar?: string | null;
	initials?: string | null;
	rating: number;
	date: string;
	title: string;
	content: string;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface Category {
	id: string;
	name: string;
}
