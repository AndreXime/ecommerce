export interface User {
	personalData: {
		name: string;
		email: string;
		registration: string | null;
		phone: string | null;
		registredAt: string;
	};
	ordersHistory: {
		id: string;
		date: string;
		total: number;
		status: "delivered" | "intransit" | "cancelled";
		items: {
			id: string;
			name: string;
			variant: string | null;
			img: string | null;
			quantity: number;
			price: number;
		}[];
	}[];
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
		isDefault: boolean;
	}[];
}
