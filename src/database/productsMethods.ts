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
	categories: string[];
	brands: string[];
	minPrice: string | null;
	maxPrice: string | null;
	sort: string | null;
}

export const getPaginatedProducts = ({ name, categories, brands, maxPrice, minPrice, sort }: PaginationOptions) => {
	const searchTerm = name?.toLowerCase().trim();
	const categoryTerms = categories.map((c) => c.toLowerCase().trim());
	const brandTerms = brands.map((b) => b.toLowerCase().trim());
	const minPriceNumber = Number(minPrice) || null;
	const maxPriceNumber = Number(maxPrice) || null;

	let filteredProducts = products.filter((p) => {
		// Se o termo existe, ele DEVE bater. Se não existe (null/vazio), ignoramos o filtro (true).
		const matchesName = searchTerm ? p.name?.toLowerCase().includes(searchTerm) : true;
		const matchesCategory = categoryTerms.length > 0 ? categoryTerms.includes(p.category?.toLowerCase()) : true;

		const matchesBrand = brandTerms.length > 0 ? brandTerms.includes(p.tag?.toLowerCase()) : true;
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

	const brandsSet = new Set(products.map((p) => p.tag));
	const avaibledBrands = Array.from(brandsSet).map((label) => ({
		label,
		checked: brandTerms.includes(label.toLowerCase()),
	}));

	const categoriesSet = new Set(products.map((p) => p.category));
	const avaibledCategories = Array.from(categoriesSet).map((label) => ({
		label,
		checked: categoryTerms.includes(label.toLowerCase()),
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
