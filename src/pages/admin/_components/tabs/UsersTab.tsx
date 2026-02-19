import { useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { Pencil, RefreshCw, Search, X } from "lucide-preact";
import { Pagination } from "../Pagination";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import type { AdminUser } from "../types";
import { usersStore, loadUsers, setUsersPage, setUsersSearch } from "../stores/usersStore";

const ROLE_LABELS = { ADMIN: "Admin", CUSTOMER: "Cliente", SUPPORT: "Suporte" } as const;
const ROLE_STYLES = {
	ADMIN: "bg-purple-100 text-purple-700",
	CUSTOMER: "bg-blue-100 text-blue-700",
	SUPPORT: "bg-green-100 text-green-700",
} as const;

const searchInputClass =
	"w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";
const inputClass =
	"w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

export function UsersTab() {
	const usersState = useStore(usersStore);
	const { list, meta, page, search, loading } = usersState;

	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [editUserName, setEditUserName] = useState("");
	const [editUserSaving, setEditUserSaving] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => loadUsers(), 300);
		return () => clearTimeout(timer);
	}, [page, search]);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") setEditingUser(null);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const hasModal = !!editingUser;
	useEffect(() => {
		document.body.style.overflow = hasModal ? "hidden" : "auto";
	}, [hasModal]);

	function openEditUser(user: AdminUser) {
		setEditingUser(user);
		setEditUserName(user.name);
	}

	async function saveUser() {
		if (!editingUser) return;
		setEditUserSaving(true);
		const res = await request.put<AdminUser>("/users", { id: editingUser.id, name: editUserName });
		if (res.ok) {
			toast.success("Usuário atualizado");
			setEditingUser(null);
			loadUsers({ force: true });
		} else {
			toast.error(res.message);
		}
		setEditUserSaving(false);
	}

	return (
		<div className="animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
				<button
					type="button"
					onClick={() => loadUsers({ force: true })}
					className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
				>
					<RefreshCw class="w-4 h-4" /> Atualizar
				</button>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="p-4 border-b border-gray-100">
					<div className="relative">
						<Search class="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Buscar por nome ou email..."
							value={search}
							onInput={(e) => {
								setUsersSearch((e.target as HTMLInputElement).value);
								setUsersPage(1);
							}}
							className={searchInputClass}
						/>
					</div>
				</div>

				{loading ? (
					<div className="p-12 text-center text-gray-400">Carregando...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Nome</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Perfil</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Cadastro</th>
									<th className="px-4 py-3 w-10"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.map((user) => (
									<tr key={user.id} className="hover:bg-gray-50 transition">
										<td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
										<td className="px-4 py-3 text-gray-600">{user.email}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
													ROLE_STYLES[user.role]
												}`}
											>
												{ROLE_LABELS[user.role]}
											</span>
										</td>
										<td className="px-4 py-3 text-gray-500">
											{new Date(user.createdAt).toLocaleDateString("pt-BR")}
										</td>
										<td className="px-4 py-3 text-right">
											<button
												onClick={() => openEditUser(user)}
												className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50 transition"
												title="Editar"
											>
												<Pencil class="w-4 h-4" />
											</button>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={5} className="px-4 py-12 text-center text-gray-400">
											Nenhum usuário encontrado
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{meta && (
					<div className="px-4 pb-4">
						<Pagination meta={meta} page={page} onChange={setUsersPage} />
					</div>
				)}
			</div>

			{editingUser && (
				<div
					id="user-modal-overlay"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-overlay"
					onClick={(e) => {
						if ((e.target as HTMLElement).id === "user-modal-overlay") setEditingUser(null);
					}}
				>
					<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl m-4 animate-scale-in">
						<div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
							<h3 className="text-lg font-bold text-gray-900">Editar Usuário</h3>
							<button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 transition">
								<X class="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label htmlFor="edit-user-name" className="block text-sm font-medium text-gray-700 mb-1">
									Nome
								</label>
								<input
									id="edit-user-name"
									type="text"
									value={editUserName}
									onInput={(e) => setEditUserName((e.target as HTMLInputElement).value)}
									className={inputClass}
									minLength={3}
								/>
							</div>
							<div>
								<label htmlFor="edit-user-email" className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input
									id="edit-user-email"
									type="email"
									value={editingUser.email}
									readOnly
									className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-default"
								/>
							</div>
							<div>
								<p className="text-sm font-medium text-gray-700 mb-1">Perfil</p>
								<span
									className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${ROLE_STYLES[editingUser.role]}`}
								>
									{ROLE_LABELS[editingUser.role]}
								</span>
							</div>
						</div>
						<div className="flex gap-3 px-6 pb-6">
							<button
								onClick={() => setEditingUser(null)}
								className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition"
							>
								Cancelar
							</button>
							<button
								onClick={saveUser}
								disabled={editUserSaving || editUserName.trim().length < 3}
								className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition"
							>
								{editUserSaving ? "Salvando…" : "Salvar"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

