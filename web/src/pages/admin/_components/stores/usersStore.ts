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
};

export const usersStore = map<UsersState>({
	list: [],
	meta: null,
	page: 1,
	search: "",
	loading: true,
});

export function setUsersPage(page: number) {
	usersStore.setKey("page", page);
}

export function setUsersSearch(search: string) {
	usersStore.setKey("search", search);
}

let inFlight: Promise<void> | null = null;
let inFlightKey = "";

export async function loadUsers() {
	const { page, search } = usersStore.get();
	const key = `${page}\0${search}`;

	if (inFlight && inFlightKey === key) return inFlight;

	inFlightKey = key;
	inFlight = (async () => {
		usersStore.setKey("loading", true);

		try {
			const res = await request.get<{ data: AdminUser[]; meta: Meta }>("/users", {
				params: { page, limit: 10, search: search || undefined },
			});

			if (inFlightKey !== key) return;

			if (res.ok) {
				usersStore.set({
					...usersStore.get(),
					list: res.data.data,
					meta: res.data.meta,
					loading: false,
				});
			} else {
				usersStore.setKey("loading", false);
				toast.error(res.message);
			}
		} catch {
			if (inFlightKey === key) usersStore.setKey("loading", false);
			toast.error("Erro ao carregar usuários");
		} finally {
			if (inFlightKey === key) inFlight = null;
		}
	})();

	return inFlight;
}
