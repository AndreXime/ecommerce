import type { CartItem, ProductDetails } from "@/database/productsTypes";
import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { Icon } from "astro-icon/components";

export default function ProductAddToCart({ product }: { product: ProductDetails }) {
	const [selections, setSelections] = useState<Record<string, string>>({});
	const [quantity, setQuantity] = useState(1);

	const handleSelect = (optionLabel: string, value: string) => {
		setSelections((prev) => ({ ...prev, [optionLabel]: value }));
	};

	const handleAddToCart = () => {
		const missingOptions = product.options?.filter((opt) => !selections[opt.label]);

		if (!missingOptions || missingOptions.length > 0) {
			toast.error(`Por favor, selecione: ${missingOptions?.map((o) => o.label).join(", ")}`);
			return;
		}

		const cartItem = {
			id: product.id,
			name: product.name,
			tag: product.tag,
			price: product.price,
			discountPercentage: product.discountPercentage,
			images: product.images,
			rating: product.rating,
			reviewsCount: product.reviewsCount,
			isNew: product.isNew,
			quantity,
			selectedVariant: selections,
		} as CartItem;

		const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
		localStorage.setItem("cart", JSON.stringify([...currentCart, cartItem]));
		toast.success("Produto adicionado ao carrinho com sucesso!");
		window.dispatchEvent(new Event("cart-updated"));
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
					<div class="w-24 flex items-center border border-gray-300 rounded-xl px-3">
						<button
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-l-xl transition"
						>
							<Icon name="lucide:minus" class="w-4 h-4" />
						</button>
						<input
							type="number"
							value={quantity}
							readOnly
							class="w-full text-center border-none focus:ring-0 font-semibold text-gray-900 bg-transparent h-12 px-2"
						/>
						<button
							onClick={() => setQuantity((q) => q + 1)}
							class="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-r-xl transition"
						>
							<Icon name="lucide:plus" class="w-4 h-4" />
						</button>
					</div>

					<button
						onClick={handleAddToCart}
						class="flex-grow bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center py-3"
					>
						Adicionar ao Carrinho
						<Icon name="lucide:shopping-cart" class="ml-2 w-5 h-5" />
					</button>
				</div>
			</div>
		</div>
	);
}
