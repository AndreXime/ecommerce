import type { CartItem } from "@/lib/productsTypes";
import { useState, useEffect } from "preact/hooks";

const formatPrice = (value: number) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

export default function CartPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>(() => {
		if (typeof window === "undefined") return []; // Proteção SSR
		try {
			const saved = localStorage.getItem("cart");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});

	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const updateCart = (newItems: CartItem[]) => {
		setCartItems(newItems);

		if (typeof window !== "undefined") {
			localStorage.setItem("cart", JSON.stringify(newItems));
			window.dispatchEvent(new Event("cart-updated"));
		}
	};

	const handleUpdateQuantity = (index: number, delta: number) => {
		const newItems = [...cartItems];
		const item = { ...newItems[index] };

		const newQuantity = item.quantity + delta;
		if (newQuantity < 1) return;

		item.quantity = newQuantity;
		newItems[index] = item;

		updateCart(newItems);
	};

	const handleRemoveItem = (index: number) => {
		// window.confirm pode bloquear a thread, use com cuidado ou remova se preferir
		if (window.confirm("Remover este item?")) {
			const newItems = cartItems.filter((_, i) => i !== index);
			updateCart(newItems);
		}
	};

	if (!isMounted)
		return (
			<div class="pt-20 w-full flex justify-center items-center ">
				<i class="fa-solid fa-spinner fa-xl animate-spin"></i>
			</div>
		);

	const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
	const cartTotal = cartItems.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

	if (cartItems.length === 0) {
		return (
			<div class="flex flex-col items-center justify-center py-20 text-center">
				<div class="bg-gray-100 text-gray-400 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-3xl">
					<i class="fas fa-shopping-basket"></i>
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
			{/* LISTA DE ITENS */}
			<div class="flex-grow space-y-4">
				{cartItems.map((item, index) => (
					<div
						key={`${item.id}-${index}`}
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
								<p class="text-sm text-gray-500">{Object.values(item.selectedVariant || {}).map((value) => value)}</p>
								<span class="md:hidden font-bold text-blue-600 mt-1 block">{formatPrice(item.price)}</span>
							</div>
						</div>

						<div class="flex items-center justify-between w-full md:w-auto gap-6">
							<div class="hidden md:block text-right min-w-[100px]">
								<p class="text-sm text-gray-500">Unid.</p>
								<p class="font-medium text-gray-900">{formatPrice(item.price)}</p>
							</div>

							<div class="flex items-center border border-gray-300 rounded-lg h-10">
								<button
									onClick={() => handleUpdateQuantity(index, -1)}
									class="px-3 hover:bg-gray-100 h-full text-gray-600 rounded-l-lg"
									disabled={item.quantity <= 1}
								>
									-
								</button>
								<span class="w-10 text-center font-semibold text-gray-900">{item.quantity}</span>
								<button
									onClick={() => handleUpdateQuantity(index, 1)}
									class="px-3 hover:bg-gray-100 h-full text-gray-600 rounded-r-lg"
								>
									+
								</button>
							</div>

							<div class="text-right flex flex-col items-end min-w-[100px]">
								<p class="font-bold text-lg text-gray-900">{formatPrice(item.price * item.quantity)}</p>
								<button
									onClick={() => handleRemoveItem(index)}
									class="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center"
								>
									<i class="fas fa-trash mr-1"></i> Remover
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
						<button class="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
							Finalizar Compra
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
