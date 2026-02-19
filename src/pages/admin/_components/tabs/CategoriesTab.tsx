import { useEffect, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { RefreshCw } from "lucide-preact";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import type { Category } from "../types";
import { categoriesStore, loadCategories } from "../stores/categoriesStore";

const inputClass =
	"flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent";

export function CategoriesTab() {
	const state = useStore(categoriesStore);
	const { list, loading } = state;

	const [newCategoryName, setNewCategoryName] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		loadCategories();
	}, []);

	async function createCategory(e: Event) {
		e.preventDefault();
		if (!newCategoryName.trim()) return;
		setSaving(true);
		const res = await request.post<Category>("/categories", { name: newCategoryName.trim() });
		if (res.ok) {
			toast.success("Categoria criada");
			setNewCategoryName("");
			loadCategories({ force: true });
		} else {
			toast.error(res.message);
		}
		setSaving(false);
	}

	return (
		<div className="animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
				<button
					type="button"
					onClick={() => loadCategories({ force: true })}
					className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
				>
					<RefreshCw class="w-4 h-4" /> Atualizar
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
					<h2 className="text-base font-semibold text-gray-900 mb-4">Nova categoria</h2>
					<form onSubmit={createCategory} className="flex gap-3">
						<input
							type="text"
							placeholder="Nome da categoria"
							value={newCategoryName}
							onInput={(e) => setNewCategoryName((e.target as HTMLInputElement).value)}
							required
							minLength={2}
							className={inputClass}
						/>
						<button
							type="submit"
							disabled={saving}
							className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg transition text-sm"
						>
							{saving ? "…" : "Criar"}
						</button>
					</form>
				</div>

				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
					<h2 className="text-base font-semibold text-gray-900 mb-4">
						Categorias cadastradas ({list.length})
					</h2>
					{loading ? (
						<p className="text-sm text-gray-400">Carregando...</p>
					) : list.length === 0 ? (
						<p className="text-sm text-gray-400">Nenhuma categoria ainda</p>
					) : (
						<div className="flex flex-wrap gap-2">
							{list.map((cat) => (
								<span
									key={cat.id}
									className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
								>
									{cat.name}
								</span>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

