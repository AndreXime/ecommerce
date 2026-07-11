export type Tab = "users" | "products" | "orders" | "categories" | "shipping";

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
	stockQuantity?: number;
	quantitySold?: number;
	weight?: number;
};

export type ProductDetailsWithImageIds = Omit<ProductDetails, "images"> & {
	images: ProductImage[];
};

export type Category = { id: string; name: string };

export type ShippingMethod = {
	id: string;
	name: string;
	code: string;
	basePrice: number;
	pricePerKm: number;
	pricePerKg: number;
	daysBase: number;
	kmPerDay: number;
	active: boolean;
	carrierId: string;
};

export type Carrier = {
	id: string;
	name: string;
	slug: string;
	active: boolean;
	hubLat: number;
	hubLng: number;
	methods?: ShippingMethod[];
};

export type OrderShipment = {
	id: string;
	carrierName: string;
	methodName: string;
	methodCode: string;
	cost: number;
	estimatedDays: number;
	destinationCep: string;
	distanceKm: number | null;
	status: "pending" | "in_transit" | "delivered";
};

export type Order = {
	id: string;
	date: string;
	subtotal: number;
	shippingCost: number;
	total: number;
	status: "pending" | "delivered" | "intransit" | "cancelled";
	items: { id: string; name: string; quantity: number; price: number }[];
	shipment: OrderShipment | null;
};

