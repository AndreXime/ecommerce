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
				setTimeout(() => { window.location.href = "/login"; }, 1500);
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
		<div class="space-y-6 pt-4 border-t border-gray-100">
			{product.options?.map((option) => (
				<div key={option.label}>
					<span class="block text-sm font-semibold text-gray-900 mb-2">{option.label}</span>

					<div class="flex flex-wrap gap-3">
						{option.values.map((val) => {
							const isSelected = selections[option.label] === val;

							const activeClasses =
								option.uiType === "color"
									? "ring-2 ring-offset-2 ring-blue-600"
									: "border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm";

							const inactiveClasses =
								option.uiType === "color"
									? "hover:ring-2 hover:ring-offset-2 hover:ring-gray-400"
									: "border-gray-200 bg-white text-gray-700 hover:border-blue-600 hover:text-blue-600";

							return (
								<button
									onClick={() => handleSelect(option.label, val)}
									aria-label={option.uiType === "color" ? `${option.label}: ${val}` : undefined}
									aria-pressed={isSelected}
									class={`transition focus:outline-none ${
										option.uiType === "color"
											? `w-8 h-8 rounded-full border border-gray-200 ${val}`
											: `rounded-lg py-2 px-4 text-sm border`
									} ${isSelected ? activeClasses : inactiveClasses}`}
								>
									{option.uiType !== "color" && val}
								</button>
							);
						})}
					</div>
				</div>
			))}

			<div class="pt-6 border-t border-gray-100">
				<div class="flex gap-4">
					<div class="w-24 flex items-center border border-gray-300 rounded-xl px-3" role="group" aria-label="Quantidade">
						<button
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							aria-label="Diminuir quantidade"
							class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-xl transition"
						>
							<Minus class="w-4 h-4" aria-hidden="true" />
						</button>
						<input
							type="number"
							value={quantity}
							readOnly
							aria-label="Quantidade selecionada"
							class="w-full text-center border-none focus:ring-0 font-semibold text-gray-900 bg-transparent h-12 px-2"
						/>
						<button
							onClick={() => setQuantity((q) => q + 1)}
							aria-label="Aumentar quantidade"
							class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-xl transition"
						>
							<Plus class="w-4 h-4" aria-hidden="true" />
						</button>
					</div>

					<button
						onClick={handleAddToCart}
						disabled={loading}
						class="flex-grow bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg flex items-center justify-center py-3 transition"
					>
						{loading ? (
							<Loader2 class="w-5 h-5 animate-spin" />
						) : (
							<>
								Adicionar ao Carrinho
								<ShoppingCart class="ml-2 w-5 h-5" />
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
