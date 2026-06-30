import type { ProductDetails } from "@/database/productsTypes";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-preact";

export default function ProductAddToCart({ product }: { product: ProductDetails }) {
	const [selections, setSelections] = useState<Record<string, string>>({});
	const [quantity, setQuantity] = useState(1);
	const [loading, setLoading] = useState(false);

	const handleSelect = (optionLabel: string, value: string) => {
		setSelections((prev) => ({ ...prev, [optionLabel]: value }));
	};

	const handleAddToCart = async () => {
		const missingOptions = product.options?.filter((opt) => !selections[opt.label]);

		if (missingOptions && missingOptions.length > 0) {
			toast.error(`Por favor, selecione: ${missingOptions.map((o) => o.label).join(", ")}`);
			return;
		}

		setLoading(true);

		const res = await request.post("/cart/items", {
			productId: product.id,
			quantity,
			selectedVariant: Object.keys(selections).length > 0 ? selections : undefined,
		});

		if (!res.ok) {
			if (res.message.includes("autenti") || res.message.includes("401")) {
				toast.error("Faça login para adicionar ao carrinho");
				setTimeout(() => {
					window.location.href = "/login";
				}, 1500);
			} else {
				toast.error(res.message || "Erro ao adicionar ao carrinho");
			}
		} else {
			toast.success("Produto adicionado ao carrinho!");
			window.dispatchEvent(new Event("cart-updated"));
		}

		setLoading(false);
	};

	return (
		<div class="space-y-6 pt-4 border-t border-rule">
			{product.options?.map((option) => (
				<div key={option.label}>
					<span class="block text-sm font-semibold text-ink mb-2">{option.label}</span>
					<div class="flex flex-wrap gap-2">
						{option.values.map((val) => {
							const isSelected = selections[option.label] === val;
							const activeClasses =
								option.uiType === "color"
									? "ring-2 ring-offset-2 ring-accent"
									: "border-accent bg-accent-soft text-accent font-semibold";
							const inactiveClasses =
								option.uiType === "color"
									? "hover:ring-2 hover:ring-offset-2 hover:ring-rule-2"
									: "border-rule-2 bg-paper text-ink-2 hover:border-accent hover:text-accent";

							return (
								<button
									type="button"
									onClick={() => handleSelect(option.label, val)}
									aria-label={option.uiType === "color" ? `${option.label}: ${val}` : undefined}
									aria-pressed={isSelected}
									class={`transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
										option.uiType === "color"
											? `w-8 h-8 rounded-full border border-rule ${val}`
											: "rounded-[var(--radius-input)] py-2 px-4 text-sm border"
									} ${isSelected ? activeClasses : inactiveClasses}`}
								>
									{option.uiType !== "color" && val}
								</button>
							);
						})}
					</div>
				</div>
			))}

			<div class="pt-4 border-t border-rule">
				<div class="flex flex-col sm:flex-row gap-3">
					<div
						class="flex items-center border border-rule-2 rounded-[var(--radius-input)] h-12 w-full sm:w-28 shrink-0"
						role="group"
						aria-label="Quantidade"
					>
						<button
							type="button"
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							aria-label="Diminuir quantidade"
							class="px-3 h-full text-muted hover:bg-paper-2 hover:text-ink transition-colors rounded-l-[var(--radius-input)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
						>
							<Minus class="w-4 h-4" aria-hidden="true" />
						</button>
						<span class="flex-1 text-center font-semibold text-ink" aria-live="polite">
							{quantity}
						</span>
						<button
							type="button"
							onClick={() => setQuantity((q) => q + 1)}
							aria-label="Aumentar quantidade"
							class="px-3 h-full text-muted hover:bg-paper-2 hover:text-ink transition-colors rounded-r-[var(--radius-input)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
						>
							<Plus class="w-4 h-4" aria-hidden="true" />
						</button>
					</div>

					<button
						type="button"
						onClick={handleAddToCart}
						disabled={loading}
						class="btn btn-primary flex-1 !py-3"
					>
						{loading ? (
							<Loader2 class="w-5 h-5 animate-spin" aria-label="Carregando" />
						) : (
							<>
								Adicionar ao carrinho
								<ShoppingCart class="w-5 h-5" aria-hidden="true" />
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
