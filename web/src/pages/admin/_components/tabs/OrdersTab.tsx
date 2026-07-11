import { useEffect } from "preact/hooks";
import { useStore } from "@/lib/useStore";
import { RefreshCw } from "lucide-preact";
import { Pagination } from "../Pagination";
import { formatPrice } from "@/lib/utils";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import type { Order } from "../types";
import { ordersStore, loadOrders, setOrdersPage } from "../stores/ordersStore";

const STATUS_STYLES: Record<Order["status"], string> = {
	pending: "bg-yellow-100 text-yellow-800",
	delivered: "bg-green-100 text-green-800",
	intransit: "bg-blue-100 text-blue-800",
	cancelled: "bg-red-100 text-red-800",
};

const STATUS_OPTIONS: Record<Order["status"], string> = {
	pending: "Pendente",
	intransit: "Em Trânsito",
	delivered: "Entregue",
	cancelled: "Cancelado",
};

export function OrdersTab() {
	const state = useStore(ordersStore);
	const { list, meta, page, loading } = state;

	useEffect(() => {
		void loadOrders();
	}, [page]);

	async function updateOrderStatus(orderId: string, status: Order["status"]) {
		const res = await request.patch(`/orders/${orderId}/status`, { status });
		if (res.ok) {
			toast.success("Status atualizado");
			loadOrders();
		} else {
			toast.error(res.message);
		}
	}

	return (
		<div className="animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-ink">Pedidos</h1>
				<button
					type="button"
					onClick={() => loadOrders()}
					className="inline-flex items-center gap-2 text-sm text-accent hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-accent-soft transition"
				>
					<RefreshCw class="w-4 h-4" /> Atualizar
				</button>
			</div>

			<div className="app-panel rounded-xl border border-rule shadow-sm overflow-hidden">
				{loading ? (
					<div className="p-12 text-center text-muted">Carregando...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-paper-2 border-b border-rule">
								<tr>
									<th className="text-left px-4 py-3 font-semibold text-muted">ID</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Data</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Subtotal</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Frete</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Total</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Entrega</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Itens</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.map((order) => (
									<tr key={order.id} className="hover:bg-paper-2 transition">
										<td className="px-4 py-3 font-mono text-xs text-muted">{order.id.slice(0, 8)}…</td>
										<td className="px-4 py-3 text-muted">
											{new Date(order.date).toLocaleDateString("pt-BR")}
										</td>
										<td className="px-4 py-3 text-muted">{formatPrice(order.subtotal)}</td>
										<td className="px-4 py-3 text-muted">
											{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Grátis"}
										</td>
										<td className="px-4 py-3 font-medium text-ink">{formatPrice(order.total)}</td>
										<td className="px-4 py-3 text-muted text-xs">
											{order.shipment ? (
												<div>
													<div className="font-medium text-ink-2">
														{order.shipment.carrierName} - {order.shipment.methodName}
													</div>
													<div>CEP {order.shipment.destinationCep}</div>
												</div>
											) : (
												"—"
											)}
										</td>
										<td className="px-4 py-3 text-muted">
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
												{(Object.keys(STATUS_OPTIONS) as Order["status"][]).map((status) => (
													<option key={status} value={status}>
														{STATUS_OPTIONS[status]}
													</option>
												))}
											</select>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={8} className="px-4 py-12 text-center text-muted">
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

