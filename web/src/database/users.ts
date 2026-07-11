export interface OrderShipment {
	id: string;
	carrierName: string;
	methodName: string;
	methodCode: string;
	cost: number;
	estimatedDays: number;
	destinationCep: string;
	distanceKm: number | null;
	status: "pending" | "in_transit" | "delivered";
}

export interface OrderHistoryItem {
	id: string;
	name: string;
	variant: string | null;
	img: string | null;
	quantity: number;
	price: number;
	unitPrice?: number;
	discountPercentage?: number | null;
	subtotal?: number;
}

export interface OrderHistory {
	id: string;
	date: string;
	subtotal: number;
	shippingCost: number;
	total: number;
	status: "pending" | "delivered" | "intransit" | "cancelled";
	items: OrderHistoryItem[];
	shipment: OrderShipment | null;
}

export interface User {
	personalData: {
		id: string;
		name: string;
		email: string;
		registration: string | null;
		phone: string | null;
		role: "ADMIN" | "CUSTOMER" | "SUPPORT";
		registredAt: string;
	};
	ordersHistory: OrderHistory[];
	wishlistProducts: {
		id: string;
		name: string;
		tag: string;
		price: number;
		category: string;
		discountPercentage: number | null;
		images: string[];
		rating: number;
		reviewsCount: number;
		isNew: boolean;
		inStock: boolean;
	}[];
	paymentCards: {
		id: string;
		brand: string;
		last4: string;
		holder: string;
		expiry: string;
	}[];
	addresses: {
		id: string;
		type: string;
		street: string;
		city: string;
		cep: string;
		isDefault: boolean;
	}[];
}
