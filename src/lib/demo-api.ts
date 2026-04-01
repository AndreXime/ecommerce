import type { CartItem, Category, PaginatedResponse, ProductDetails, ProductSummary } from "@/database/productsTypes";
import type { AdminUser, Order, ProductDetailsWithImageIds, ProductImage } from "@/pages/admin/_components/types";
import { demoCategoriesSeed, demoFixedUser, demoOrdersSeed, demoProductsSeed, demoUsersSeed } from "./demo-data";
import { DEMO_CART_COOKIE, enableDemoSession, hasDemoSession, writeDemoCartCookie } from "./demo-mode";
import type { ServiceResponse } from "./request";

type DemoParams = Record<string, string | number | boolean | null | undefined>;

interface DemoRequest {
	readonly method: string;
	readonly path: string;
	readonly params?: DemoParams;
	readonly body?: unknown;
	readonly cookieHeader?: string | null;
}

interface DemoResult<T> {
	readonly status: number;
	readonly data: T | null;
	readonly message?: string;
	readonly errors?: Array<{ param: string; message: string }> | null;
}

interface DemoPresignResponse {
	readonly uploadUrl: string;
	readonly image: {
		readonly id: string;
		readonly url: string;
		readonly key: string;
		readonly position: number;
	};
}

interface DemoProductState extends ProductDetails {
	readonly categoryId: string;
	readonly imageObjects: ProductImage[];
}

const PRODUCTS_STORAGE_KEY = "demo_products";
const CATEGORIES_STORAGE_KEY = "demo_categories";
const USERS_STORAGE_KEY = "demo_users";
const ORDERS_STORAGE_KEY = "demo_orders";
const CART_STORAGE_KEY = "cart";

function cloneValue<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function parseDemoBody(body: unknown): unknown {
	if (!body || typeof body !== "string") return undefined;

	try {
		return JSON.parse(body);
	} catch {
		return undefined;
	}
}

function slugify(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function makeId(prefix: string): string {
	return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSeedProducts(): DemoProductState[] {
	return demoProductsSeed.map((product) => {
		const category = demoCategoriesSeed.find((item) => item.name === product.category);
		const imageObjects = product.images.map((url, index) => ({
			id: `${product.id}-img-${index + 1}`,
			url,
			position: index,
		}));

		return {
			...cloneValue(product),
			categoryId: category?.id ?? demoCategoriesSeed[0].id,
			imageObjects,
		};
	});
}

function readJsonStorage<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return cloneValue(fallback);

	const raw = window.localStorage.getItem(key);
	if (!raw) return cloneValue(fallback);

	try {
		return JSON.parse(raw) as T;
	} catch {
		return cloneValue(fallback);
	}
}

function writeJsonStorage<T>(key: string, value: T): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(key, JSON.stringify(value));
}

function getProducts(): DemoProductState[] {
	return readJsonStorage<DemoProductState[]>(PRODUCTS_STORAGE_KEY, getSeedProducts());
}

function saveProducts(products: DemoProductState[]): void {
	writeJsonStorage(PRODUCTS_STORAGE_KEY, products);
}

function getCategories(): Category[] {
	return readJsonStorage<Category[]>(CATEGORIES_STORAGE_KEY, demoCategoriesSeed);
}

function saveCategories(categories: Category[]): void {
	writeJsonStorage(CATEGORIES_STORAGE_KEY, categories);
}

function getUsers(): AdminUser[] {
	return readJsonStorage<AdminUser[]>(USERS_STORAGE_KEY, demoUsersSeed);
}

function saveUsers(users: AdminUser[]): void {
	writeJsonStorage(USERS_STORAGE_KEY, users);
}

function getOrders(): Order[] {
	return readJsonStorage<Order[]>(ORDERS_STORAGE_KEY, demoOrdersSeed);
}

function saveOrders(orders: Order[]): void {
	writeJsonStorage(ORDERS_STORAGE_KEY, orders);
}

function parseCookieValue(cookieHeader: string | null | undefined, cookieName: string): string | null {
	if (!cookieHeader) return null;

	const target = cookieHeader
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(`${cookieName}=`));

	if (!target) return null;

	return decodeURIComponent(target.slice(cookieName.length + 1));
}

