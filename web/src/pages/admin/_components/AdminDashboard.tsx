import { useStore } from "@/lib/useStore";
import { AdminSidebar } from "./AdminSidebar";
import { activeTabStore, setActiveTab } from "./stores/uiStore";
import type { Tab } from "./types";
import { UsersTab } from "./tabs/UsersTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { CategoriesTab } from "./tabs/CategoriesTab";
import { ShippingTab } from "./tabs/ShippingTab";

export default function AdminDashboard() {
	const activeTab = useStore(activeTabStore);

	function switchTab(tab: Tab) {
		setActiveTab(tab);
	}

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			<AdminSidebar activeTab={activeTab} onTabChange={switchTab} />

			<div
				className="flex-grow w-full lg:w-3/4"
				role="tabpanel"
				id={`tabpanel-${activeTab}`}
				aria-labelledby={`tab-${activeTab}`}
			>
				{activeTab === "users" && <UsersTab />}
				{activeTab === "products" && <ProductsTab />}
				{activeTab === "orders" && <OrdersTab />}
				{activeTab === "categories" && <CategoriesTab />}
				{activeTab === "shipping" && <ShippingTab />}
			</div>
		</div>
	);
}
