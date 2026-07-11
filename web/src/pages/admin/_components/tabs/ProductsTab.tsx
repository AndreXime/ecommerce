import { useEffect, useRef, useState } from "preact/hooks";
import { useStore } from "@nanostores/preact";
import { Pencil, Plus, RefreshCw, Search, Trash2, X, AlertTriangle } from "lucide-preact";
import { Pagination } from "../Pagination";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import { uploadProductImage } from "@/lib/platform/uploadProductImage";
import type { Category, Product, ProductDetails, ProductDetailsWithImageIds, ProductImage } from "../types";
import { productsStore, loadProducts, setProductsPage, setProductsSearch } from "../stores/productsStore";
import { categoriesStore, loadCategories } from "../stores/categoriesStore";

import { inputClass, searchInputClass } from "@/lib/uiClasses";

export function ProductsTab() {
	const productsState = useStore(productsStore);
	const { list, meta, page, search, loading } = productsState;

	const categoriesState = useStore(categoriesStore);
	const categories = categoriesState.list;

	const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [productModal, setProductModal] = useState<{ mode: "create" | "edit"; id?: string } | null>(null);

	const [pName, setPName] = useState("");
	const [pTag, setPTag] = useState("");
	const [pPrice, setPPrice] = useState("");
	const [pDiscount, setPDiscount] = useState("");
	const [pStockQuantity, setPStockQuantity] = useState("0");
	const [pWeight, setPWeight] = useState("0.5");
	const [pIsNew, setPIsNew] = useState(false);
	const [pDescription, setPDescription] = useState("");
	const [pCategoryId, setPCategoryId] = useState("");
	const [pImageUrls, setPImageUrls] = useState<string[]>([""]);
	const [pUploadedImages, setPUploadedImages] = useState<{ id: string; url: string }[]>([]);
	const [pSpecs, setPSpecs] = useState<{ key: string; value: string }[]>([]);
	const [pFormSaving, setPFormSaving] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const imageFileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const t = setTimeout(() => loadProducts(), 300);
		return () => clearTimeout(t);
	}, [page, search]);

	useEffect(() => {
		loadCategories();
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			setProductModal(null);
			setDeletingProduct(null);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const hasModal = !!productModal || !!deletingProduct;
	useEffect(() => {
		document.body.style.overflow = hasModal ? "hidden" : "auto";
	}, [hasModal]);

	function resetProductForm() {
		setPName("");
		setPTag("");
		setPPrice("");
		setPDiscount("");
		setPStockQuantity("0");
		setPWeight("0.5");
		setPIsNew(false);
		setPDescription("");
		setPCategoryId(categories[0]?.id ?? "");
		setPImageUrls([""]);
		setPSpecs([]);
	}

	function openCreateProduct() {
		resetProductForm();
		setProductModal({ mode: "create" });
	}

	async function openEditProduct(product: Product) {
		const res = await request.get<ProductDetails | ProductDetailsWithImageIds>(`/products/${product.id}`);
		if (!res.ok) {
			toast.error("Erro ao carregar produto");
			return;
		}
		const p = res.data;
		setPName(p.name);
		setPTag(p.tag);
		setPPrice(String(p.price));
		setPDiscount(p.discountPercentage != null ? String(p.discountPercentage) : "");
		setPStockQuantity(String(p.stockQuantity ?? 0));
		setPWeight(String(p.weight ?? 0.5));
		setPIsNew(p.isNew);
		setPDescription(p.description);
		const cat = categories.find((c: Category) => c.name === p.category);
		setPCategoryId(cat?.id ?? "");
		setPSpecs(Object.entries(p.specs ?? {}).map(([key, value]) => ({ key, value: String(value) })));
		setProductModal({ mode: "edit", id: product.id });

		const rawImages = p.images as string[] | ProductImage[];
		const hasImageObjects =
			Array.isArray(rawImages) &&
			rawImages.length > 0 &&
			typeof rawImages[0] === "object" &&
			rawImages[0] !== null &&
			"id" in rawImages[0] &&
			"url" in rawImages[0];
		if (hasImageObjects) {
			const sorted = [...(rawImages as ProductImage[])].sort(
				(a, b) => (a.position ?? 0) - (b.position ?? 0),
			);
			setPUploadedImages(sorted.map(({ id, url }) => ({ id, url })));
			setPImageUrls(sorted.map((x) => x.url));
		} else {
			const urls = Array.isArray(rawImages) && rawImages.length > 0 ? (rawImages as string[]) : [""];
			setPImageUrls(urls);
			setPUploadedImages([]);
		}
	}

	async function submitProductForm(e: Event) {
		e.preventDefault();
		const validImages = pImageUrls.filter((u) => u.trim());
		if (productModal?.mode === "create" && validImages.length === 0) {
			toast.error("Adicione pelo menos uma imagem");
			return;
		}
		setPFormSaving(true);

		const specs: Record<string, string> = {};
		for (const { key, value } of pSpecs) {
			if (key.trim()) specs[key.trim()] = value;
		}

		if (productModal?.mode === "create") {
			const res = await request.post("/products", {
				name: pName,
				tag: pTag,
				price: Number(pPrice),
				discountPercentage: pDiscount ? Number(pDiscount) : undefined,
				isNew: pIsNew,
				stockQuantity: Number(pStockQuantity) || 0,
				weight: Number(pWeight) || 0.5,
				description: pDescription,
				categoryId: pCategoryId,
				specs,
				images: validImages.map((url, i) => ({ url, position: i })),
			});
			if (res.ok) {
				toast.success("Produto criado com sucesso");
				setProductModal(null);
				loadProducts({ force: true });
			} else {
				toast.error(res.message);
			}
		} else if (productModal?.mode === "edit" && productModal.id) {
			const body: Record<string, unknown> = {
				name: pName,
				tag: pTag,
				price: Number(pPrice),
				discountPercentage: pDiscount ? Number(pDiscount) : null,
				isNew: pIsNew,
				stockQuantity: Number(pStockQuantity) || 0,
				weight: Number(pWeight) || 0.5,
				description: pDescription,
				specs,
			};
			if (pCategoryId.trim()) body.categoryId = pCategoryId;
			const res = await request.patch(`/products/${productModal.id}`, body);
			if (res.ok) {
				toast.success("Produto atualizado");
				setProductModal(null);
				loadProducts({ force: true });
			} else {
				toast.error(res.message);
			}
		}
		setPFormSaving(false);
	}

	async function deleteProduct() {
		if (!deletingProduct) return;
		setDeleteLoading(true);
		const res = await request.delete(`/products/${deletingProduct.id}`);
		if (res.ok) {
			toast.success("Produto removido");
			setDeletingProduct(null);
			loadProducts({ force: true });
		} else {
			toast.error(res.message);
		}
		setDeleteLoading(false);
	}

	async function handleImageFileChange(e: Event) {
		if (!productModal || productModal.mode !== "edit" || !productModal.id) return;
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
			toast.error("Formato inválido. Use JPEG, PNG ou WEBP.");
			input.value = "";
			return;
		}

		setUploadingImage(true);

		const uploadResult = await uploadProductImage(productModal.id, file);
		if (!uploadResult.ok) {
			toast.error(uploadResult.message);
			setUploadingImage(false);
			input.value = "";
			return;
		}

		setPUploadedImages((prev) => [
			...prev,
			{ id: uploadResult.data.image.id, url: uploadResult.data.image.url },
		]);
		setPImageUrls((prev) => [...prev, uploadResult.data.image.url]);
		toast.success("Imagem enviada com sucesso");
		loadProducts({ force: true });
		setUploadingImage(false);
		input.value = "";
	}

	return (
		<div className="animate-fade-in">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold text-ink">Produtos</h1>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => loadProducts({ force: true })}
						className="inline-flex items-center gap-2 text-sm text-accent hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-accent-soft transition"
					>
						<RefreshCw class="w-4 h-4" /> Atualizar
					</button>
					<button
						onClick={openCreateProduct}
						className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
					>
						<Plus class="w-4 h-4" /> Novo Produto
					</button>
				</div>
			</div>

			<div className="app-panel rounded-xl border border-rule shadow-sm overflow-hidden">
				<div className="p-4 border-b border-rule">
					<div className="relative">
						<Search class="absolute left-3 top-2.5 w-4 h-4 text-muted" />
						<input
							type="text"
							placeholder="Buscar produto..."
							value={search}
							onInput={(e) => {
								setProductsSearch((e.target as HTMLInputElement).value);
								setProductsPage(1);
							}}
							className={searchInputClass}
						/>
					</div>
				</div>

				{loading ? (
					<div className="p-12 text-center text-muted">Carregando...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-paper-2 border-b border-rule">
								<tr>
									<th className="text-left px-4 py-3 font-semibold text-muted">Produto</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Categoria</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Preço</th>
									<th className="text-left px-4 py-3 font-semibold text-muted">Estoque</th>
									<th className="px-4 py-3 w-20"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{list.map((product) => (
									<tr key={product.id} className="hover:bg-paper-2 transition">
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<img
													src={product.images?.[0] ?? "/placeholder.png"}
													alt={product.name}
													className="w-10 h-10 object-cover rounded-lg bg-paper-3 flex-shrink-0"
												/>
												<div>
													<div className="font-medium text-ink">{product.name}</div>
													<div className="text-muted text-xs">{product.tag}</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 text-muted">{product.category}</td>
										<td className="px-4 py-3 font-medium text-ink">
											{formatPrice(product.price)}
											{product.discountPercentage != null && (
												<span className="ml-2 text-danger text-xs">-{product.discountPercentage}%</span>
											)}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
													product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
												}`}
											>
												{product.inStock ? "Em estoque" : "Esgotado"}
											</span>
										</td>
										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-1">
												<button
													onClick={() => openEditProduct(product)}
													className="text-purple-600 hover:text-purple-800 p-1.5 rounded hover:bg-purple-50 transition"
													title="Editar"
												>
													<Pencil class="w-4 h-4" />
												</button>
												<button
													onClick={() => setDeletingProduct(product)}
													className="text-danger hover:text-red-700 p-1.5 rounded hover:bg-danger-soft transition"
													title="Excluir"
												>
													<Trash2 class="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
								{list.length === 0 && (
									<tr>
										<td colSpan={5} className="px-4 py-12 text-center text-muted">
											Nenhum produto encontrado
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				)}

				{meta && (
					<div className="px-4 pb-4">
						<Pagination meta={meta} page={page} onChange={setProductsPage} />
					</div>
				)}
			</div>

			{productModal && (
				<div
					id="product-modal-overlay"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-overlay"
					onClick={(e) => {
						if ((e.target as HTMLElement).id === "product-modal-overlay") setProductModal(null);
					}}
				>
					<div className="app-panel w-full max-w-2xl rounded-2xl shadow-2xl m-4 max-h-[90vh] flex flex-col animate-scale-in">
						<div className="flex justify-between items-center px-6 py-4 border-b border-rule flex-shrink-0">
							<h3 className="text-lg font-bold text-ink">
								{productModal.mode === "create" ? "Novo Produto" : "Editar Produto"}
							</h3>
							<button onClick={() => setProductModal(null)} className="text-muted hover:text-muted transition">
								<X class="w-5 h-5" />
							</button>
						</div>

						<form onSubmit={submitProductForm} className="overflow-y-auto flex-1 p-6 space-y-5">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="product-name" className="block text-sm font-medium text-ink-2 mb-1">
										Nome *
									</label>
									<input
										id="product-name"
										type="text"
										value={pName}
										required
										minLength={2}
										onInput={(e) => setPName((e.target as HTMLInputElement).value)}
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-tag" className="block text-sm font-medium text-ink-2 mb-1">
										Tag (slug) *
									</label>
									<input
										id="product-tag"
										type="text"
										value={pTag}
										required
										minLength={2}
										onInput={(e) => setPTag((e.target as HTMLInputElement).value)}
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-price" className="block text-sm font-medium text-ink-2 mb-1">
										Preço (R$) *
									</label>
									<input
										id="product-price"
										type="number"
										step="0.01"
										min="0.01"
										value={pPrice}
										required
										onInput={(e) => setPPrice((e.target as HTMLInputElement).value)}
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-discount" className="block text-sm font-medium text-ink-2 mb-1">
										Desconto (%)
									</label>
									<input
										id="product-discount"
										type="number"
										step="1"
										min="0"
										max="100"
										value={pDiscount}
										onInput={(e) => setPDiscount((e.target as HTMLInputElement).value)}
										placeholder="0"
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-stock" className="block text-sm font-medium text-ink-2 mb-1">
										Estoque *
									</label>
									<input
										id="product-stock"
										type="number"
										step="1"
										min="0"
										value={pStockQuantity}
										required
										onInput={(e) => setPStockQuantity((e.target as HTMLInputElement).value)}
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-weight" className="block text-sm font-medium text-ink-2 mb-1">
										Peso (kg) *
									</label>
									<input
										id="product-weight"
										type="number"
										step="0.001"
										min="0.001"
										value={pWeight}
										required
										onInput={(e) => setPWeight((e.target as HTMLInputElement).value)}
										className={inputClass}
									/>
								</div>
								<div>
									<label htmlFor="product-category" className="block text-sm font-medium text-ink-2 mb-1">
										Categoria *
									</label>
									<select
										id="product-category"
										value={pCategoryId}
										required
										onChange={(e) => setPCategoryId((e.target as HTMLSelectElement).value)}
										className={`${inputClass} app-panel`}
									>
										<option value="">Selecione...</option>
										{categories.map((c: Category) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
								</div>
								<div className="flex items-center gap-6 pt-5">
									<label className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
										<input
											type="checkbox"
											checked={pIsNew}
											onChange={(e) => setPIsNew((e.target as HTMLInputElement).checked)}
											className="rounded accent-purple-600"
										/>
										Novo
									</label>
								</div>
							</div>

							<div>
								<label htmlFor="product-description" className="block text-sm font-medium text-ink-2 mb-1">
									Descrição *
								</label>
								<textarea
									id="product-description"
									value={pDescription}
									required
									minLength={10}
									rows={3}
									onInput={(e) => setPDescription((e.target as HTMLTextAreaElement).value)}
									className={`${inputClass} resize-none`}
								/>
							</div>

							{productModal.mode === "edit" && (
								<div>
									<span className="block text-sm font-medium text-ink-2 mb-1">Galeria de imagens</span>
									<div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-3">
										{pImageUrls.map((url) => {
											const uploaded = pUploadedImages.find((img) => img.url === url);
											return (
												<div key={url} className="relative group">
													<img
														src={url}
														alt={pName || "Imagem do produto"}
														className="w-full aspect-square object-cover rounded-lg border border-rule"
													/>
													{uploaded && (
														<button
															type="button"
															onClick={async () => {
																if (!productModal?.id) return;
																const res = await request.delete(
																	`/products/${productModal.id}/images/${uploaded.id}`,
																);
																if (res.ok) {
																	toast.success("Imagem removida");
																	setPUploadedImages((prev) => prev.filter((img) => img.id !== uploaded.id));
																	setPImageUrls((prev) => prev.filter((u) => u !== url));
																	loadProducts({ force: true });
																} else {
																	toast.error(res.message);
																}
															}}
															className="absolute top-1 right-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow"
															title="Remover imagem"
														>
															<Trash2 class="w-4 h-4" />
														</button>
													)}
												</div>
											);
										})}
										{productModal.id && (
											<>
												<input
													ref={imageFileInputRef}
													type="file"
													accept="image/jpeg,image/png,image/webp"
													onChange={handleImageFileChange}
													className="hidden"
													aria-hidden
													tabIndex={-1}
												/>
												<button
													type="button"
													onClick={() => imageFileInputRef.current?.click()}
													disabled={uploadingImage}
													className="w-full aspect-square rounded-lg border-2 border-dashed border-rule-2 text-muted hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
													title="Adicionar imagem"
												>
													{uploadingImage ? (
														<span className="text-xs">Enviando...</span>
													) : (
														<Plus class="w-10 h-10" />
													)}
												</button>
											</>
										)}
									</div>
								</div>
							)}

							{productModal.mode === "create" && (
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="block text-sm font-medium text-ink-2">Imagens (URLs) *</span>
										<button
											type="button"
											onClick={() => setPImageUrls([...pImageUrls, ""])}
											className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
										>
											<Plus class="w-3 h-3" /> Adicionar
										</button>
									</div>
									<div className="space-y-2">
										{pImageUrls.map((url, i) => (
											<div key={i} className="flex gap-2">
												<input
													type="url"
													value={url}
													placeholder="https://..."
													onInput={(e) => {
														const updated = [...pImageUrls];
														updated[i] = (e.target as HTMLInputElement).value;
														setPImageUrls(updated);
													}}
													className={inputClass}
												/>
												{pImageUrls.length > 1 && (
													<button
														type="button"
														onClick={() => setPImageUrls(pImageUrls.filter((_, j) => j !== i))}
														className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"
													>
														<X class="w-4 h-4" />
													</button>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							<div>
								<div className="flex items-center justify-between mb-2">
									<span className="block text-sm font-medium text-ink-2">Especificações</span>
									<button
										type="button"
										onClick={() => setPSpecs([...pSpecs, { key: "", value: "" }])}
										className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
									>
										<Plus class="w-3 h-3" /> Adicionar
									</button>
								</div>
								<div className="space-y-2">
									{pSpecs.map((spec, i) => (
										<div key={i} className="flex gap-2">
											<input
												type="text"
												value={spec.key}
												placeholder="Chave (ex: Memória)"
												onInput={(e) => {
													const updated = [...pSpecs];
													updated[i] = { ...updated[i], key: (e.target as HTMLInputElement).value };
													setPSpecs(updated);
												}}
												className={inputClass}
											/>
											<input
												type="text"
												value={spec.value}
												placeholder="Valor (ex: 16GB)"
												onInput={(e) => {
													const updated = [...pSpecs];
													updated[i] = { ...updated[i], value: (e.target as HTMLInputElement).value };
													setPSpecs(updated);
												}}
												className={inputClass}
											/>
											<button
												type="button"
												onClick={() => setPSpecs(pSpecs.filter((_, j) => j !== i))}
												className="text-red-400 hover:text-red-600 p-2 flex-shrink-0"
											>
												<X class="w-4 h-4" />
											</button>
										</div>
									))}
									{pSpecs.length === 0 && <p className="text-xs text-muted">Nenhuma especificação adicionada</p>}
								</div>
							</div>

							<div className="flex gap-3 pt-2">
								<button
									type="button"
									onClick={() => setProductModal(null)}
									className="flex-1 border border-rule text-ink-2 font-semibold py-2.5 rounded-lg hover:bg-paper-2 transition"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={pFormSaving}
									className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition"
								>
									{pFormSaving ? "Salvando…" : productModal.mode === "create" ? "Criar Produto" : "Salvar Alterações"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deletingProduct && (
				<div
					id="delete-modal-overlay"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-overlay"
					onClick={(e) => {
						if ((e.target as HTMLElement).id === "delete-modal-overlay") setDeletingProduct(null);
					}}
				>
					<div className="app-panel w-full max-w-sm rounded-2xl shadow-2xl m-4 animate-scale-in">
						<div className="p-6 text-center">
							<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
								<AlertTriangle class="w-6 h-6 text-red-600" />
							</div>
							<h3 className="text-lg font-bold text-ink mb-2">Excluir produto?</h3>
							<p className="text-sm text-muted mb-6">
								<strong>{deletingProduct.name}</strong> será removido permanentemente. Esta ação não pode ser desfeita.
							</p>
							<div className="flex gap-3">
								<button
									onClick={() => setDeletingProduct(null)}
									className="flex-1 border border-rule text-ink-2 font-semibold py-2.5 rounded-lg hover:bg-paper-2 transition"
								>
									Cancelar
								</button>
								<button
									onClick={deleteProduct}
									disabled={deleteLoading}
									className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition"
								>
									{deleteLoading ? "Excluindo…" : "Excluir"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
