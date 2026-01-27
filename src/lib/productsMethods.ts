import { products } from "./products";
import type { ProductSummary, ProductDetails } from "./productsTypes";

export const getProductSummaries = (count?: number): ProductSummary[] => {
	const list = products.map(({ id, name, tag, price, discountPercentage, images, rating, reviewsCount, isNew }) => ({
		id,
		name,
		tag,
		price,
		discountPercentage,
		images,
		rating,
		reviewsCount,
		isNew,
	}));
	return count ? list.slice(0, count) : list;
};

export const getProductById = (id: string): ProductDetails | undefined => {
	return products.find((p) => p.id === id);
};

export const getOffers = (count?: number): ProductSummary[] => {
	const offers = getProductSummaries().filter((p) => p.discountPercentage && p.discountPercentage > 0);
	return count ? offers.slice(0, count) : offers;
};

export const calculateOldPrice = (price: number, discountPercentage?: number): number => {
	if (!discountPercentage) return price;
	return price / (1 - discountPercentage / 100);
};

export const formatPrice = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const getUniqueBrands = () => {
	const brands = new Set(products.map((p) => p.tag));
	return Array.from(brands).map((label) => ({ label, checked: false }));
};

export const getUniqueCategories = () => {
	const categories = new Set(
		products.map((p) => {
			// Pega a primeira parte do ID antes do primeiro hífen
			const prefix = p.id.split("-")[0];
			// Capitaliza a primeira letra
			return prefix.charAt(0).toUpperCase() + prefix.slice(1);
		}),
	);
	return Array.from(categories).map((label) => ({ label, checked: false }));
};

export const getPriceRange = () => {
	const prices = products.map((p) => p.price);
	return {
		min: Math.floor(Math.min(...prices)),
		max: Math.ceil(Math.max(...prices)),
	};
};
