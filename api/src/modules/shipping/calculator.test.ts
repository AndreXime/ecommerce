import { describe, expect, test } from "bun:test";
import { estimateDeliveryDays, quoteFreight, roundMoney } from "./calculator";

const spHub = { hubLocation: { lat: -23.55, lng: -46.633 } };

describe("shipping calculator", () => {
	test("estima dias com base + distância", () => {
		expect(estimateDeliveryDays(3, { daysBase: 4, kmPerDay: 230 })).toBe(4);
		expect(estimateDeliveryDays(2307, { daysBase: 4, kmPerDay: 230 })).toBe(14);
		expect(estimateDeliveryDays(2307, { daysBase: 2, kmPerDay: 580 })).toBe(5);
	});

	test("arredonda dinheiro em 2 casas", () => {
		expect(roundMoney(10.126)).toBe(10.13);
	});

	test("cota frete para CEP conhecido em SP", async () => {
		const result = await quoteFreight({
			cep: "01310-100",
			weightKg: 1,
			carrier: spHub,
			method: {
				basePrice: 14,
				pricePerKm: 0.022,
				pricePerKg: 1.5,
				daysBase: 4,
				kmPerDay: 230,
			},
		});

		expect(result).not.toBeNull();
		expect(result?.cost).toBeGreaterThan(14);
		expect(result?.cost).toBeLessThan(40);
		expect(result?.distanceKm).toBeGreaterThanOrEqual(0);
		expect(result?.estimatedDays).toBeGreaterThanOrEqual(4);
	});

	test("retorna null para CEP com prefixo ausente", async () => {
		const result = await quoteFreight({
			cep: "00010-000",
			weightKg: 1,
			carrier: spHub,
			method: {
				basePrice: 14,
				pricePerKm: 0.022,
				pricePerKg: 1.5,
				daysBase: 4,
				kmPerDay: 230,
			},
		});

		expect(result).toBeNull();
	});

	test("retorna null para CEP inválido", async () => {
		const result = await quoteFreight({
			cep: "123",
			weightKg: 1,
			carrier: spHub,
			method: {
				basePrice: 14,
				pricePerKm: 0.022,
				pricePerKg: 1.5,
				daysBase: 4,
				kmPerDay: 230,
			},
		});

		expect(result).toBeNull();
	});
});
