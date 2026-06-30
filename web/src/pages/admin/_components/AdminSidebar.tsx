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
		<aside className="w-full lg:w-56 shrink-0">
			<div className="app-panel p-5 mb-4 flex items-center gap-3">
				<div className="w-12 h-12 rounded-full bg-accent text-accent-ink flex items-center justify-center shrink-0">
					<LayoutDashboard class="w-6 h-6" aria-hidden="true" />
				</div>
				<div>
					<h2 className="font-display font-semibold text-ink">Painel admin</h2>
					<p className="text-xs text-muted">Gerenciamento geral</p>
				</div>
			</div>

			<div className="app-panel overflow-hidden" role="tablist" aria-label="Seções do painel">
				{TABS.map((tab) => (
					<button
						key={tab.id}
						role="tab"
						aria-selected={activeTab === tab.id}
						aria-controls={`tabpanel-${tab.id}`}
						id={`tab-${tab.id}`}
						onClick={() => onTabChange(tab.id)}
						className={`w-full text-left px-5 py-3.5 flex items-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
							activeTab === tab.id ? "tab-active" : "tab-inactive"
						}`}
					>
						<tab.icon class="w-4 h-4 mr-3 shrink-0" aria-hidden="true" /> {tab.label}
					</button>
				))}

				<div className="h-px bg-rule mx-0" role="separator" />

				<a href="/" className="w-full text-left px-5 py-3.5 flex items-center text-sm font-medium text-danger hover:bg-danger-soft transition-colors">
					<LogOut class="w-4 h-4 mr-3" aria-hidden="true" /> Voltar ao site
				</a>
			</div>
		</aside>
	);
}
