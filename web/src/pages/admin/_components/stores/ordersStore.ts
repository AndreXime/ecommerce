import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Meta, Order } from "../types";

type OrdersState = {
	list: Order[];
	meta: Meta | null;
	page: number;
	loading: boolean;
};

export const ordersStore = map<OrdersState>({
	list: [],
	meta: null,
	page: 1,
	loading: true,
});

export function setOrdersPage(page: number) {
	ordersStore.setKey("page", page);
}

let inFlight: Promise<void> | null = null;
let inFlightKey = "";

export async function loadOrders() {
	const { page } = ordersStore.get();
	const key = String(page);

	if (inFlight && inFlightKey === key) return inFlight;

	inFlightKey = key;
	inFlight = (async () => {
		ordersStore.setKey("loading", true);

		try {
			const res = await request.get<{ data: Order[]; meta: Meta }>("/orders", {
				params: { page, limit: 10 },
			});

			if (inFlightKey !== key) return;

			if (res.ok) {
				ordersStore.set({
					...ordersStore.get(),
					list: res.data.data,
					meta: res.data.meta,
					loading: false,
				});
			} else {
				ordersStore.setKey("loading", false);
				toast.error(res.message);
			}
		} catch {
			if (inFlightKey === key) ordersStore.setKey("loading", false);
			toast.error("Erro ao carregar pedidos");
		} finally {
			if (inFlightKey === key) inFlight = null;
		}
	})();

	return inFlight;
}
