import type { CartItem } from "@/database/productsTypes";
import { request } from "@/lib/request";
import { formatPrice } from "@/lib/utils";
import { Loader2, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-preact";
import { useState, useEffect } from "preact/hooks";

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

	const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
		const res = await request.patch<ApiCart>(`/cart/items/${cartItemId}`, { quantity });
		if (res.ok) setCartItems(res.data.items);
	};

	const handleRemoveItem = async (cartItemId: string) => {
		const res = await request.delete<ApiCart>(`/cart/items/${cartItemId}`);
		if (res.ok) setCartItems(res.data.items);
	};

	if (loading) {
		return (
			<div class="py-20 w-full flex justify-center items-center text-muted">
				<Loader2 class="w-8 h-8 animate-spin" aria-label="Carregando carrinho" />
			</div>
		);
	}

	if (unauthenticated) {
		return (
			<div class="app-panel p-12 flex flex-col items-center text-center max-w-md mx-auto">
				<div class="w-16 h-16 rounded-full bg-paper-3 text-muted flex items-center justify-center mb-4">
					<ShoppingBasket class="w-8 h-8" aria-hidden="true" />
				</div>
				<h2 class="font-display font-semibold text-lg text-ink">Faça login para ver seu carrinho</h2>
				<a href="/login" class="btn btn-primary mt-6">Entrar</a>
			</div>
		);
	}

	const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
	const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

	if (cartItems.length === 0) {
		return (
			<div class="app-panel p-12 flex flex-col items-center text-center max-w-md mx-auto">
				<div class="w-16 h-16 rounded-full bg-paper-3 text-muted flex items-center justify-center mb-4">
					<ShoppingBasket class="w-8 h-8" aria-hidden="true" />
				</div>
				<h2 class="font-display font-semibold text-lg text-ink">Seu carrinho está vazio</h2>
				<a href="/produtos" class="btn btn-secondary mt-6">Voltar às compras</a>
			</div>
		);
	}

	return (
		<div class="flex flex-col lg:flex-row gap-8 min-w-0">
			<div class="flex-grow space-y-4 min-w-0">
				{cartItems.map((item) => (
					<article
						key={item.cartItemId}
						class="app-panel p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center min-w-0"
					>
						<div class="flex items-center gap-4 flex-grow min-w-0">
							<img
								src={item.images?.[0] || "/placeholder.png"}
								alt={item.name}
								class="w-20 h-20 object-cover rounded-[var(--radius-input)] border border-rule shrink-0"
							/>
							<div class="min-w-0">
								<h3 class="font-semibold text-ink truncate">{item.name}</h3>
								<p class="text-sm text-muted truncate">
									{item.selectedVariant ? Object.values(item.selectedVariant).join(", ") : ""}
								</p>
								<span class="md:hidden font-display font-semibold text-accent mt-1 block">{formatPrice(item.price)}</span>
							</div>
						</div>

						<div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 shrink-0">
							<div class="hidden md:block text-right min-w-[5rem]">
								<p class="text-xs text-muted">Unidade</p>
								<p class="font-medium text-ink">{formatPrice(item.price)}</p>
							</div>

							<div
								class="flex items-center border border-rule-2 rounded-[var(--radius-input)] h-10"
								role="group"
								aria-label={`Quantidade de ${item.name}`}
							>
								<button
									type="button"
									onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
									aria-label={`Diminuir quantidade de ${item.name}`}
									class="px-3 h-full text-muted hover:bg-paper-2 hover:text-ink transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus rounded-l-[var(--radius-input)]"
									disabled={item.quantity <= 1}
								>
									<Minus size={16} aria-hidden="true" />
								</button>
								<span class="w-10 text-center font-semibold text-ink" aria-live="polite">
									{item.quantity}
								</span>
								<button
									type="button"
									onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
									aria-label={`Aumentar quantidade de ${item.name}`}
									class="px-3 h-full text-muted hover:bg-paper-2 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus rounded-r-[var(--radius-input)]"
								>
									<Plus size={16} aria-hidden="true" />
								</button>
							</div>

							<div class="text-right flex flex-col items-end min-w-[5rem]">
								<p class="font-display font-semibold text-ink">{formatPrice(item.price * item.quantity)}</p>
								<button
									type="button"
									onClick={() => handleRemoveItem(item.cartItemId)}
									aria-label={`Remover ${item.name} do carrinho`}
									class="text-xs text-danger hover:underline mt-1 flex items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus rounded"
								>
									<Trash2 class="w-3 h-3" aria-hidden="true" /> Remover
								</button>
							</div>
						</div>
					</article>
				))}
			</div>

			<aside class="w-full lg:w-72 shrink-0">
				<div class="app-panel p-6 lg:sticky lg:top-28">
					<h2 class="font-display font-semibold text-lg text-ink mb-4">Resumo</h2>
					<div class="flex justify-between text-sm mb-2">
						<span class="text-muted">Itens ({totalItems})</span>
						<span class="font-medium text-ink">{formatPrice(cartTotal)}</span>
					</div>
					<hr class="section-rule my-4" />
					<div class="flex justify-between text-lg font-display font-semibold text-ink mb-6">
						<span>Total</span>
						<span>{formatPrice(cartTotal)}</span>
					</div>
					<a href="/checkout" class="btn btn-success w-full !py-3">
						Finalizar compra
					</a>
				</div>
			</aside>
		</div>
	);
}
