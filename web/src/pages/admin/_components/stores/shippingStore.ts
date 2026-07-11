import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Carrier } from "../types";

type ShippingState = {
	list: Carrier[];
	loading: boolean;
	loadedOnce: boolean;
};

export const shippingStore = map<ShippingState>({
	list: [],
	loading: false,
	loadedOnce: false,
});

export async function loadCarriers(options?: { force?: boolean }) {
	const state = shippingStore.get();
	if (!options?.force && state.loadedOnce) return;

	shippingStore.setKey("loading", true);

	const res = await request.get<Carrier[]>("/shipping/carriers", {
		params: { includeInactive: "true" },
	});

	if (res.ok) {
		shippingStore.set({
			list: res.data,
			loading: false,
			loadedOnce: true,
		});
	} else {
		shippingStore.setKey("loading", false);
		toast.error(res.message);
	}
}
