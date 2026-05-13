import { LayoutDashboard, LogOut, Users, Package, ShoppingBag, Tag } from "lucide-preact";
import type { Tab } from "./types";

interface TabConfig {
	id: Tab;
	label: string;
	icon: typeof Users;
}

const TABS: TabConfig[] = [
	{ id: "users", label: "Usuários", icon: Users },
	{ id: "products", label: "Produtos", icon: Package },
	{ id: "orders", label: "Pedidos", icon: ShoppingBag },
	{ id: "categories", label: "Categorias", icon: Tag },
];

interface AdminSidebarProps {
	activeTab: Tab;
	onTabChange: (tab: Tab) => void;
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
	return (
		<aside className="w-full md:w-1/4 flex-shrink-0">
			<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center gap-4">
				<div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
					<LayoutDashboard class="w-7 h-7" />
				</div>
				<div>
					<h2 className="font-bold text-gray-900">Painel Admin</h2>
					<p className="text-xs text-gray-500">Gerenciamento geral</p>
				</div>
			</div>

			<div
				className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
				role="tablist"
				aria-label="Seções do painel"
			>
				{TABS.map((tab) => (
					<button
						key={tab.id}
						role="tab"
						aria-selected={activeTab === tab.id}
						aria-controls={`tabpanel-${tab.id}`}
						id={`tab-${tab.id}`}
						onClick={() => onTabChange(tab.id)}
						className={`w-full text-left px-6 py-4 flex items-center transition border-l-4 ${
							activeTab === tab.id
								? "bg-blue-50 text-blue-600 border-blue-600 font-medium"
								: "hover:bg-gray-50 text-gray-700 border-transparent"
						}`}
					>
						<tab.icon class="w-5 h-5 mr-3" aria-hidden="true" /> {tab.label}
					</button>
				))}

				<div className="h-px bg-gray-100 my-1" />

				<a
					href="/"
					className="w-full text-left px-6 py-4 flex items-center text-red-500 hover:bg-red-50 transition"
				>
					<LogOut class="w-5 h-5 mr-3" aria-hidden="true" /> Voltar ao site
				</a>
			</div>
		</aside>
	);
}

