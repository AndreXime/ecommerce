import { products } from "./products";
import type { ProductSummary, ProductDetails } from "./productsTypes";

export const getMostSelled = (count?: number): ProductSummary[] => {
	const offers = [...products].sort((a, b) => b.quantitySold - a.quantitySold);
	return count ? offers.slice(0, count) : offers;
};

export const getOffers = (count?: number): ProductSummary[] => {
	const offers = products.filter((p) => p.discountPercentage && p.discountPercentage > 0);
	return count ? offers.slice(0, count) : offers;
};

interface PaginationOptions {
	name: string | null;
	category: string | null;
	brand: string | null;
	minPrice: string | null;
	maxPrice: string | null;
	sort: string | null;
}

export const getPaginatedProducts = ({ name, category, brand, maxPrice, minPrice, sort }: PaginationOptions) => {
	const searchTerm = name?.toLowerCase().trim();
	const categoryTerm = category?.toLowerCase().trim();
	const brandTerm = brand?.toLowerCase().trim();
	const minPriceNumber = Number(minPrice) || null;
	const maxPriceNumber = Number(maxPrice) || null;

	let filteredProducts = products.filter((p) => {
		// Se o termo existe, ele DEVE bater. Se não existe (null/vazio), ignoramos o filtro (true).
		const matchesName = searchTerm ? p.name?.toLowerCase().includes(searchTerm) : true;
		const matchesCategory = categoryTerm ? p.category?.toLowerCase().includes(categoryTerm) : true;
		const matchesBrand = brandTerm ? p.tag?.toLowerCase().includes(brandTerm) : true;
		const matchesMinPrice = minPriceNumber ? p.price > minPriceNumber : true;
		const matchesMaxPrice = maxPriceNumber ? p.price < maxPriceNumber : true;

		return matchesName && matchesCategory && matchesBrand && matchesMinPrice && matchesMaxPrice;
	});

	if (sort) {
		filteredProducts.sort((a, b) => {
			if (sort === "asc") {
				return a.price - b.price; // Menor para o maior
			} else if (sort === "desc") {
				return b.price - a.price; // Maior para o menor
			}
			return 0;
		});
	}

	const brands = new Set(products.map((p) => p.tag));
	const avaibledBrands = Array.from(brands).map((label) => ({
		label,
		checked: label.toLowerCase().trim() === brandTerm,
	}));

	const categories = new Set(products.map((p) => p.category));
	const avaibledCategories = Array.from(categories).map((label) => ({
		label,
		checked: label.toLowerCase().trim() === categoryTerm,
	}));

	const prices = products.map((p) => p.price);
	const princeRange = {
		min: Math.floor(Math.min(...prices)),
		max: Math.ceil(Math.max(...prices)),
	};

	return {
		data: filteredProducts,
		options: {
			brands: avaibledBrands,
			categories: avaibledCategories,
			princeRange,
		},
		metadata: {
			totalProducts: products.length,
		},
	};
};

export const getProductById = (id: string): ProductDetails | undefined => {
	return products.find((p) => p.id === id);
};
