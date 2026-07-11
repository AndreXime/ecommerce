import type { z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { database } from "@/database/database";
import { formatCep } from "../cepDatabase";
import { quoteFreight } from "../calculator";
import type { ShippingQuoteBodySchema } from "./quote.schema";

type Body = z.infer<typeof ShippingQuoteBodySchema>;

type QuoteSourceItem = {
	productId: string;
	quantity: number;
};

export async function quoteShipping(userId: string, body: Body) {
	const formattedCep = formatCep(body.cep);
	if (!formattedCep) {
		throw new HTTPException(422, { message: "CEP inválido." });
	}

	const sourceItems = await resolveQuoteItems(userId, body);
	const products = await database.product.findMany({
		where: { id: { in: sourceItems.map((item) => item.productId) } },
		select: { id: true, weight: true },
	});
	const productMap = new Map(products.map((product) => [product.id, product] as const));

	let weightKg = 0;
	for (const item of sourceItems) {
		const product = productMap.get(item.productId);
		if (!product) {
			throw new HTTPException(404, { message: `Produto "${item.productId}" não encontrado.` });
		}
		weightKg += Number(product.weight) * item.quantity;
	}

	const methods = await database.shippingMethod.findMany({
		where: { active: true, carrier: { active: true } },
		include: { carrier: true },
		orderBy: [{ basePrice: "asc" }, { name: "asc" }],
	});

	if (methods.length === 0) {
		throw new HTTPException(503, { message: "Nenhuma opção de frete disponível no momento." });
	}

	const options = [];
	for (const method of methods) {
		const quote = await quoteFreight({
			cep: formattedCep,
			weightKg,
			carrier: {
				hubLocation: {
					lat: Number(method.carrier.hubLat),
					lng: Number(method.carrier.hubLng),
				},
			},
			method: {
				basePrice: Number(method.basePrice),
				pricePerKm: Number(method.pricePerKm),
				pricePerKg: Number(method.pricePerKg),
				daysBase: method.daysBase,
				kmPerDay: method.kmPerDay,
			},
		});

		if (!quote) {
			throw new HTTPException(422, {
				message: "Não entregamos para este CEP (prefixo não encontrado na base).",
			});
		}

		options.push({
			methodId: method.id,
			carrierName: method.carrier.name,
			methodName: method.name,
			methodCode: method.code,
			cost: quote.cost,
			estimatedDays: quote.estimatedDays,
			distanceKm: quote.distanceKm,
		});
	}

	options.sort((a, b) => a.cost - b.cost || a.estimatedDays - b.estimatedDays);

	return { options };
}

async function resolveQuoteItems(userId: string, body: Body): Promise<QuoteSourceItem[]> {
	if (body.items) {
		return body.items;
	}

	const cart = await database.cart.findUnique({
		where: { userId },
		include: { items: true },
	});

	if (!cart || cart.items.length === 0) {
		throw new HTTPException(400, { message: "Carrinho está vazio" });
	}

	return cart.items.map((item) => ({
		productId: item.productId,
		quantity: item.quantity,
	}));
}
