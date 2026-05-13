export type Tab = "users" | "products" | "orders" | "categories";

export type Meta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "CUSTOMER" | "SUPPORT";
	createdAt: string;
	updatedAt: string;
};

export type ProductImage = { id: string; url: string; position: number };

export type Product = {
	id: string;
	name: string;
	tag: string;
	price: number;
	category: string;
	discountPercentage: number | null;
	images: string[];
	isNew: boolean;
	inStock: boolean;
};

export type ProductDetails = Product & {
	description: string;
	specs: Record<string, string>;
};

export type ProductDetailsWithImageIds = Omit<ProductDetails, "images"> & {
	images: ProductImage[];
};

export type Category = { id: string; name: string };

export type Order = {
	id: string;
	date: string;
	total: number;
	status: "delivered" | "intransit" | "cancelled";
	items: { id: string; name: string; quantity: number; price: number }[];
};

