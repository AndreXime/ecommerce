import { useEffect } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { RefreshCw } from "lucide-preact";
import { Pagination } from "../Pagination";
import { formatPrice } from "@/lib/utils";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Order } from "../types";
import { ordersStore, loadOrders, setOrdersPage } from "../stores/ordersStore";

const STATUS_STYLES: Record<Order["status"], string> = {
	delivered: "bg-green-100 text-green-800",
	intransit: "bg-blue-100 text-blue-800",
	cancelled: "bg-red-100 text-red-800",
};

export function OrdersTab() {
	const state = useStore(ordersStore);
	const { list, meta, page, loading } = state;

	useEffect(() => {
		const timer = setTimeout(() => loadOrders(), 0);
		return () => clearTimeout(timer);
	}, [page]);

	async function updateOrderStatus(orderId: string, status: Order["status"]) {
		const res = await request.patch(`/orders/${orderId}/status`, { status });
		if (res.ok) {
			toast.success("Status atualizado");
			loadOrders({ force: true });
		} else {
			toast.error(res.message);
		}
	}

	return (
		<div className="animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
				<button
					type="button"
					onClick={() => loadOrders({ force: true })}
					className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
				>
					<RefreshCw class="w-4 h-4" /> Atualizar
				</button>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-gray-400">Carregando...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Data</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Total</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Itens</th>
									<th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.map((order) => (
									<tr key={order.id} className="hover:bg-gray-50 transition">
										<td className="px-4 py-3 font-mono text-xs text-gray-400">{order.id.slice(0, 8)}…</td>
										<td className="px-4 py-3 text-gray-600">
											{new Date(order.date).toLocaleDateString("pt-BR")}
										</td>
										<td className="px-4 py-3 font-medium text-gray-900">{formatPrice(order.total)}</td>
										<td className="px-4 py-3 text-gray-600">
											{order.items.length} {order.items.length === 1 ? "item" : "itens"}
										</td>
										<td className="px-4 py-3">
											<select
												value={order.status}
												onChange={(e) =>
													updateOrderStatus(
														order.id,
														(e.target as HTMLSelectElement).value as Order["status"],
													)
												}
												className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_STYLES[order.status]}`}
											>
												<option value="intransit">Em Trânsito</option>
												<option value="delivered">Entregue</option>
												<option value="cancelled">Cancelado</option>
											</select>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={5} className="px-4 py-12 text-center text-gray-400">
											Nenhum pedido encontrado
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{meta && (
					<div className="px-4 pb-4">
						<Pagination meta={meta} page={page} onChange={setOrdersPage} />
					</div>
				)}
			</div>
		</div>
	);
}

