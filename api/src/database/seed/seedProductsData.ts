import { join } from "node:path";
import type { ImageDef } from "./seedProductsImages";
import type { SeedUser } from "./seedUsersData";

const PRODUCTS_PATH = join(import.meta.dir, "products.json");

const CATEGORY_LABELS: Record<string, string> = {
	beauty: "Beleza",
	fragrances: "Fragrâncias",
	furniture: "Móveis",
	groceries: "Mercado",
	"home-decoration": "Casa & Decoração",
	"kitchen-accessories": "Utensílios de Cozinha",
};

interface DummyJsonDimensions {
	width: number;
	height: number;
	depth: number;
}

interface DummyJsonReview {
	rating: number;
	comment: string;
	date: string;
	reviewerName: string;
	reviewerEmail: string;
}

interface DummyJsonOption {
	label: string;
	uiType: "color" | "pill" | "select";
	values: string[];
}

interface DummyJsonProduct {
	id: number;
	title: string;
	description: string;
	category: string;
	price: number;
	discountPercentage?: number;
	stock: number;
	brand?: string;
	sku?: string;
	weight?: number;
	dimensions?: DummyJsonDimensions;
	warrantyInformation?: string;
	shippingInformation?: string;
	availabilityStatus?: string;
	reviews?: DummyJsonReview[];
	images: string[];
	options?: DummyJsonOption[];
}

interface DummyJsonProductsResponse {
	products: DummyJsonProduct[];
}

export type SeedProductOption = {
	label: string;
	uiType: "color" | "pill" | "select";
	values: string[];
};

export type SeedReviewContent = {
	rating: number;
	title: string;
	content: string;
	date: Date;
};

export type SeedReview = SeedReviewContent & {
	author: string;
	initials: string;
	reviewerEmail: string;
};

export type SeedProduct = {
	name: string;
	tag: string;
	price: number;
	discountPercentage?: number;
	rating: number;
	reviewsCount: number;
	isNew: boolean;
	inStock: boolean;
	stockQuantity: number;
	description: string;
	specs: Record<string, string>;
	categorySlug: string;
	images: ImageDef[];
	options: SeedProductOption[];
	reviews: SeedReview[];
};

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function buildSpecs(product: DummyJsonProduct): Record<string, string> {
	const specs: Record<string, string> = {};

	if (product.brand) specs.Marca = product.brand;
	if (product.sku) specs.SKU = product.sku;
	if (product.weight !== undefined) specs.Peso = `${product.weight}g`;
	if (product.dimensions) {
		const { width, height, depth } = product.dimensions;
		specs.Dimensões = `${width} x ${height} x ${depth} cm`;
	}
	if (product.warrantyInformation) specs.Garantia = product.warrantyInformation;
	if (product.shippingInformation) specs.Envio = product.shippingInformation;
	if (product.availabilityStatus) specs.Disponibilidade = product.availabilityStatus;

	return specs;
}

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
	}
	return name.slice(0, 2).toUpperCase();
}

function mapReviewContent(review: DummyJsonReview): SeedReviewContent {
	const content = review.comment.trim();
	return {
		rating: Math.min(5, Math.max(1, Math.round(review.rating))),
		title: content.length <= 72 ? content : `${content.slice(0, 69)}...`,
		content,
		date: new Date(review.date),
	};
}

function computeProductRating(reviews: SeedReviewContent[]): number {
	if (reviews.length === 0) return 0;
	const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
	return Math.round((sum / reviews.length) * 100) / 100;
}

function mapDummyJsonProduct(product: DummyJsonProduct): Omit<SeedProduct, "reviews"> & { reviewContents: SeedReviewContent[] } {
	const tag = `${slugify(product.title)}-${product.id}`;
	const reviewContents = (product.reviews ?? []).map(mapReviewContent);
	const reviewsCount = reviewContents.length;
	const rating = computeProductRating(reviewContents);

	return {
		name: product.title,
		tag,
		price: product.price,
		discountPercentage: product.discountPercentage,
		rating,
		reviewsCount,
		isNew: rating >= 4.5 && reviewsCount >= 2,
		inStock: product.stock > 0,
		stockQuantity: product.stock,
		description: product.description,
		specs: buildSpecs(product),
		categorySlug: product.category,
		images: product.images.map((url, position) => ({ url, position })),
		options: product.options ?? [],
		reviewContents,
	};
}

export function assignReviewAuthors(
	products: Array<Omit<SeedProduct, "reviews"> & { reviewContents: SeedReviewContent[] }>,
	users: SeedUser[],
): SeedProduct[] {
	if (users.length === 0) {
		throw new Error("users.json precisa ter ao menos um usuário para atribuir reviews");
	}

	let cursor = 0;

	return products.map((product) => {
		const usedEmails = new Set<string>();

		const reviews = product.reviewContents.map((content) => {
			let assignedUser: SeedUser | undefined;
			let attempts = 0;

			while (attempts < users.length) {
				const candidate = users[cursor % users.length];
				cursor += 1;
				attempts += 1;

				if (!usedEmails.has(candidate.email)) {
					assignedUser = candidate;
					usedEmails.add(candidate.email);
					break;
				}
			}

			if (!assignedUser) {
				throw new Error(
					`Usuários insuficientes em users.json para as reviews de "${product.name}" (precisa de ${product.reviewContents.length}, pool tem ${users.length})`,
				);
			}

			return {
				...content,
				author: assignedUser.name,
				initials: getInitials(assignedUser.name),
				reviewerEmail: assignedUser.email,
			};
		});

		const { reviewContents: _, ...data } = product;
		return { ...data, reviews };
	});
}

export function getCategoryLabel(slug: string): string {
	return CATEGORY_LABELS[slug] ?? slug;
}

export async function loadSeedProducts(users: SeedUser[]): Promise<SeedProduct[]> {
	const raw = (await Bun.file(PRODUCTS_PATH).json()) as DummyJsonProductsResponse;
	const products = raw.products.map(mapDummyJsonProduct);
	return assignReviewAuthors(products, users);
}

export function getCategorySlugs(products: SeedProduct[]): string[] {
	return [...new Set(products.map((p) => p.categorySlug))];
}
