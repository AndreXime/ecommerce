import type { Category, ProductDetails } from "@/database/productsTypes";
import type { User } from "@/database/users";
import type { AdminUser, Order } from "@/pages/admin/_components/types";

export const demoCategoriesSeed: Category[] = [
	{ id: "cat-smartphones", name: "Smartphones" },
	{ id: "cat-notebooks", name: "Notebooks" },
	{ id: "cat-audio", name: "Audio" },
	{ id: "cat-acessorios", name: "Acessórios" },
];

export const demoProductsSeed: ProductDetails[] = [
	{
		id: "phone-x-pro",
		name: "Phone X Pro",
		tag: "smartphone-premium",
		price: 4299.9,
		category: "Smartphones",
		discountPercentage: 12,
		images: [
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.8,
		reviewsCount: 184,
		isNew: true,
		inStock: true,
		quantitySold: 920,
		description:
			"Smartphone premium com tela OLED, câmera tripla de alta definição e bateria para o dia inteiro.",
		specs: {
			tela: '6.7" OLED',
			processador: "Octa-core X1",
			memoria: "12GB",
			armazenamento: "256GB",
			bateria: "5000mAh",
		},
		options: [
			{ id: "color-phone", label: "Cor", uiType: "pill", values: ["Preto", "Azul", "Prata"] },
			{ id: "storage-phone", label: "Armazenamento", uiType: "pill", values: ["128GB", "256GB"] },
		],
		fullReviews: [
			{
				id: "rev-phone-1",
				author: "Mariana Costa",
				initials: "MC",
				rating: 5,
				date: "12/03/2026",
				title: "Excelente custo-beneficio",
				content: "Tela muito boa e a bateria durou mais do que eu esperava no uso intenso.",
			},
		],
	},
	{
		id: "notebook-air-14",
		name: "Notebook Air 14",
		tag: "notebook-ultrafino",
		price: 5799.9,
		category: "Notebooks",
		discountPercentage: 8,
		images: [
			"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.7,
		reviewsCount: 96,
		isNew: true,
		inStock: true,
		quantitySold: 410,
		description:
			"Notebook leve para produtividade com tela de alta resolução, SSD rápido e autonomia prolongada.",
		specs: {
			tela: '14" IPS',
			processador: "Core Ultra 7",
			memoria: "16GB",
			armazenamento: "512GB SSD",
			peso: "1.2kg",
		},
		options: [
			{ id: "color-notebook", label: "Cor", uiType: "pill", values: ["Grafite", "Prata"] },
		],
		fullReviews: [
			{
				id: "rev-note-1",
				author: "Lucas Santos",
				initials: "LS",
				rating: 5,
				date: "02/02/2026",
				title: "Perfeito para trabalhar",
				content: "Silencioso, leve e com desempenho muito consistente para uso profissional.",
			},
		],
	},
	{
		id: "fone-wave-buds",
		name: "Wave Buds ANC",
		tag: "fone-bluetooth",
		price: 699.9,
		category: "Audio",
		discountPercentage: 18,
		images: [
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.6,
		reviewsCount: 238,
		isNew: false,
		inStock: true,
		quantitySold: 1370,
		description:
			"Fones sem fio com cancelamento de ruído ativo, baixa latência e estojo com carregamento rápido.",
		specs: {
			bateria: "36h com estojo",
			conectividade: "Bluetooth 5.3",
			peso: "4.8g por lado",
			microfones: "6 microfones",
		},
		options: [
			{ id: "color-buds", label: "Cor", uiType: "pill", values: ["Preto", "Branco"] },
		],
		fullReviews: [
			{
				id: "rev-buds-1",
				author: "Ana Clara",
				initials: "AC",
				rating: 4,
				date: "20/01/2026",
				title: "Muito confortável",
				content: "Qualidade sonora muito boa e bom encaixe, só queria volume um pouco mais alto.",
			},
		],
	},
	{
		id: "keyboard-pro-max",
		name: "Keyboard Pro Max",
		tag: "teclado-mecanico",
		price: 499.9,
		category: "Acessórios",
		discountPercentage: null,
		images: [
			"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.5,
		reviewsCount: 74,
		isNew: false,
		inStock: true,
		quantitySold: 255,
		description:
			"Teclado mecanico com switch linear, RGB configuravel e estrutura em aluminio para setups premium.",
		specs: {
			layout: "ABNT2",
			switch: "Linear",
			iluminacao: "RGB",
			conexao: "USB-C",
		},
		options: [
			{ id: "switch-keyboard", label: "Switch", uiType: "pill", values: ["Linear", "Tactile"] },
		],
		fullReviews: [
			{
				id: "rev-key-1",
				author: "Pedro Alves",
				initials: "PA",
				rating: 5,
				date: "18/12/2025",
				title: "Construção excelente",
				content: "Muito bem acabado e com digitação extremamente agradável no uso diário.",
			},
		],
	},
	{
		id: "phone-lite-5g",
		name: "Phone Lite 5G",
		tag: "smartphone-intermediario",
		price: 2199.9,
		category: "Smartphones",
		discountPercentage: 10,
		images: [
			"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.4,
		reviewsCount: 121,
		isNew: false,
		inStock: true,
		quantitySold: 640,
		description:
			"Modelo intermediario com conectividade 5G, tela fluida e cameras equilibradas para o dia a dia.",
		specs: {
			tela: '6.5" AMOLED',
			processador: "Snapdragon 7 Gen",
			memoria: "8GB",
			armazenamento: "256GB",
			bateria: "4700mAh",
		},
		options: [
			{ id: "color-phone-lite", label: "Cor", uiType: "pill", values: ["Grafite", "Verde", "Azul"] },
			{ id: "storage-phone-lite", label: "Armazenamento", uiType: "pill", values: ["128GB", "256GB"] },
		],
		fullReviews: [
			{
				id: "rev-phone-lite-1",
				author: "Joao Henrique",
				initials: "JH",
				rating: 4,
				date: "08/03/2026",
				title: "Bom equilibrio",
				content: "Entrega bastante pelo preco e a tela surpreende para a categoria.",
			},
		],
	},
	{
		id: "notebook-studio-16",
		name: "Notebook Studio 16",
		tag: "notebook-criativo",
		price: 8499.9,
		category: "Notebooks",
		discountPercentage: 6,
		images: [
			"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.9,
		reviewsCount: 58,
		isNew: true,
		inStock: true,
		quantitySold: 190,
		description:
			"Notebook de alto desempenho para edicao, design e multitarefa pesada com tela ampla e cores precisas.",
		specs: {
			tela: '16" 3K',
			processador: "Ryzen 9",
			memoria: "32GB",
			armazenamento: "1TB SSD",
			gpu: "RTX 4060",
		},
		options: [
			{ id: "color-studio", label: "Cor", uiType: "pill", values: ["Cinza Espacial", "Prata"] },
		],
		fullReviews: [
			{
				id: "rev-studio-1",
				author: "Carla Mendes",
				initials: "CM",
				rating: 5,
				date: "27/02/2026",
				title: "Perfeito para edicao",
				content: "A tela e o desempenho fazem diferenca real para design e video.",
			},
		],
	},
	{
		id: "speaker-boom-mini",
		name: "Speaker Boom Mini",
		tag: "caixa-bluetooth",
		price: 349.9,
		category: "Audio",
		discountPercentage: 15,
		images: [
			"https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.3,
		reviewsCount: 89,
		isNew: false,
		inStock: true,
		quantitySold: 510,
		description:
			"Caixa de som compacta com graves reforcados, protecao contra respingos e bateria para festas curtas.",
		specs: {
			potencia: "30W",
			bateria: "12h",
			conectividade: "Bluetooth 5.2",
			protecao: "IPX6",
		},
		options: [
			{ id: "color-speaker", label: "Cor", uiType: "pill", values: ["Preto", "Vermelho"] },
		],
		fullReviews: [
			{
				id: "rev-speaker-1",
				author: "Renata Lima",
				initials: "RL",
				rating: 4,
				date: "11/01/2026",
				title: "Compacta e potente",
				content: "Boa para ambientes pequenos e muito facil de transportar.",
			},
		],
	},
	{
		id: "mouse-ultra-wireless",
		name: "Mouse Ultra Wireless",
		tag: "mouse-gamer",
		price: 279.9,
		category: "Acessórios",
		discountPercentage: null,
		images: [
			"https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.6,
		reviewsCount: 143,
		isNew: true,
		inStock: true,
		quantitySold: 780,
		description:
			"Mouse sem fio com sensor preciso, baixa latencia e design leve para produtividade e jogos.",
		specs: {
			sensor: "26000 DPI",
			peso: "62g",
			bateria: "70h",
			conexao: "2.4GHz / Bluetooth",
		},
		options: [
			{ id: "color-mouse", label: "Cor", uiType: "pill", values: ["Preto", "Branco"] },
		],
		fullReviews: [
			{
				id: "rev-mouse-1",
				author: "Thiago Rocha",
				initials: "TR",
				rating: 5,
				date: "03/03/2026",
				title: "Muito leve",
				content: "Pegada excelente e resposta imediata, gostei bastante para trabalho e FPS.",
			},
		],
	},
	{
		id: "monitor-view-27",
		name: "Monitor View 27",
		tag: "monitor-4k",
		price: 1899.9,
		category: "Acessórios",
		discountPercentage: 9,
		images: [
			"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.7,
		reviewsCount: 67,
		isNew: false,
		inStock: true,
		quantitySold: 330,
		description:
			"Monitor 27 polegadas com painel IPS, alta nitidez e excelente fidelidade de cores para escritorio e criacao.",
		specs: {
			resolucao: "4K UHD",
			taxa: "144Hz",
			painel: "IPS",
			conexoes: "HDMI / DisplayPort / USB-C",
		},
		options: [
			{ id: "size-monitor", label: "Tamanho", uiType: "pill", values: ['27"', '32"'] },
		],
		fullReviews: [
			{
				id: "rev-monitor-1",
				author: "Bruno Dias",
				initials: "BD",
				rating: 5,
				date: "22/02/2026",
				title: "Imagem impecavel",
				content: "Excelente para produtividade e o USB-C simplificou muito minha mesa.",
			},
		],
	},
	{
		id: "headset-focus-pro",
		name: "Headset Focus Pro",
		tag: "headset-office",
		price: 599.9,
		category: "Audio",
		discountPercentage: 11,
		images: [
			"https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80",
			"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
		],
		rating: 4.5,
		reviewsCount: 112,
		isNew: true,
		inStock: true,
		quantitySold: 460,
		description:
			"Headset pensado para reunioes e trabalho remoto com cancelamento de ruído e captação de voz limpa.",
		specs: {
			microfone: "Duplo com ENC",
			bateria: "28h",
			conectividade: "Bluetooth 5.3",
			peso: "210g",
		},
		options: [
			{ id: "color-headset", label: "Cor", uiType: "pill", values: ["Preto", "Cinza"] },
		],
		fullReviews: [
			{
				id: "rev-headset-1",
				author: "Fernanda Reis",
				initials: "FR",
				rating: 4,
				date: "15/03/2026",
				title: "Muito bom para reunioes",
				content: "Microfone muito claro e conforto suficiente para varias horas de uso.",
			},
		],
	},
];

export const demoFixedUser: User = {
	personalData: {
		name: "Andre Ximenes",
		email: "demo@emporium.dev",
		registration: "123.456.789-00",
		phone: "(11) 99999-0000",
		role: "ADMIN",
		registredAt: "2024-05-10T12:00:00.000Z",
	},
	ordersHistory: [
		{
			id: "PED-1001",
			date: "14/03/2026",
			total: 699.9,
			status: "delivered",
			items: [
				{
					id: "fone-wave-buds",
					name: "Wave Buds ANC",
					variant: "Preto",
					img: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=400&q=80",
					quantity: 1,
					price: 699.9,
				},
			],
		},
	],
	wishlistProducts: demoProductsSeed.slice(0, 2).map((product) => ({
		id: product.id,
		name: product.name,
		tag: product.tag,
		price: product.price,
		category: product.category,
		discountPercentage: product.discountPercentage ?? null,
		images: product.images,
		rating: product.rating,
		reviewsCount: product.reviewsCount,
		isNew: product.isNew ?? false,
		inStock: product.inStock,
	})),
	paymentCards: [
		{
			id: "card-1",
			brand: "Visa",
			last4: "4242",
			holder: "Andre Ximenes",
			expiry: "12/29",
		},
	],
	addresses: [
		{
			id: "addr-1",
			type: "Casa",
			street: "Rua Demo, 123 - Centro",
			city: "Sao Paulo / SP",
			isDefault: true,
		},
	],
};

export const demoUsersSeed: AdminUser[] = [
	{
		id: "user-admin-1",
		name: "Andre Ximenes",
		email: "demo@emporium.dev",
		role: "ADMIN",
		createdAt: "2024-05-10T12:00:00.000Z",
		updatedAt: "2026-03-15T08:00:00.000Z",
	},
	{
		id: "user-customer-1",
		name: "Mariana Costa",
		email: "mariana@cliente.dev",
		role: "CUSTOMER",
		createdAt: "2025-08-22T10:30:00.000Z",
		updatedAt: "2026-02-01T11:00:00.000Z",
	},
	{
		id: "user-support-1",
		name: "Lucas Suporte",
		email: "suporte@emporium.dev",
		role: "SUPPORT",
		createdAt: "2025-11-10T14:20:00.000Z",
		updatedAt: "2026-02-24T17:40:00.000Z",
	},
];

export const demoOrdersSeed: Order[] = [
	{
		id: "order-demo-1",
		date: "2026-03-14T13:00:00.000Z",
		total: 699.9,
		status: "delivered",
		items: [{ id: "fone-wave-buds", name: "Wave Buds ANC", quantity: 1, price: 699.9 }],
	},
	{
		id: "order-demo-2",
		date: "2026-03-20T09:30:00.000Z",
		total: 5799.9,
		status: "intransit",
		items: [{ id: "notebook-air-14", name: "Notebook Air 14", quantity: 1, price: 5799.9 }],
	},
];
