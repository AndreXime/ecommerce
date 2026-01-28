export interface User {
	personalData: {
		name: string;
		email: string;
		registration: string;
		phone: string;
		registredAt: Date;
	};
	ordersHistory: {
		id: string;
		date: string;
		total: number;
		status: "Entregue" | "Em Trânsito" | "Cancelado";
		items: { name: string; variant: string; img: string }[];
	}[];
	wishlistProducts: {
		id: string;
		name: string;
		category: string;
		price: number;
		image: string;
		inStock: boolean;
	}[];
	paymentCards: {
		id: string;
		brand: "mastercard" | "visa";
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

export const users: User[] = [
	{
		personalData: {
			name: "André Ximenes",
			email: "andre@email.com",
			phone: "4002-8922",
			registration: "123456789-10",
			registredAt: new Date("2024-10-17T00:00:00Z"),
		},
		ordersHistory: [
			{
				id: "#928301",
				date: "24 Out 2024",
				total: 1798.0,
				status: "Entregue",
				items: [
					{
						name: "AeroBook Pro 15",
						variant: "Cinza Espacial",
						img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=100",
					},
					{
						name: "SoundScape ANC",
						variant: "Preto Matte",
						img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100",
					},
				],
			},
			{
				id: "#882100",
				date: "10 Set 2024",
				total: 59.99,
				status: "Entregue",
				items: [
					{
						name: "GameSphere 5",
						variant: "Branco",
						img: "https://images.unsplash.com/photo-1605901309584-818e25960b8f?auto=format&fit=crop&q=80&w=100",
					},
				],
			},
		],
		wishlistProducts: [
			{
				id: "1",
				name: "Tabula Slate Pro",
				category: "Tablet",
				price: 599.0,
				image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=100",
				inStock: true,
			},
			{
				id: "2",
				name: "SkyLark Drone",
				category: "Drone",
				price: 899.0,
				image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80&w=100",
				inStock: false,
			},
		],
		addresses: [
			{
				id: "1",
				type: "Casa",
				street: "Av. Paulista, 1000, Apt 42",
				city: "Bela Vista, São Paulo - SP",
				isDefault: true,
			},
			{
				id: "2",
				type: "Trabalho",
				street: "Rua Funchal, 200, Bloco B",
				city: "Vila Olímpia, São Paulo - SP",
				isDefault: false,
			},
		],
		paymentCards: [{ id: "1", brand: "mastercard", last4: "8829", holder: "JOAO D SILVA", expiry: "10/28" }],
	},
];
