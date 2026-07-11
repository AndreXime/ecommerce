import type { Carrier, ShippingMethod } from "@/database/client/client";

type CarrierWithMethods = Carrier & { methods?: ShippingMethod[] };

export function toShippingMethod(method: ShippingMethod) {
	return {
		id: method.id,
		name: method.name,
		code: method.code,
		basePrice: Number(method.basePrice),
		pricePerKm: Number(method.pricePerKm),
		pricePerKg: Number(method.pricePerKg),
		daysBase: method.daysBase,
		kmPerDay: method.kmPerDay,
		active: method.active,
		carrierId: method.carrierId,
	};
}

export function toCarrier(carrier: CarrierWithMethods) {
	return {
		id: carrier.id,
		name: carrier.name,
		slug: carrier.slug,
		active: carrier.active,
		hubLat: Number(carrier.hubLat),
		hubLng: Number(carrier.hubLng),
		...(carrier.methods
			? { methods: carrier.methods.map(toShippingMethod) }
			: {}),
	};
}
