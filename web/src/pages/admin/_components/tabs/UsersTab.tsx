import { useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { Pencil, RefreshCw, Search, X } from "lucide-preact";
import { Pagination } from "../Pagination";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import type { AdminUser } from "../types";
import { usersStore, loadUsers, setUsersPage, setUsersSearch } from "../stores/usersStore";

import { inputClass, searchInputClass } from "@/lib/uiClasses";

const ROLE_LABELS = { ADMIN: "Admin", CUSTOMER: "Cliente", SUPPORT: "Suporte" } as const;
const ROLE_STYLES = {
	ADMIN: "bg-accent-soft text-accent",
	CUSTOMER: "bg-paper-3 text-ink-2",
	SUPPORT: "bg-success-soft text-success",
} as const;

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
				<h1 className="text-2xl font-bold text-ink">Usuários</h1>
				<button
					type="button"
					onClick={() => loadUsers({ force: true })}
					className="inline-flex items-center gap-2 text-sm text-accent hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-accent-soft transition"
				>
					<RefreshCw class="w-4 h-4" /> Atualizar
				</button>
			</div>

			<div className="app-panel rounded-xl border border-rule shadow-sm overflow-hidden">
				<div className="p-4 border-b border-rule">
					<div className="relative">
						<Search class="absolute left-3 top-2.5 w-4 h-4 text-muted" />
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
					<div className="p-12 text-center text-muted">Carregando...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-paper-2 border-b border-rule">
								<tr>
									<th className="text-left px-4 py-3 font-semibold text-muted">Nome</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Email</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Perfil</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Cadastro</th>
									<th className="px-4 py-3 w-10"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.map((user) => (
									<tr key={user.id} className="hover:bg-paper-2 transition">
										<td className="px-4 py-3 font-medium text-ink">{user.name}</td>
										<td className="px-4 py-3 text-muted">{user.email}</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
													ROLE_STYLES[user.role]
												}`}
											>
												{ROLE_LABELS[user.role]}
											</span>
										</td>
										<td className="px-4 py-3 text-muted">
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
										<td colSpan={5} className="px-4 py-12 text-center text-muted">
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
					<div className="app-panel w-full max-w-md rounded-2xl shadow-2xl m-4 animate-scale-in">
						<div className="flex justify-between items-center px-6 py-4 border-b border-rule">
							<h3 className="text-lg font-bold text-ink">Editar Usuário</h3>
							<button onClick={() => setEditingUser(null)} className="text-muted hover:text-muted transition">
								<X class="w-5 h-5" />
							</button>
						</div>
						<div className="p-6 space-y-4">
							<div>
								<label htmlFor="edit-user-name" className="block text-sm font-medium text-ink-2 mb-1">
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
								<label htmlFor="edit-user-email" className="block text-sm font-medium text-ink-2 mb-1">
									Email
								</label>
								<input
									id="edit-user-email"
									type="email"
									value={editingUser.email}
									readOnly
									className="w-full border border-rule rounded-lg px-3 py-2 text-sm bg-paper-2 text-muted cursor-default"
								/>
							</div>
							<div>
								<p className="text-sm font-medium text-ink-2 mb-1">Perfil</p>
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
								className="flex-1 border border-rule text-ink-2 font-semibold py-2.5 rounded-lg hover:bg-paper-2 transition"
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

