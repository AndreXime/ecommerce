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
};

export const productsStore = map<ProductsState>({
	list: [],
	meta: null,
	page: 1,
	search: "",
	loading: true,
});

export function setProductsPage(page: number) {
	productsStore.setKey("page", page);
}

export function setProductsSearch(search: string) {
	productsStore.setKey("search", search);
}

let inFlight: Promise<void> | null = null;
let inFlightKey = "";

export async function loadProducts() {
	const { page, search } = productsStore.get();
	const key = `${page}\0${search}`;

	if (inFlight && inFlightKey === key) return inFlight;

	inFlightKey = key;
	inFlight = (async () => {
		productsStore.setKey("loading", true);

		try {
			const res = await request.get<{ data: Product[]; meta: Meta }>("/products", {
				params: { page, limit: 10, search: search || undefined },
			});

			if (inFlightKey !== key) return;

			if (res.ok) {
				productsStore.set({
					...productsStore.get(),
					list: res.data.data,
					meta: res.data.meta,
					loading: false,
				});
			} else {
				productsStore.setKey("loading", false);
				toast.error(res.message);
			}
		} catch {
			if (inFlightKey === key) productsStore.setKey("loading", false);
			toast.error("Erro ao carregar produtos");
		} finally {
			if (inFlightKey === key) inFlight = null;
		}
	})();

	return inFlight;
}
