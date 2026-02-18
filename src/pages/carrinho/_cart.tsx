import type { CartItem } from "@/database/productsTypes";
import { request } from "@/lib/request";
import { Loader2, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-preact";
import { useState, useEffect } from "preact/hooks";

const formatPrice = (value: number) =>
	new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface ApiCart {
	id: string;
	items: CartItem[];
}

export default function CartPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [unauthenticated, setUnauthenticated] = useState(false);

	useEffect(() => {
		request.get<ApiCart>("/cart").then((res) => {
			if (!res.ok) {
				if (res.message.includes("conexão") === false) setUnauthenticated(true);
			} else {
				setCartItems(res.data.items);
			}
			setLoading(false);
		});
	}, []);

	const handleUpdateQuantity = async (productId: string, quantity: number) => {
		const res = await request.patch<ApiCart>(`/cart/items/${productId}`, { quantity });
		if (res.ok) setCartItems(res.data.items);
	};

	const handleRemoveItem = async (productId: string) => {
		const res = await request.delete<ApiCart>(`/cart/items/${productId}`);
		if (res.ok) setCartItems(res.data.items);
	};

	if (loading)
		return (
			<div class="pt-20 w-full flex justify-center items-center">
				<Loader2 class="w-8 h-8 animate-spin" />
			</div>
		);

	if (unauthenticated)
		return (
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="bg-gray-100 text-gray-400 w-20 h-20 rounded-full flex items-center justify-center mb-4">
					<ShoppingBasket class="w-10 h-10" />
				</div>
				<h2 class="text-xl font-bold text-gray-900">Faça login para ver seu carrinho</h2>
				<a href="/login" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition">
					Entrar
				</a>
			</div>
		);

	const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
	const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

	if (cartItems.length === 0) {
		return (
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="bg-gray-100 text-gray-400 w-20 h-20 rounded-full flex items-center justify-center mb-4">
					<ShoppingBasket class="w-10 h-10" />
				</div>
				<h2 class="text-xl font-bold text-gray-900">Seu carrinho está vazio</h2>
				<a href="/produtos" class="mt-6 text-blue-600 hover:underline">
					Voltar às compras
				</a>
			</div>
		);
	}

	return (
		<div class="flex flex-col lg:flex-row gap-8">
			<div class="flex-grow space-y-4">
				{cartItems.map((item) => (
					<div
						key={item.cartItemId}
						class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row gap-4 items-center"
					>
						<div class="flex items-center w-full md:w-auto flex-grow">
							<img
								src={item.images?.[0] || "/placeholder.png"}
								alt={item.name}
								class="w-20 h-20 object-cover rounded-md border border-gray-100"
							/>
							<div class="ml-4">
								<h3 class="font-bold text-gray-800">{item.name}</h3>
								<p class="text-sm text-gray-500">
									{item.selectedVariant ? Object.values(item.selectedVariant).join(", ") : ""}
								</p>
								<span class="md:hidden font-bold text-blue-600 mt-1 block">{formatPrice(item.price)}</span>
							</div>
						</div>

						<div class="flex items-center justify-between w-full md:w-auto gap-6">
							<div class="hidden md:block text-right min-w-[100px]">
								<p class="text-sm text-gray-500">Unid.</p>
								<p class="font-medium text-gray-900">{formatPrice(item.price)}</p>
							</div>

							<div class="flex items-center border border-gray-300 rounded-lg h-10" role="group" aria-label={`Quantidade de ${item.name}`}>
								<button
									onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
									aria-label={`Diminuir quantidade de ${item.name}`}
									class="px-3 hover:bg-gray-100 h-full text-gray-600 rounded-l-lg"
									disabled={item.quantity <= 1}
								>
									<Minus size={16} aria-hidden="true" />
								</button>
								<span class="w-10 text-center font-semibold text-gray-900" aria-live="polite" aria-atomic="true">{item.quantity}</span>
								<button
									onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
									aria-label={`Aumentar quantidade de ${item.name}`}
									class="px-3 hover:bg-gray-100 h-full text-gray-600 rounded-r-lg"
								>
									<Plus size={16} aria-hidden="true" />
								</button>
							</div>

							<div class="text-right flex flex-col items-end min-w-[100px]">
								<p class="font-bold text-lg text-gray-900">{formatPrice(item.price * item.quantity)}</p>
								<button
									onClick={() => handleRemoveItem(item.id)}
									aria-label={`Remover ${item.name} do carrinho`}
									class="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center"
								>
									<Trash2 class="mr-1 w-3 h-3" aria-hidden="true" /> Remover
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			<div class="w-full lg:w-80 flex-shrink-0">
				<div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-4">
					<h3 class="font-bold text-lg mb-4">Resumo</h3>
					<div class="flex justify-between mb-2">
						<span class="text-gray-600">Itens ({totalItems})</span>
						<span class="font-bold">{formatPrice(cartTotal)}</span>
					</div>
					<div class="border-t border-gray-100 my-4 pt-4">
						<div class="flex justify-between text-xl font-bold text-gray-900 mb-6">
							<span>Total</span>
							<span>{formatPrice(cartTotal)}</span>
						</div>
						<a
							href="/checkout"
							class="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition block text-center"
						>
							Finalizar Compra
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
