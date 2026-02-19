import { useStore } from "@nanostores/preact";
import { AdminSidebar } from "./AdminSidebar";
import { activeTabStore } from "./stores/uiStore";
import type { Tab } from "./types";
import { setActiveTab } from "./stores/uiStore";
import { setUsersPage, setUsersSearch } from "./stores/usersStore";
import { setProductsPage, setProductsSearch } from "./stores/productsStore";
import { setOrdersPage } from "./stores/ordersStore";
import { UsersTab } from "./tabs/UsersTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { CategoriesTab } from "./tabs/CategoriesTab";

export default function AdminDashboard() {
	const activeTab = useStore(activeTabStore);

	function switchTab(tab: Tab) {
		setActiveTab(tab);
		if (tab === "users") {
			setUsersPage(1);
			setUsersSearch("");
		}
		if (tab === "products") {
			setProductsPage(1);
			setProductsSearch("");
		}
		if (tab === "orders") setOrdersPage(1);
	}

	return (
		<div className="flex flex-col md:flex-row gap-8">
			<AdminSidebar activeTab={activeTab} onTabChange={switchTab} />

			<div
				className="flex-grow w-full md:w-3/4"
				role="tabpanel"
				id={`tabpanel-${activeTab}`}
				aria-labelledby={`tab-${activeTab}`}
			>
				{activeTab === "users" && <UsersTab />}
				{activeTab === "products" && <ProductsTab />}
				{activeTab === "orders" && <OrdersTab />}
				{activeTab === "categories" && <CategoriesTab />}
			</div>
		</div>
	);
}

