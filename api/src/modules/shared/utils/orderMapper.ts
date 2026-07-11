import type { Order, OrderItem, Shipment } from "@/database/client/client";
import type { OrderStatusValue } from "@/modules/orders/shared/status";

type OrderWithItems = Order & {
	items: OrderItem[];
	shipment?: Shipment | null;
};

export function toOrder(order: OrderWithItems) {
	return {
		id: order.id,
		date: order.createdAt.toISOString(),
		subtotal: Number(order.subtotal),
		shippingCost: Number(order.shippingCost),
		total: Number(order.total),
		status: order.status as OrderStatusValue,
		items: order.items.map((item) => ({
			id: item.id,
			name: item.name,
			variant: item.variant,
			img: item.img,
			quantity: item.quantity,
			price: Number(item.unitPrice),
			unitPrice: Number(item.unitPrice),
			discountPercentage: item.discountPercentage !== null ? Number(item.discountPercentage) : null,
			subtotal: Number(item.subtotal),
		})),
		shipment: order.shipment
			? {
					id: order.shipment.id,
					carrierName: order.shipment.carrierName,
					methodName: order.shipment.methodName,
					methodCode: order.shipment.methodCode,
					cost: Number(order.shipment.cost),
					estimatedDays: order.shipment.estimatedDays,
					destinationCep: order.shipment.destinationCep,
					distanceKm: order.shipment.distanceKm !== null ? Number(order.shipment.distanceKm) : null,
					status: order.shipment.status,
				}
			: null,
	};
}
