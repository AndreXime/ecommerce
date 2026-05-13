import { map } from "nanostores";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { AdminUser, Meta } from "../types";

type UsersState = {
	list: AdminUser[];
	meta: Meta | null;
	page: number;
	search: string;
	loading: boolean;
	loadedOnce: boolean;
};

export const usersStore = map<UsersState>({
	list: [],
	meta: null,
	page: 1,
	search: "",
	loading: false,
	loadedOnce: false,
});

export function setUsersPage(page: number) {
	usersStore.setKey("page", page);
}

export function setUsersSearch(search: string) {
	usersStore.setKey("search", search);
}

export async function loadUsers(options?: { force?: boolean }) {
	const state = usersStore.get();
	if (!options?.force && state.loadedOnce) return;

	usersStore.setKey("loading", true);

	const res = await request.get<{ data: AdminUser[]; meta: Meta }>("/users", {
		params: { page: state.page, limit: 10, search: state.search || undefined },
	});

	if (res.ok) {
		usersStore.set({
			...state,
			list: res.data.data,
			meta: res.data.meta,
			loading: false,
			loadedOnce: true,
		});
	} else {
		usersStore.setKey("loading", false);
		toast.error(res.message);
	}
}