function getServerCart(cookieHeader?: string | null): CartItem[] {
	const cartCookie = parseCookieValue(cookieHeader, DEMO_CART_COOKIE);
	if (!cartCookie) return [];

	try {
		return JSON.parse(cartCookie) as CartItem[];
	} catch {
		return [];
	}
}

function getClientCart(): CartItem[] {
	return readJsonStorage<CartItem[]>(CART_STORAGE_KEY, []);
}

function getCart(cookieHeader?: string | null): CartItem[] {
	if (typeof window === "undefined") return getServerCart(cookieHeader);
	return getClientCart();
}

function syncClientCart(cart: CartItem[]): void {
	if (typeof window === "undefined") return;
	writeJsonStorage(CART_STORAGE_KEY, cart);
	writeDemoCartCookie(JSON.stringify(cart));
	window.dispatchEvent(new Event("cart-updated"));
}

function requireSession<T>(cookieHeader: string | null | undefined): DemoResult<T> | null {
	const sessionSource = typeof window === "undefined" ? cookieHeader : document.cookie;

	if (hasDemoSession(sessionSource)) return null;

	return {
		status: 401,
		data: null,
		message: "Faça login para continuar.",
	};
}

function requireAdmin<T>(cookieHeader: string | null | undefined): DemoResult<T> | null {
	const sessionResult = requireSession<T>(cookieHeader);
	if (sessionResult) return sessionResult;

	if (demoFixedUser.personalData.role !== "ADMIN") {
		return { status: 403, data: null, message: "Acesso negado." };
	}

	return null;
}

function asProductSummary(product: DemoProductState): ProductSummary {
	return {
		id: product.id,
		name: product.name,
		tag: product.tag,
		price: product.price,
		category: product.category,
		discountPercentage: product.discountPercentage,
		images: product.imageObjects.map((image) => image.url),
		rating: product.rating,
		reviewsCount: product.reviewsCount,
		isNew: product.isNew,
		inStock: product.inStock,
	};
}

function asProductDetails(product: DemoProductState): ProductDetails {
	return {
		...product,
		images: product.imageObjects.map((image) => image.url),
	};
}

function asProductDetailsWithImageIds(product: DemoProductState): ProductDetailsWithImageIds {
	return {
		id: product.id,
		name: product.name,
		tag: product.tag,
		price: product.price,
		category: product.category,
		discountPercentage: product.discountPercentage ?? null,
		images: cloneValue(product.imageObjects),
		isNew: product.isNew ?? false,
		inStock: product.inStock,
		description: product.description,
		specs: cloneValue(product.specs),
	};
}

function paginate<T>(items: T[], page: number, limit: number): PaginatedResponse<T> {
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const safePage = Math.min(Math.max(page, 1), totalPages);
	const start = (safePage - 1) * limit;

	return {
		data: items.slice(start, start + limit),
		meta: {
			page: safePage,
			limit,
			total,
			totalPages,
		},
	};
}

function filterProducts(params?: DemoParams): DemoProductState[] {
	const products = getProducts();
	const search = String(params?.search ?? "")
		.trim()
		.toLowerCase();
	const category = String(params?.category ?? "")
		.trim()
		.toLowerCase();
	const minPrice = Number(params?.minPrice ?? 0);
	const maxPrice = Number(params?.maxPrice ?? 0);
	const sortBy = String(params?.sortBy ?? "");
	const sortOrder = String(params?.sortOrder ?? "asc");

	const filtered = products.filter((product) => {
		const matchesSearch =
			!search ||
			product.name.toLowerCase().includes(search) ||
			product.tag.toLowerCase().includes(search) ||
			product.category.toLowerCase().includes(search);
		const matchesCategory = !category || product.category.toLowerCase() === category;
		const matchesMinPrice = !minPrice || product.price >= minPrice;
		const matchesMaxPrice = !maxPrice || product.price <= maxPrice;

		return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
	});

	if (sortBy === "price") {
		filtered.sort((left, right) => (sortOrder === "desc" ? right.price - left.price : left.price - right.price));
	} else if (sortBy === "rating") {
		filtered.sort((left, right) => (sortOrder === "desc" ? right.rating - left.rating : left.rating - right.rating));
	} else if (sortBy === "createdAt") {
		filtered.sort((left, right) =>
			sortOrder === "desc" ? right.quantitySold - left.quantitySold : left.quantitySold - right.quantitySold,
		);
	} else {
		filtered.sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
	}

	return filtered;
}

