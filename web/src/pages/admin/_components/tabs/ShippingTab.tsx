import { useEffect, useState } from "preact/hooks";
import { useStore } from "@/lib/useStore";
import { AlertTriangle, Pencil, Plus, RefreshCw, Trash2, Truck, X } from "lucide-preact";
import { toast } from "@/lib/toast";
import { request } from "@/lib/request";
import { formatPrice } from "@/lib/utils";
import { btnPrimaryClass, btnSecondaryClass, inputClass } from "@/lib/uiClasses";
import type { Carrier, ShippingMethod } from "../types";
import { loadCarriers, shippingStore } from "../stores/shippingStore";

type CarrierModal = { mode: "create" } | { mode: "edit"; carrier: Carrier } | null;
type MethodModal =
	| { mode: "create"; carrierId: string }
	| { mode: "edit"; method: ShippingMethod }
	| null;
type DeleteTarget =
	| { type: "carrier"; carrier: Carrier }
	| { type: "method"; method: ShippingMethod }
	| null;

const emptyCarrierForm = {
	name: "",
	slug: "",
	hubLat: "-23.55",
	hubLng: "-46.633",
	active: true,
};

const emptyMethodForm = {
	name: "",
	code: "",
	basePrice: "10",
	pricePerKm: "0.02",
	pricePerKg: "1",
	daysBase: "2",
	kmPerDay: "200",
	active: true,
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export function ShippingTab() {
	const state = useStore(shippingStore);
	const { list, loading } = state;

	const [carrierModal, setCarrierModal] = useState<CarrierModal>(null);
	const [methodModal, setMethodModal] = useState<MethodModal>(null);
	const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
	const [carrierForm, setCarrierForm] = useState(emptyCarrierForm);
	const [methodForm, setMethodForm] = useState(emptyMethodForm);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [slugTouched, setSlugTouched] = useState(false);
	const [codeTouched, setCodeTouched] = useState(false);

	useEffect(() => {
		loadCarriers();
	}, []);

	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			setCarrierModal(null);
			setMethodModal(null);
			setDeleteTarget(null);
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	const hasModal = !!carrierModal || !!methodModal || !!deleteTarget;
	useEffect(() => {
		document.body.style.overflow = hasModal ? "hidden" : "auto";
	}, [hasModal]);

	function openCreateCarrier() {
		setCarrierForm(emptyCarrierForm);
		setSlugTouched(false);
		setCarrierModal({ mode: "create" });
	}

	function openEditCarrier(carrier: Carrier) {
		setCarrierForm({
			name: carrier.name,
			slug: carrier.slug,
			hubLat: String(carrier.hubLat),
			hubLng: String(carrier.hubLng),
			active: carrier.active,
		});
		setSlugTouched(true);
		setCarrierModal({ mode: "edit", carrier });
	}

	function openCreateMethod(carrierId: string) {
		setMethodForm(emptyMethodForm);
		setCodeTouched(false);
		setMethodModal({ mode: "create", carrierId });
	}

	function openEditMethod(method: ShippingMethod) {
		setMethodForm({
			name: method.name,
			code: method.code,
			basePrice: String(method.basePrice),
			pricePerKm: String(method.pricePerKm),
			pricePerKg: String(method.pricePerKg),
			daysBase: String(method.daysBase),
			kmPerDay: String(method.kmPerDay),
			active: method.active,
		});
		setCodeTouched(true);
		setMethodModal({ mode: "edit", method });
	}

	async function submitCarrier(e: Event) {
		e.preventDefault();
		if (!carrierModal) return;
		setSaving(true);

		const body = {
			name: carrierForm.name.trim(),
			slug: carrierForm.slug.trim(),
			hubLat: Number(carrierForm.hubLat),
			hubLng: Number(carrierForm.hubLng),
			active: carrierForm.active,
		};

		const res =
			carrierModal.mode === "create"
				? await request.post<Carrier>("/shipping/carriers", body)
				: await request.patch<Carrier>(`/shipping/carriers/${carrierModal.carrier.id}`, body);

		if (res.ok) {
			toast.success(carrierModal.mode === "create" ? "Transportadora criada" : "Transportadora atualizada");
			setCarrierModal(null);
			loadCarriers({ force: true });
		} else {
			toast.error(res.message);
		}
		setSaving(false);
	}

	async function submitMethod(e: Event) {
		e.preventDefault();
		if (!methodModal) return;
		setSaving(true);

		const pricing = {
			name: methodForm.name.trim(),
			code: methodForm.code.trim(),
			basePrice: Number(methodForm.basePrice),
			pricePerKm: Number(methodForm.pricePerKm),
			pricePerKg: Number(methodForm.pricePerKg),
			daysBase: Number(methodForm.daysBase),
			kmPerDay: Number(methodForm.kmPerDay),
			active: methodForm.active,
		};

		const res =
			methodModal.mode === "create"
				? await request.post<ShippingMethod>("/shipping/methods", {
						...pricing,
						carrierId: methodModal.carrierId,
					})
				: await request.patch<ShippingMethod>(`/shipping/methods/${methodModal.method.id}`, pricing);

		if (res.ok) {
			toast.success(methodModal.mode === "create" ? "Método criado" : "Método atualizado");
			setMethodModal(null);
			loadCarriers({ force: true });
		} else {
			toast.error(res.message);
		}
		setSaving(false);
	}

	async function confirmDelete() {
		if (!deleteTarget) return;
		setDeleting(true);

		const res =
			deleteTarget.type === "carrier"
				? await request.delete(`/shipping/carriers/${deleteTarget.carrier.id}`)
				: await request.delete(`/shipping/methods/${deleteTarget.method.id}`);

		if (res.ok) {
			toast.success(deleteTarget.type === "carrier" ? "Transportadora removida" : "Método removido");
			setDeleteTarget(null);
			loadCarriers({ force: true });
		} else {
			toast.error(res.message);
		}
		setDeleting(false);
	}

	return (
		<div className="animate-fade-in">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
				<div>
					<h1 className="text-2xl font-bold text-ink">Frete</h1>
					<p className="text-sm text-muted mt-1">Transportadoras e métodos de cálculo</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<button type="button" onClick={() => loadCarriers({ force: true })} className={btnSecondaryClass}>
						<RefreshCw class="w-4 h-4" /> Atualizar
					</button>
					<button type="button" onClick={openCreateCarrier} className={btnPrimaryClass}>
						<Plus class="w-4 h-4" /> Nova transportadora
					</button>
				</div>
			</div>

			{loading ? (
				<p className="text-sm text-muted">Carregando...</p>
			) : list.length === 0 ? (
				<div className="app-panel rounded-xl border border-rule p-8 text-center">
					<Truck class="w-10 h-10 text-muted mx-auto mb-3" />
					<p className="text-sm text-muted">Nenhuma transportadora cadastrada</p>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{list.map((carrier) => (
						<section key={carrier.id} className="app-panel rounded-xl border border-rule overflow-hidden">
							<div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between border-b border-rule">
								<div>
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-lg font-semibold text-ink">{carrier.name}</h2>
										<span
											className={`text-xs font-medium px-2 py-0.5 rounded ${
												carrier.active ? "bg-emerald-50 text-emerald-700" : "bg-paper-3 text-muted"
											}`}
										>
											{carrier.active ? "Ativa" : "Inativa"}
										</span>
									</div>
									<p className="text-sm text-muted mt-1">
										<code className="text-xs bg-paper-3 px-1.5 py-0.5 rounded">{carrier.slug}</code>
										{" · "}
										hub {carrier.hubLat.toFixed(4)}, {carrier.hubLng.toFixed(4)}
									</p>
								</div>
								<div className="flex flex-wrap gap-2">
									<button type="button" onClick={() => openCreateMethod(carrier.id)} className={btnSecondaryClass}>
										<Plus class="w-4 h-4" /> Método
									</button>
									<button
										type="button"
										onClick={() => openEditCarrier(carrier)}
										className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-accent-soft transition"
									>
										<Pencil class="w-4 h-4" /> Editar
									</button>
									<button
										type="button"
										onClick={() => setDeleteTarget({ type: "carrier", carrier })}
										className="inline-flex items-center gap-1.5 text-sm text-danger hover:bg-danger-soft px-3 py-1.5 rounded-lg transition"
									>
										<Trash2 class="w-4 h-4" /> Excluir
									</button>
								</div>
							</div>

							<div className="p-5">
								{(carrier.methods ?? []).length === 0 ? (
									<p className="text-sm text-muted">Nenhum método nesta transportadora</p>
								) : (
									<div className="overflow-x-auto">
										<table className="w-full text-sm text-left">
											<thead>
												<tr className="text-muted border-b border-rule">
													<th className="pb-2 font-medium pr-4">Método</th>
													<th className="pb-2 font-medium pr-4">Base</th>
													<th className="pb-2 font-medium pr-4">R$/km</th>
													<th className="pb-2 font-medium pr-4">R$/kg</th>
													<th className="pb-2 font-medium pr-4">Prazo</th>
													<th className="pb-2 font-medium pr-4">Status</th>
													<th className="pb-2 font-medium text-right">Ações</th>
												</tr>
											</thead>
											<tbody>
												{(carrier.methods ?? []).map((method) => (
													<tr key={method.id} className="border-b border-rule/60 last:border-0">
														<td className="py-3 pr-4">
															<div className="font-medium text-ink">{method.name}</div>
															<code className="text-xs text-muted">{method.code}</code>
														</td>
														<td className="py-3 pr-4">{formatPrice(method.basePrice)}</td>
														<td className="py-3 pr-4">{method.pricePerKm}</td>
														<td className="py-3 pr-4">{method.pricePerKg}</td>
														<td className="py-3 pr-4">
															{method.daysBase}d + {method.kmPerDay} km/dia
														</td>
														<td className="py-3 pr-4">
															<span
																className={`text-xs font-medium px-2 py-0.5 rounded ${
																	method.active ? "bg-emerald-50 text-emerald-700" : "bg-paper-3 text-muted"
																}`}
															>
																{method.active ? "Ativo" : "Inativo"}
															</span>
														</td>
														<td className="py-3 text-right whitespace-nowrap">
															<button
																type="button"
																onClick={() => openEditMethod(method)}
																className="inline-flex p-1.5 text-accent hover:bg-accent-soft rounded transition"
																aria-label={`Editar ${method.name}`}
															>
																<Pencil class="w-4 h-4" />
															</button>
															<button
																type="button"
																onClick={() => setDeleteTarget({ type: "method", method })}
																className="inline-flex p-1.5 text-danger hover:bg-danger-soft rounded transition ml-1"
																aria-label={`Excluir ${method.name}`}
															>
																<Trash2 class="w-4 h-4" />
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</section>
					))}
				</div>
			)}

			{carrierModal && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Fechar"
						onClick={() => setCarrierModal(null)}
					/>
					<div className="relative app-panel rounded-xl border border-rule shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-ink">
								{carrierModal.mode === "create" ? "Nova transportadora" : "Editar transportadora"}
							</h3>
							<button type="button" onClick={() => setCarrierModal(null)} className="p-1 rounded hover:bg-paper-3">
								<X class="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={submitCarrier} className="flex flex-col gap-4">
							<label className="block">
								<span className="text-sm font-medium text-ink-2 mb-1 block">Nome</span>
								<input
									className={inputClass}
									required
									minLength={2}
									value={carrierForm.name}
									onInput={(e) => {
										const name = (e.target as HTMLInputElement).value;
										setCarrierForm((f) => ({
											...f,
											name,
											slug: slugTouched ? f.slug : slugify(name),
										}));
									}}
								/>
							</label>
							<label className="block">
								<span className="text-sm font-medium text-ink-2 mb-1 block">Slug</span>
								<input
									className={inputClass}
									required
									minLength={2}
									pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
									value={carrierForm.slug}
									onInput={(e) => {
										setSlugTouched(true);
										setCarrierForm((f) => ({ ...f, slug: (e.target as HTMLInputElement).value }));
									}}
								/>
							</label>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Hub latitude</span>
									<input
										type="number"
										step="any"
										min={-90}
										max={90}
										required
										className={inputClass}
										value={carrierForm.hubLat}
										onInput={(e) =>
											setCarrierForm((f) => ({ ...f, hubLat: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Hub longitude</span>
									<input
										type="number"
										step="any"
										min={-180}
										max={180}
										required
										className={inputClass}
										value={carrierForm.hubLng}
										onInput={(e) =>
											setCarrierForm((f) => ({ ...f, hubLng: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
							</div>
							<label className="flex items-center gap-2 text-sm text-ink-2">
								<input
									type="checkbox"
									checked={carrierForm.active}
									onChange={(e) =>
										setCarrierForm((f) => ({ ...f, active: (e.target as HTMLInputElement).checked }))
									}
								/>
								Transportadora ativa
							</label>
							<div className="flex gap-3 pt-2">
								<button type="button" onClick={() => setCarrierModal(null)} className={`flex-1 ${btnSecondaryClass}`}>
									Cancelar
								</button>
								<button type="submit" disabled={saving} className={`flex-1 ${btnPrimaryClass}`}>
									{saving ? "Salvando…" : "Salvar"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{methodModal && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Fechar"
						onClick={() => setMethodModal(null)}
					/>
					<div className="relative app-panel rounded-xl border border-rule shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-bold text-ink">
								{methodModal.mode === "create" ? "Novo método de frete" : "Editar método de frete"}
							</h3>
							<button type="button" onClick={() => setMethodModal(null)} className="p-1 rounded hover:bg-paper-3">
								<X class="w-5 h-5" />
							</button>
						</div>
						<form onSubmit={submitMethod} className="flex flex-col gap-4">
							<label className="block">
								<span className="text-sm font-medium text-ink-2 mb-1 block">Nome</span>
								<input
									className={inputClass}
									required
									minLength={2}
									value={methodForm.name}
									onInput={(e) => {
										const name = (e.target as HTMLInputElement).value;
										setMethodForm((f) => ({
											...f,
											name,
											code: codeTouched ? f.code : slugify(name),
										}));
									}}
								/>
							</label>
							<label className="block">
								<span className="text-sm font-medium text-ink-2 mb-1 block">Code</span>
								<input
									className={inputClass}
									required
									minLength={2}
									pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
									value={methodForm.code}
									onInput={(e) => {
										setCodeTouched(true);
										setMethodForm((f) => ({ ...f, code: (e.target as HTMLInputElement).value }));
									}}
								/>
							</label>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Preço base (R$)</span>
									<input
										type="number"
										step="0.01"
										min={0}
										required
										className={inputClass}
										value={methodForm.basePrice}
										onInput={(e) =>
											setMethodForm((f) => ({ ...f, basePrice: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Preço por km</span>
									<input
										type="number"
										step="0.0001"
										min={0}
										required
										className={inputClass}
										value={methodForm.pricePerKm}
										onInput={(e) =>
											setMethodForm((f) => ({ ...f, pricePerKm: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Preço por kg</span>
									<input
										type="number"
										step="0.0001"
										min={0}
										required
										className={inputClass}
										value={methodForm.pricePerKg}
										onInput={(e) =>
											setMethodForm((f) => ({ ...f, pricePerKg: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Dias base</span>
									<input
										type="number"
										step="1"
										min={0}
										required
										className={inputClass}
										value={methodForm.daysBase}
										onInput={(e) =>
											setMethodForm((f) => ({ ...f, daysBase: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
								<label className="block lg:col-span-2">
									<span className="text-sm font-medium text-ink-2 mb-1 block">Km por dia</span>
									<input
										type="number"
										step="1"
										min={1}
										required
										className={inputClass}
										value={methodForm.kmPerDay}
										onInput={(e) =>
											setMethodForm((f) => ({ ...f, kmPerDay: (e.target as HTMLInputElement).value }))
										}
									/>
								</label>
							</div>
							<label className="flex items-center gap-2 text-sm text-ink-2">
								<input
									type="checkbox"
									checked={methodForm.active}
									onChange={(e) =>
										setMethodForm((f) => ({ ...f, active: (e.target as HTMLInputElement).checked }))
									}
								/>
								Método ativo
							</label>
							<div className="flex gap-3 pt-2">
								<button type="button" onClick={() => setMethodModal(null)} className={`flex-1 ${btnSecondaryClass}`}>
									Cancelar
								</button>
								<button type="submit" disabled={saving} className={`flex-1 ${btnPrimaryClass}`}>
									{saving ? "Salvando…" : "Salvar"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{deleteTarget && (
				<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
					<button
						type="button"
						className="absolute inset-0 bg-black/40"
						aria-label="Fechar"
						onClick={() => setDeleteTarget(null)}
					/>
					<div className="relative app-panel rounded-xl border border-rule shadow-xl w-full max-w-md p-6 text-center">
						<div className="w-12 h-12 rounded-full bg-danger-soft flex items-center justify-center mx-auto mb-3">
							<AlertTriangle class="w-6 h-6 text-red-600" />
						</div>
						<h3 className="text-lg font-bold text-ink mb-2">
							{deleteTarget.type === "carrier" ? "Excluir transportadora?" : "Excluir método?"}
						</h3>
						<p className="text-sm text-muted mb-6">
							<strong>
								{deleteTarget.type === "carrier" ? deleteTarget.carrier.name : deleteTarget.method.name}
							</strong>{" "}
							será removido permanentemente
							{deleteTarget.type === "carrier" ? " junto com todos os métodos" : ""}. Esta ação não pode ser
							desfeita.
						</p>
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => setDeleteTarget(null)}
								className="flex-1 border border-rule text-ink-2 font-semibold py-2.5 rounded-lg hover:bg-paper-2 transition"
							>
								Cancelar
							</button>
							<button
								type="button"
								onClick={confirmDelete}
								disabled={deleting}
								className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-lg transition"
							>
								{deleting ? "Excluindo…" : "Excluir"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
