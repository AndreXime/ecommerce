import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Meta, Product } from "../types";

type ProductsState = {
	list: Product[];
	meta: Meta | null;
	page: number;
	search: string;
	loading: boolean;
	loadedOnce: boolean;
};

export const productsStore = map<ProductsState>({
	list: [],
	meta: null,
	page: 1,
	search: "",
	loading: false,
	loadedOnce: false,
});

export function setProductsPage(page: number) {
	productsStore.setKey("page", page);
}

export function setProductsSearch(search: string) {
	productsStore.setKey("search", search);
}

export async function loadProducts(options?: { force?: boolean }) {
	const state = productsStore.get();
	if (!options?.force && state.loadedOnce) return;

	productsStore.setKey("loading", true);

	const res = await request.get<{ data: Product[]; meta: Meta }>("/products", {
		params: { page: state.page, limit: 10, search: state.search || undefined },
	});

	if (res.ok) {
		productsStore.set({
			...state,
			list: res.data.data,
			meta: res.data.meta,
			loading: false,
			loadedOnce: true,
		});
	} else {
		productsStore.setKey("loading", false);
		toast.error(res.message);
	}
}

