import { join } from "node:path";
import type { ImageDef } from "./seedProductsImages";

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

interface DummyJsonProduct {
	id: number;
	title: string;
	description: string;
	category: string;
	price: number;
	discountPercentage?: number;
	rating: number;
	stock: number;
	brand?: string;
	sku?: string;
	weight?: number;
	dimensions?: DummyJsonDimensions;
	warrantyInformation?: string;
	shippingInformation?: string;
	availabilityStatus?: string;
	reviews?: unknown[];
	images: string[];
}

interface DummyJsonProductsResponse {
	products: DummyJsonProduct[];
}

export type SeedProductOption = {
	label: string;
	uiType: "color" | "pill" | "select";
	values: string[];
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

function mapDummyJsonProduct(product: DummyJsonProduct): SeedProduct {
	const tag = `${slugify(product.title)}-${product.id}`;
	const reviewsCount = product.reviews?.length ?? 0;

	return {
		name: product.title,
		tag,
		price: product.price,
		discountPercentage: product.discountPercentage,
		rating: product.rating,
		reviewsCount,
		isNew: product.rating >= 4.5 && reviewsCount >= 2,
		inStock: product.stock > 0,
		stockQuantity: product.stock,
		description: product.description,
		specs: buildSpecs(product),
		categorySlug: product.category,
		images: product.images.map((url, position) => ({ url, position })),
		options: [],
	};
}

export function getCategoryLabel(slug: string): string {
	return CATEGORY_LABELS[slug] ?? slug;
}

export async function loadSeedProducts(): Promise<SeedProduct[]> {
	const raw = (await Bun.file(PRODUCTS_PATH).json()) as DummyJsonProductsResponse;
	return raw.products.map(mapDummyJsonProduct);
}

export function getCategorySlugs(products: SeedProduct[]): string[] {
	return [...new Set(products.map((p) => p.categorySlug))];
}
