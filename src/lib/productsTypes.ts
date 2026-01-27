export interface ProductSummary {
	id: string;
	name: string;
	tag: string;
	price: number;
	discountPercentage?: number;
	images: string[];
	rating: number;
	reviewsCount: number;
	isNew?: boolean;
}

export interface ProductDetails extends ProductSummary {
	description: string;
	specs: Record<string, string>;
	options?: SelectableOption[];
	fullReviews?: Review[];
}

export interface CartItem extends ProductSummary {
	quantity: number;
	selectedVariant?: string;
}

export interface SelectableOption {
	id: string; // ex: "color", "storage", "voltage", "size"
	label: string; // ex: "Cor", "Armazenamento", "Tamanho"
	uiType: "color" | "pill" | "select";
	values: string[]; // ex: ["bg-red-500", "bg-blue-500"] ou ["256GB", "512GB"]
}

export interface Review {
	id: string;
	author: string;
	avatar?: string;
	initials?: string;
	rating: number;
	date: string;
	title: string;
	content: string;
}