function createCartItem(
	product: DemoProductState,
	quantity: number,
	selectedVariant?: Record<string, string>,
): CartItem {
	return {
		...asProductSummary(product),
		quantity,
		selectedVariant: selectedVariant ?? null,
		cartItemId: makeId("cart-item"),
	};
}

export async function handleDemoRequest<T>(request: DemoRequest): Promise<DemoResult<T>> {
	const normalizedPath = request.path.startsWith("/") ? request.path : `/${request.path}`;

	if (request.method === "POST" && normalizedPath === "/auth/login") {
		return {
			status: 200,
			data: cloneValue(demoFixedUser) as T,
			message: "Login realizado com sucesso.",
		};
	}

	if (request.method === "POST" && normalizedPath === "/auth/register") {
		return {
			status: 200,
			data: cloneValue(demoFixedUser) as T,
			message: "Conta demo criada com sucesso.",
		};
	}

	if (request.method === "POST" && normalizedPath === "/auth/refresh") {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		return {
			status: 200,
			data: cloneValue(demoFixedUser) as T,
			message: "Sessao demo renovada.",
		};
	}

	if (request.method === "GET" && normalizedPath === "/users/me") {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		return { status: 200, data: cloneValue(demoFixedUser) as T };
	}

	if (request.method === "GET" && normalizedPath === "/categories") {
		return { status: 200, data: cloneValue(getCategories()) as T };
	}

	if (request.method === "POST" && normalizedPath === "/categories") {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const body = (request.body ?? {}) as { name?: string };
		const categoryName = body.name?.trim();

		if (!categoryName) {
			return { status: 400, data: null, message: "Informe o nome da categoria." };
		}

		const categories = getCategories();
		const newCategory: Category = { id: makeId("cat"), name: categoryName };
		const nextCategories = [...categories, newCategory];
		saveCategories(nextCategories);

		return { status: 201, data: cloneValue(newCategory) as T, message: "Categoria criada." };
	}

	if (request.method === "GET" && normalizedPath === "/products") {
		const page = Number(request.params?.page ?? 1);
		const limit = Number(request.params?.limit ?? 12);
		const filtered = filterProducts(request.params).map(asProductSummary);
		return { status: 200, data: paginate(filtered, page, limit) as T };
	}

	if (request.method === "GET" && normalizedPath.startsWith("/products/")) {
		const productId = normalizedPath.split("/")[2];
		const product = getProducts().find((item) => item.id === productId);

		if (!product) {
			return { status: 404, data: null, message: "Produto nao encontrado." };
		}

		const wantsAdminImageObjects = typeof window !== "undefined" && normalizedPath === `/products/${productId}`;
		const responseData = wantsAdminImageObjects ? asProductDetailsWithImageIds(product) : asProductDetails(product);

		return { status: 200, data: cloneValue(responseData) as T };
	}

	if (request.method === "POST" && normalizedPath === "/products") {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const body = (request.body ?? {}) as {
			name?: string;
			tag?: string;
			price?: number;
			discountPercentage?: number | null;
			isNew?: boolean;
			inStock?: boolean;
			description?: string;
			categoryId?: string;
			specs?: Record<string, string>;
			images?: Array<{ url: string; position: number }>;
		};
		const categories = getCategories();
		const category = categories.find((item) => item.id === body.categoryId) ?? categories[0];
		const id = slugify(body.name ?? "") || makeId("product");
		const imageObjects = (body.images ?? []).map((image, index) => ({
			id: makeId("img"),
			url: image.url,
			position: image.position ?? index,
		}));

		const product: DemoProductState = {
			id,
			name: body.name ?? "Produto Demo",
			tag: body.tag ?? id,
			price: Number(body.price ?? 0),
			category: category?.name ?? "Acessórios",
			categoryId: category?.id ?? demoCategoriesSeed[0].id,
			discountPercentage: body.discountPercentage ?? null,
			images: imageObjects.map((image) => image.url),
			imageObjects,
			rating: 4.5,
			reviewsCount: 0,
			isNew: body.isNew ?? false,
			inStock: body.inStock ?? true,
			quantitySold: 0,
			description: body.description ?? "",
			specs: cloneValue(body.specs ?? {}),
			options: [],
			fullReviews: [],
		};

		const nextProducts = [product, ...getProducts()];
		saveProducts(nextProducts);

		return { status: 201, data: cloneValue(product) as T, message: "Produto criado." };
	}

	if (request.method === "PATCH" && normalizedPath.startsWith("/products/") && !normalizedPath.includes("/images/")) {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const productId = normalizedPath.split("/")[2];
		const body = (request.body ?? {}) as Record<string, unknown>;
		const categories = getCategories();
		const products = getProducts();

		const nextProducts = products.map((product) => {
			if (product.id !== productId) return product;

			const categoryId = typeof body.categoryId === "string" ? body.categoryId : product.categoryId;
			const category = categories.find((item) => item.id === categoryId);

			return {
				...product,
				name: typeof body.name === "string" ? body.name : product.name,
				tag: typeof body.tag === "string" ? body.tag : product.tag,
				price: typeof body.price === "number" ? body.price : product.price,
				discountPercentage:
					typeof body.discountPercentage === "number" || body.discountPercentage === null
						? body.discountPercentage
						: product.discountPercentage,
				isNew: typeof body.isNew === "boolean" ? body.isNew : product.isNew,
				inStock: typeof body.inStock === "boolean" ? body.inStock : product.inStock,
				description: typeof body.description === "string" ? body.description : product.description,
				specs:
					typeof body.specs === "object" && body.specs !== null
						? cloneValue(body.specs as Record<string, string>)
						: product.specs,
				categoryId,
				category: category?.name ?? product.category,
			};
		});

		saveProducts(nextProducts);
		const updated = nextProducts.find((product) => product.id === productId) ?? null;
		return { status: 200, data: cloneValue(updated) as T, message: "Produto atualizado." };
	}

	if (request.method === "DELETE" && normalizedPath.startsWith("/products/") && !normalizedPath.includes("/images/")) {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const productId = normalizedPath.split("/")[2];
		const nextProducts = getProducts().filter((product) => product.id !== productId);
		saveProducts(nextProducts);

		return { status: 200, data: null, message: "Produto removido." };
	}

	if (request.method === "POST" && /\/products\/[^/]+\/images$/.test(normalizedPath)) {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const productId = normalizedPath.split("/")[2];
		const body = (request.body ?? {}) as { imageUrl?: string; contentType?: string };
		const products = getProducts();
		let payload: DemoPresignResponse | null = null;

		const nextProducts = products.map((product) => {
			if (product.id !== productId) return product;

			const image = {
				id: makeId("img"),
				url:
					body.imageUrl ??
					"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
				position: product.imageObjects.length,
			};

			payload = {
				uploadUrl: "demo://upload",
				image: {
					...image,
					key: `${productId}/${image.id}.${body.contentType?.split("/")[1] ?? "webp"}`,
				},
			};

			return {
				...product,
				imageObjects: [...product.imageObjects, image],
				images: [...product.images, image.url],
			};
		});

		saveProducts(nextProducts);

		return { status: 201, data: cloneValue(payload) as T, message: "Imagem adicionada." };
	}

	if (request.method === "DELETE" && /\/products\/[^/]+\/images\/[^/]+$/.test(normalizedPath)) {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const [, , productId, , imageId] = normalizedPath.split("/");
		const nextProducts = getProducts().map((product) => {
			if (product.id !== productId) return product;

			const imageObjects = product.imageObjects
				.filter((image) => image.id !== imageId)
				.map((image, index) => ({ ...image, position: index }));

			return {
				...product,
				imageObjects,
				images: imageObjects.map((image) => image.url),
			};
		});

		saveProducts(nextProducts);
		return { status: 200, data: null, message: "Imagem removida." };
	}

	if (request.method === "GET" && normalizedPath === "/cart") {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		return {
			status: 200,
			data: {
				id: "demo-cart",
				items: cloneValue(getCart(request.cookieHeader)),
			} as T,
		};
	}

	if (request.method === "POST" && normalizedPath === "/cart/items") {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		const body = (request.body ?? {}) as {
			productId?: string;
			quantity?: number;
			selectedVariant?: Record<string, string>;
		};
		const product = getProducts().find((item) => item.id === body.productId);

		if (!product) {
			return { status: 404, data: null, message: "Produto nao encontrado." };
		}

		const cart = getCart(request.cookieHeader);
		const nextCart = [...cart, createCartItem(product, Math.max(1, body.quantity ?? 1), body.selectedVariant)];

		if (typeof window !== "undefined") syncClientCart(nextCart);

		return {
			status: 201,
			data: { id: "demo-cart", items: cloneValue(nextCart) } as T,
			message: "Produto adicionado ao carrinho.",
		};
	}

	if (request.method === "PATCH" && normalizedPath.startsWith("/cart/items/")) {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		const productId = normalizedPath.split("/")[3];
		const body = (request.body ?? {}) as { quantity?: number };
		const quantity = Math.max(1, Number(body.quantity ?? 1));
		const cart = getCart(request.cookieHeader);
		const nextCart = cart.map((item) => (item.id === productId ? { ...item, quantity } : item));

		if (typeof window !== "undefined") syncClientCart(nextCart);

		return {
			status: 200,
			data: { id: "demo-cart", items: cloneValue(nextCart) } as T,
			message: "Carrinho atualizado.",
		};
	}

	if (request.method === "DELETE" && normalizedPath.startsWith("/cart/items/")) {
		const sessionResult = requireSession<T>(request.cookieHeader);
		if (sessionResult) return sessionResult;

		const productId = normalizedPath.split("/")[3];
		const nextCart = getCart(request.cookieHeader).filter((item) => item.id !== productId);

		if (typeof window !== "undefined") syncClientCart(nextCart);

		return {
			status: 200,
			data: { id: "demo-cart", items: cloneValue(nextCart) } as T,
			message: "Item removido.",
		};
	}

	if (request.method === "GET" && normalizedPath === "/users") {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const page = Number(request.params?.page ?? 1);
		const limit = Number(request.params?.limit ?? 10);
		const search = String(request.params?.search ?? "")
			.trim()
			.toLowerCase();
		const filteredUsers = getUsers().filter((user) => {
			if (!search) return true;
			return user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search);
		});

		return { status: 200, data: paginate(filteredUsers, page, limit) as T };
	}

	if (request.method === "PUT" && normalizedPath === "/users") {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const body = (request.body ?? {}) as { id?: string; name?: string };
		const nextUsers = getUsers().map((user) =>
			user.id === body.id
				? { ...user, name: body.name?.trim() || user.name, updatedAt: new Date().toISOString() }
				: user,
		);
		saveUsers(nextUsers);

		const updatedUser = nextUsers.find((user) => user.id === body.id) ?? null;
		return { status: 200, data: cloneValue(updatedUser) as T, message: "Usuario atualizado." };
	}

	if (request.method === "GET" && normalizedPath === "/orders") {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const page = Number(request.params?.page ?? 1);
		const limit = Number(request.params?.limit ?? 10);
		return { status: 200, data: paginate(getOrders(), page, limit) as T };
	}

	if (request.method === "PATCH" && /\/orders\/[^/]+\/status$/.test(normalizedPath)) {
		const adminResult = requireAdmin<T>(request.cookieHeader);
		if (adminResult) return adminResult;

		const orderId = normalizedPath.split("/")[2];
		const body = (request.body ?? {}) as { status?: Order["status"] };
		const nextOrders = getOrders().map((order) =>
			order.id === orderId && body.status ? { ...order, status: body.status } : order,
		);
		saveOrders(nextOrders);

		const updatedOrder = nextOrders.find((order) => order.id === orderId) ?? null;
		return { status: 200, data: cloneValue(updatedOrder) as T, message: "Pedido atualizado." };
	}

	return {
		status: 404,
		data: null,
		message: `Rota demo nao implementada: ${request.method} ${normalizedPath}`,
	};
}

export async function handleDemoClientRequest<T>(request: DemoRequest): Promise<ServiceResponse<T>> {
	const response = await handleDemoRequest<T>({
		...request,
		body: parseDemoBody(request.body),
	});

	if ((request.path === "/auth/login" || request.path === "/auth/register") && response.status < 400) {
		enableDemoSession();
	}

	if (response.status >= 400) {
		return {
			ok: false,
			data: null,
			message: response.message ?? "Ocorreu um erro ao processar a requisição.",
			errors: response.errors ?? null,
		};
	}

	return {
		ok: true,
		data: response.data as T,
		error: null,
		message: response.message ?? "",
	};
}
