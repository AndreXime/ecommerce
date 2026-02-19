import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Category } from "../types";

type CategoriesState = {
	list: Category[];
	loading: boolean;
	loadedOnce: boolean;
};

export const categoriesStore = map<CategoriesState>({
	list: [],
	loading: false,
	loadedOnce: false,
});

export async function loadCategories(options?: { force?: boolean }) {
	const state = categoriesStore.get();
	if (!options?.force && state.loadedOnce) return;

	categoriesStore.setKey("loading", true);

	const res = await request.get<Category[]>("/categories");

	if (res.ok) {
		categoriesStore.set({
			list: res.data,
			loading: false,
			loadedOnce: true,
		});
	} else {
		categoriesStore.setKey("loading", false);
		toast.error(res.message);
	}
}

