import { lookupCepCoordinate, type Coordinate } from "./cepDatabase";

export interface CarrierHub {
	hubLocation: Coordinate;
}

export interface ShippingMethodPricing {
	basePrice: number;
	pricePerKm: number;
	pricePerKg: number;
	daysBase: number;
	kmPerDay: number;
}

export interface FreightQuoteResult {
	cost: number;
	distanceKm: number;
	estimatedDays: number;
}

function calculateDistanceKm(from: Coordinate, to: Coordinate): number {
	const earthRadiusKm = 6371;
	const dLat = ((to.lat - from.lat) * Math.PI) / 180;
	const dLon = ((to.lng - from.lng) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c;
}

export function roundMoney(value: number): number {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function estimateDeliveryDays(distanceKm: number, method: Pick<ShippingMethodPricing, "daysBase" | "kmPerDay">): number {
	if (method.kmPerDay <= 0) return method.daysBase;
	const fromDistance = Math.floor(distanceKm / method.kmPerDay);
	return Math.max(method.daysBase, method.daysBase + fromDistance);
}

export async function quoteFreight(params: {
	cep: string;
	weightKg: number;
	carrier: CarrierHub;
	method: ShippingMethodPricing;
}): Promise<FreightQuoteResult | null> {
	const destination = await lookupCepCoordinate(params.cep);
	if (!destination) return null;

	const distanceKm = calculateDistanceKm(params.carrier.hubLocation, destination);
	const weightKg = Math.max(0, params.weightKg);

	const cost = roundMoney(
		params.method.basePrice + distanceKm * params.method.pricePerKm + weightKg * params.method.pricePerKg,
	);
	const estimatedDays = estimateDeliveryDays(distanceKm, params.method);

	return {
		cost,
		distanceKm: Number(distanceKm.toFixed(1)),
		estimatedDays,
	};
}
