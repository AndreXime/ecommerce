import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Meta, Order } from "../types";

type OrdersState = {
	list: Order[];
	meta: Meta | null;
	page: number;
	loading: boolean;
	loadedOnce: boolean;
};

export const ordersStore = map<OrdersState>({
	list: [],
	meta: null,
	page: 1,
	loading: false,
	loadedOnce: false,
});

export function setOrdersPage(page: number) {
	ordersStore.setKey("page", page);
}

export async function loadOrders(options?: { force?: boolean }) {
	const state = ordersStore.get();
	if (!options?.force && state.loadedOnce) return;

	ordersStore.setKey("loading", true);

	const res = await request.get<{ data: Order[]; meta: Meta }>("/orders", {
		params: { page: state.page, limit: 10 },
	});

	if (res.ok) {
		ordersStore.set({
			...state,
			list: res.data.data,
			meta: res.data.meta,
			loading: false,
			loadedOnce: true,
		});
	} else {
		ordersStore.setKey("loading", false);
		toast.error(res.message);
	}
}

