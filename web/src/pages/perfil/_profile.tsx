import type { User } from "@/database/users";
import { request } from "@/lib/request";
import { toast } from "@/lib/toast";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "preact/hooks";
import {
	Package,
	User as UserIcon,
	MapPin,
	CreditCard,
	Heart,
	LogOut,
	Home,
	Building,
	PlusCircle,
	Plus,
	X,
	Trash2,
} from "lucide-preact";

type Tab = "orders" | "profile" | "addresses" | "payments" | "wishlist";

type Address = User["addresses"][number];
type PaymentCard = User["paymentCards"][number];
type WishlistProduct = User["wishlistProducts"][number];

type AddressFormState = {
	id?: string;
	type: string;
	street: string;
	city: string;
	cep: string;
	isDefault: boolean;
};

const emptyAddressForm = (): AddressFormState => ({
	type: "Casa",
	street: "",
	city: "",
	cep: "",
	isDefault: false,
});

function showApiError(response: { message: string; errors: { message: string }[] | null }) {
	if (response.errors) {
		response.errors.forEach((error) => toast.error(error.message));
	} else {
		toast.error(response.message);
	}
}

export default function AccountDashboard({ user }: { user: User }) {
	const [activeTab, setActiveTab] = useState<Tab>("orders");
	const [personalName, setPersonalName] = useState(user.personalData.name);
	const [personalPhone, setPersonalPhone] = useState(user.personalData.phone ?? "");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [profileLoading, setProfileLoading] = useState(false);

	const [addresses, setAddresses] = useState(user.addresses);
	const [addressFormOpen, setAddressFormOpen] = useState(false);
	const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm());
	const [addressLoading, setAddressLoading] = useState(false);

	const [cards, setCards] = useState(user.paymentCards);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [cardLoading, setCardLoading] = useState(false);

	const [wishlist, setWishlist] = useState(user.wishlistProducts);
	const [wishlistBusyId, setWishlistBusyId] = useState<string | null>(null);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsModalOpen(false);
				setAddressFormOpen(false);
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	useEffect(() => {
		document.body.style.overflow = isModalOpen || addressFormOpen ? "hidden" : "auto";
	}, [isModalOpen, addressFormOpen]);

	const handleModalClickOutside = (e: MouseEvent) => {
		if ((e.target as HTMLElement).id === "modal-overlay") {
			setIsModalOpen(false);
		}
		if ((e.target as HTMLElement).id === "address-modal-overlay") {
			setAddressFormOpen(false);
		}
	};

	const handleLogout = async (): Promise<void> => {
		await request.post("/auth/logout");
		window.location.href = "/login";
	};

	const handleSaveProfile = async (e: SubmitEvent) => {
		e.preventDefault();
		setProfileLoading(true);

		const body: {
			id: string;
			name?: string;
			phone?: string | null;
			currentPassword?: string;
			newPassword?: string;
		} = { id: user.personalData.id };

		if (personalName.trim() !== user.personalData.name) {
			body.name = personalName.trim();
		}

		const phoneValue = personalPhone.trim();
		const previousPhone = user.personalData.phone ?? "";
		if (phoneValue !== previousPhone) {
			body.phone = phoneValue.length > 0 ? phoneValue : null;
		}

		if (currentPassword || newPassword) {
			body.currentPassword = currentPassword;
			body.newPassword = newPassword;
		}

		if (!body.name && body.phone === undefined && !body.currentPassword) {
			toast.error("Altere ao menos um campo para salvar.");
			setProfileLoading(false);
			return;
		}

		const response = await request.put<{ name: string; phone: string | null }>("/users", body);

		if (!response.ok) {
			showApiError(response);
			setProfileLoading(false);
			return;
		}

		toast.success("Dados atualizados com sucesso.");
		setPersonalName(response.data.name);
		setPersonalPhone(response.data.phone ?? "");
		setCurrentPassword("");
		setNewPassword("");
		user.personalData.name = response.data.name;
		user.personalData.phone = response.data.phone;
		setProfileLoading(false);
	};

	const openNewAddress = () => {
		setAddressForm(emptyAddressForm());
		setAddressFormOpen(true);
	};

	const openEditAddress = (addr: Address) => {
		setAddressForm({
			id: addr.id,
			type: addr.type,
			street: addr.street,
			city: addr.city,
			cep: addr.cep,
			isDefault: addr.isDefault,
		});
		setAddressFormOpen(true);
	};

	const handleSaveAddress = async (e: SubmitEvent) => {
		e.preventDefault();
		setAddressLoading(true);

		const payload = {
			type: addressForm.type.trim(),
			street: addressForm.street.trim(),
			city: addressForm.city.trim(),
			cep: addressForm.cep.trim(),
			isDefault: addressForm.isDefault,
		};

		const response = addressForm.id
			? await request.patch<Address>(`/users/me/addresses/${addressForm.id}`, payload)
			: await request.post<Address>("/users/me/addresses", payload);

		if (!response.ok) {
			showApiError(response);
			setAddressLoading(false);
			return;
		}

		const saved = response.data;
		setAddresses((prev) => {
			const without = prev.filter((a) => a.id !== saved.id);
			const next = saved.isDefault
				? without.map((a) => ({ ...a, isDefault: false }))
				: without;
			return [...next, saved].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
		});
		toast.success(addressForm.id ? "Endereço atualizado." : "Endereço adicionado.");
		setAddressFormOpen(false);
		setAddressLoading(false);
	};

	const handleSetDefaultAddress = async (addressId: string) => {
		const response = await request.patch<Address>(`/users/me/addresses/${addressId}`, {
			isDefault: true,
		});
		if (!response.ok) {
			showApiError(response);
			return;
		}
		setAddresses((prev) =>
			prev.map((a) => ({ ...a, isDefault: a.id === addressId })),
		);
		toast.success("Endereço padrão atualizado.");
	};

	const handleDeleteAddress = async (addressId: string) => {
		if (!confirm("Excluir este endereço?")) return;
		const response = await request.delete(`/users/me/addresses/${addressId}`);
		if (!response.ok) {
			showApiError(response);
			return;
		}
		setAddresses((prev) => prev.filter((a) => a.id !== addressId));
		toast.success("Endereço excluído.");
	};

	const handleAddCard = async (e: SubmitEvent) => {
		e.preventDefault();
		setCardLoading(true);
		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const body = {
			brand: String(formData.get("brand") ?? "").trim(),
			last4: String(formData.get("last4") ?? "").trim(),
			holder: String(formData.get("holder") ?? "").trim(),
			expiry: String(formData.get("expiry") ?? "").trim(),
		};

		const response = await request.post<PaymentCard>("/users/me/cards", body);
		if (!response.ok) {
			showApiError(response);
			setCardLoading(false);
			return;
		}

		setCards((prev) => [...prev, response.data]);
		toast.success("Cartão salvo.");
		setIsModalOpen(false);
		setCardLoading(false);
	};

	const handleDeleteCard = async (cardId: string) => {
		if (!confirm("Remover este cartão?")) return;
		const response = await request.delete(`/users/me/cards/${cardId}`);
		if (!response.ok) {
			showApiError(response);
			return;
		}
		setCards((prev) => prev.filter((c) => c.id !== cardId));
		toast.success("Cartão removido.");
	};

	const handleRemoveWishlist = async (productId: string) => {
		setWishlistBusyId(productId);
		const response = await request.post<{ wishlisted: boolean }>(`/wishlist/${productId}`);
		if (!response.ok) {
			showApiError(response);
			setWishlistBusyId(null);
			return;
		}
		if (!response.data.wishlisted) {
			setWishlist((prev) => prev.filter((p) => p.id !== productId));
			toast.success("Removido da lista de desejos.");
		}
		setWishlistBusyId(null);
	};

	const handleAddWishlistToCart = async (item: WishlistProduct) => {
		setWishlistBusyId(item.id);
		const response = await request.post("/cart/items", {
			productId: item.id,
			quantity: 1,
		});
		if (!response.ok) {
			showApiError(response);
			setWishlistBusyId(null);
			return;
		}
		toast.success("Produto adicionado ao carrinho!");
		window.dispatchEvent(new Event("cart-updated"));
		setWishlistBusyId(null);
	};

	return (
		<div className="flex flex-col lg:flex-row gap-8">
			<aside className="w-full lg:w-1/4 flex-shrink-0">
				<div className="app-panel p-6 rounded-xl border border-rule shadow-sm mb-6 flex items-center gap-4">
					<div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold shadow-md capitalize">
						{personalName[0]?.toUpperCase() ?? "U"}
						{personalName[1]?.toUpperCase() ?? ""}
					</div>
					<div>
						<h2 className="font-bold text-ink">{personalName}</h2>
						<p className="text-xs text-muted">
							Membro desde {new Date(user.personalData.registredAt).getFullYear()}
						</p>
					</div>
				</div>

				<div
					className="app-panel rounded-xl border border-rule shadow-sm overflow-hidden"
					role="tablist"
					aria-label="Seções da conta"
				>
					{[
						{ id: "orders", label: "Meus Pedidos", icon: Package },
						{ id: "profile", label: "Dados Pessoais", icon: UserIcon },
						{ id: "addresses", label: "Endereços", icon: MapPin },
						{ id: "payments", label: "Pagamentos", icon: CreditCard },
						{ id: "wishlist", label: "Lista de Desejos", icon: Heart },
					].map((item) => (
						<button
							key={item.id}
							type="button"
							role="tab"
							aria-selected={activeTab === item.id}
							aria-controls={`tabpanel-${item.id}`}
							id={`tab-${item.id}`}
							onClick={() => setActiveTab(item.id as Tab)}
							className={`w-full text-left px-5 py-3.5 flex items-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
								activeTab === item.id ? "tab-active" : "tab-inactive"
							}`}
						>
							<item.icon class="w-5 h-5 mr-3" aria-hidden="true" /> {item.label}
						</button>
					))}
					<div className="h-px bg-paper-3 my-1"></div>
					<button
						type="button"
						onClick={() => void handleLogout()}
						className="w-full text-left px-6 py-4 flex items-center text-danger hover:bg-danger-soft transition"
					>
						<LogOut class="w-5 h-5 mr-3" aria-hidden="true" /> Sair
					</button>
				</div>
			</aside>

			<div
				className="flex-grow w-full lg:w-3/4"
				role="tabpanel"
				id={`tabpanel-${activeTab}`}
				aria-labelledby={`tab-${activeTab}`}
			>
				{activeTab === "orders" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-ink mb-4">Histórico de Pedidos</h2>
						{user.ordersHistory.length === 0 && (
							<div className="app-panel rounded-xl border border-rule shadow-sm p-12 flex flex-col items-center text-center">
								<Package class="w-12 h-12 text-gray-300 mb-4" />
								<h3 className="font-bold text-ink-2 mb-1">Nenhum pedido encontrado</h3>
								<p className="text-sm text-muted">Seus pedidos aparecerão aqui após a primeira compra.</p>
								<a
									href="/"
									className="mt-6 bg-accent hover:opacity-90 text-white text-sm font-bold px-6 py-2 rounded-lg transition"
								>
									Explorar produtos
								</a>
							</div>
						)}
						{user.ordersHistory.map((order) => (
							<div key={order.id} className="app-panel rounded-xl border border-rule shadow-sm overflow-hidden">
								<div className="bg-paper-2 px-6 py-4 border-b border-rule flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
									<div className="flex flex-wrap gap-6 text-sm">
										<div>
											<span className="block text-muted text-xs uppercase font-bold">Data</span>
											<span className="font-medium text-ink">
												{new Date(order.date).toLocaleDateString("pt-BR")}
											</span>
										</div>
										<div>
											<span className="block text-muted text-xs uppercase font-bold">Subtotal</span>
											<span className="font-medium text-ink">{formatPrice(order.subtotal)}</span>
										</div>
										<div>
											<span className="block text-muted text-xs uppercase font-bold">Frete</span>
											<span className="font-medium text-ink">
												{order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Grátis"}
											</span>
										</div>
										<div>
											<span className="block text-muted text-xs uppercase font-bold">Total</span>
											<span className="font-medium text-ink">{formatPrice(order.total)}</span>
										</div>
										<div>
											<span className="block text-muted text-xs uppercase font-bold">Status</span>
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													order.status === "delivered"
														? "bg-green-100 text-green-800"
														: order.status === "intransit"
															? "bg-blue-100 text-blue-800"
															: order.status === "pending"
																? "bg-yellow-100 text-yellow-800"
																: "bg-red-100 text-red-800"
												}`}
											>
												{order.status === "delivered"
													? "Entregue"
													: order.status === "intransit"
														? "Em Trânsito"
														: order.status === "pending"
															? "Pendente"
															: "Cancelado"}
											</span>
										</div>
									</div>
									<div className="text-sm text-muted">Pedido {order.id}</div>
								</div>
								{order.shipment && (
									<div className="px-6 py-3 border-b border-rule bg-paper text-sm text-ink-2">
										<span className="font-medium text-ink">
											{order.shipment.carrierName} - {order.shipment.methodName}
										</span>
										{" · "}
										CEP {order.shipment.destinationCep}
										{" · "}
										cerca de {order.shipment.estimatedDays}{" "}
										{order.shipment.estimatedDays === 1 ? "dia útil" : "dias úteis"}
									</div>
								)}
								<div className="p-6 space-y-4">
									{order.items.map((item, idx) => (
										<div
											key={item.id}
											className={`flex items-center gap-4 ${idx > 0 ? "pt-4 border-t border-rule" : ""}`}
										>
											<img
												src={item.img ?? "/placeholder.png"}
												className="w-16 h-16 object-cover rounded-md bg-paper-3"
												alt={item.name}
											/>
											<div className="flex-grow">
												<h4 className="font-bold text-ink text-sm">{item.name}</h4>
												<p className="text-xs text-muted">
													{item.variant ? `${item.variant} · ` : ""}Qtd: {item.quantity}
												</p>
											</div>
											<span className="text-sm font-medium text-ink">
												{formatPrice(item.subtotal ?? item.price * item.quantity)}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}

				{activeTab === "profile" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-ink mb-4">Dados Pessoais</h2>
						<div className="app-panel p-6 rounded-xl border border-rule shadow-sm">
							<form onSubmit={handleSaveProfile}>
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
									<div>
										<label htmlFor="profileName" className="block text-sm font-medium text-ink-2 mb-1">
											Nome Completo
										</label>
										<input
											id="profileName"
											name="name"
											type="text"
											value={personalName}
											onInput={(e) => setPersonalName((e.target as HTMLInputElement).value)}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											required
											minLength={3}
										/>
									</div>
									<div>
										<label htmlFor="profileEmail" className="block text-sm font-medium text-ink-2 mb-1">
											Email
										</label>
										<input
											id="profileEmail"
											type="email"
											value={user.personalData.email}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none bg-paper-2"
											readOnly
										/>
									</div>
									<div>
										<label htmlFor="profileCpf" className="block text-sm font-medium text-ink-2 mb-1">
											CPF
										</label>
										<input
											id="profileCpf"
											type="text"
											value={user.personalData.registration ?? ""}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none bg-paper-2"
											readOnly
										/>
									</div>
									<div>
										<label htmlFor="profilePhone" className="block text-sm font-medium text-ink-2 mb-1">
											Telefone
										</label>
										<input
											id="profilePhone"
											name="phone"
											type="text"
											value={personalPhone}
											onInput={(e) => setPersonalPhone((e.target as HTMLInputElement).value)}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											placeholder="(11) 99999-9999"
										/>
									</div>
									<div>
										<label
											htmlFor="profileCurrentPassword"
											className="block text-sm font-medium text-ink-2 mb-1"
										>
											Senha atual
										</label>
										<input
											id="profileCurrentPassword"
											type="password"
											value={currentPassword}
											onInput={(e) => setCurrentPassword((e.target as HTMLInputElement).value)}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											minLength={6}
											autocomplete="current-password"
										/>
									</div>
									<div>
										<label htmlFor="profileNewPassword" className="block text-sm font-medium text-ink-2 mb-1">
											Nova senha
										</label>
										<input
											id="profileNewPassword"
											type="password"
											value={newPassword}
											onInput={(e) => setNewPassword((e.target as HTMLInputElement).value)}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											minLength={6}
											autocomplete="new-password"
										/>
									</div>
								</div>
								<div className="flex justify-end">
									<button
										type="submit"
										disabled={profileLoading}
										className="bg-accent hover:opacity-90 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-60"
									>
										{profileLoading ? "Salvando..." : "Salvar Alterações"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{activeTab === "addresses" && (
					<div className="space-y-6 animate-fade-in">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-ink">Meus Endereços</h2>
							<button
								type="button"
								onClick={openNewAddress}
								className="text-sm bg-accent hover:opacity-90 text-white px-4 py-2 rounded-lg transition flex items-center"
							>
								<Plus class="w-4 h-4 mr-2" /> Novo Endereço
							</button>
						</div>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{addresses.length === 0 && (
								<div className="col-span-full app-panel rounded-xl border border-dashed border-rule-2 p-12 flex flex-col items-center text-center">
									<MapPin class="w-12 h-12 text-gray-300 mb-4" />
									<h3 className="font-bold text-ink-2 mb-1">Nenhum endereço cadastrado</h3>
									<p className="text-sm text-muted">Adicione um endereço para agilizar suas compras.</p>
								</div>
							)}
							{addresses.map((addr) => (
								<div
									key={addr.id}
									className={`app-panel p-6 rounded-xl border shadow-sm relative ${addr.isDefault ? "border-accent" : "border-rule hover:border-rule-2 transition"}`}
								>
									{addr.isDefault && (
										<span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
											Padrão
										</span>
									)}
									<div className="flex items-start gap-3 mb-3">
										{addr.type === "Casa" ? (
											<Home class="text-muted mt-1 w-5 h-5" />
										) : (
											<Building class="text-muted mt-1 w-5 h-5" />
										)}
										<div>
											<h4 className="font-bold text-ink">{addr.type}</h4>
											<p className="text-sm text-muted mt-1">
												{addr.street}
												<br />
												{addr.city} - CEP {addr.cep}
											</p>
										</div>
									</div>
									<div className="flex gap-4 mt-4 pt-4 border-t border-rule text-sm">
										{!addr.isDefault && (
											<button
												type="button"
												onClick={() => void handleSetDefaultAddress(addr.id)}
												className="text-muted hover:text-ink-2 font-medium"
											>
												Definir como Padrão
											</button>
										)}
										<button
											type="button"
											onClick={() => openEditAddress(addr)}
											className="text-accent hover:underline font-medium"
										>
											Editar
										</button>
										<button
											type="button"
											onClick={() => void handleDeleteAddress(addr.id)}
											className="text-danger hover:underline font-medium"
										>
											Excluir
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeTab === "payments" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-ink mb-4">Cartões Salvos</h2>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
							{cards.length === 0 && (
								<div className="app-panel rounded-xl border border-dashed border-rule-2 p-12 flex flex-col items-center text-center">
									<CreditCard class="w-12 h-12 text-gray-300 mb-4" />
									<h3 className="font-bold text-ink-2 mb-1">Nenhum cartão salvo</h3>
									<p className="text-sm text-muted">Adicione um cartão para facilitar o pagamento.</p>
								</div>
							)}
							{cards.map((card) => (
								<div
									key={card.id}
									className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden"
								>
									<div className="flex justify-between items-start mb-8">
										<div>
											<CreditCard class="w-8 h-8 mb-2" />
											<span className="text-xs uppercase tracking-wide text-gray-400">{card.brand}</span>
										</div>
										<button
											type="button"
											onClick={() => void handleDeleteCard(card.id)}
											className="text-gray-400 hover:text-white transition"
											aria-label="Remover cartão"
										>
											<Trash2 class="w-4 h-4" />
										</button>
									</div>
									<div className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• {card.last4}</div>
									<div className="flex justify-between items-end text-sm text-gray-300">
										<div>
											<div className="text-xs text-muted uppercase">Titular</div>
											<div>{card.holder}</div>
										</div>
										<div>
											<div className="text-xs text-muted uppercase">Validade</div>
											<div>{card.expiry}</div>
										</div>
									</div>
								</div>
							))}

							<button
								type="button"
								onClick={() => setIsModalOpen(true)}
								className="app-panel border-2 border-dashed border-rule-2 rounded-xl p-6 flex flex-col items-center justify-center text-muted hover:border-accent hover:text-accent hover:bg-accent-soft transition cursor-pointer h-full min-h-[180px]"
							>
								<PlusCircle class="w-10 h-10 mb-2" />
								<span className="font-medium">Adicionar Novo Cartão</span>
							</button>
						</div>
					</div>
				)}

				{activeTab === "wishlist" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-ink mb-4">Lista de Desejos</h2>
						<div className="space-y-4">
							{wishlist.length === 0 && (
								<div className="app-panel rounded-xl border border-dashed border-rule-2 p-12 flex flex-col items-center text-center">
									<Heart class="w-12 h-12 text-gray-300 mb-4" />
									<h3 className="font-bold text-ink-2 mb-1">Sua lista de desejos está vazia</h3>
									<p className="text-sm text-muted">Salve produtos que você gostaria de comprar futuramente.</p>
									<a
										href="/"
										className="mt-6 bg-accent hover:opacity-90 text-white text-sm font-bold px-6 py-2 rounded-lg transition"
									>
										Explorar produtos
									</a>
								</div>
							)}
							{wishlist.map((item) => (
								<div
									key={item.id}
									className={`app-panel p-4 rounded-xl border border-rule shadow-sm flex items-center gap-4 ${!item.inStock ? "opacity-75" : ""}`}
								>
									<a href={`/produtos/${item.id}`} className="relative w-16 h-16 flex-shrink-0">
										<img
											src={item.images?.[0] ?? "/placeholder.png"}
											className={`w-full h-full object-cover rounded-md ${!item.inStock ? "grayscale" : ""}`}
											alt={item.name}
										/>
									</a>
									<div className="flex-grow">
										<a href={`/produtos/${item.id}`} className="hover:text-accent">
											<h4 className={`font-bold ${item.inStock ? "text-ink" : "text-muted"}`}>{item.name}</h4>
										</a>
										<p className="text-sm mb-1 text-muted">{item.category}</p>
										<span className={`font-bold ${item.inStock ? "text-ink" : "text-muted"}`}>
											{formatPrice(item.price)}
										</span>
									</div>
									<div className="flex flex-col items-end gap-2">
										{item.inStock ? (
											<button
												type="button"
												disabled={wishlistBusyId === item.id}
												onClick={() => void handleAddWishlistToCart(item)}
												className="bg-accent hover:opacity-90 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap disabled:opacity-60"
											>
												Adicionar
											</button>
										) : (
											<button
												type="button"
												disabled
												className="bg-gray-200 text-muted text-sm px-4 py-2 rounded-lg cursor-not-allowed whitespace-nowrap"
											>
												Indisponível
											</button>
										)}
										<button
											type="button"
											disabled={wishlistBusyId === item.id}
											onClick={() => void handleRemoveWishlist(item.id)}
											className="text-danger hover:underline text-xs disabled:opacity-60"
										>
											Remover
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{addressFormOpen && (
				<div
					id="address-modal-overlay"
					onClick={handleModalClickOutside}
					role="dialog"
					aria-modal="true"
					aria-label={addressForm.id ? "Editar endereço" : "Novo endereço"}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 animate-fade-overlay"
				>
					<div className="app-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden m-4 animate-scale-in">
						<div className="bg-paper-2 px-6 py-4 border-b border-rule flex justify-between items-center">
							<h3 className="text-lg font-bold text-ink">
								{addressForm.id ? "Editar Endereço" : "Novo Endereço"}
							</h3>
							<button
								type="button"
								onClick={() => setAddressFormOpen(false)}
								aria-label="Fechar modal"
								className="text-muted hover:text-ink transition"
							>
								<X class="w-5 h-5" aria-hidden="true" />
							</button>
						</div>
						<form onSubmit={handleSaveAddress} className="p-6 space-y-4">
							<div>
								<label htmlFor="addrType" className="block text-sm font-medium text-ink-2 mb-1">
									Tipo
								</label>
								<input
									id="addrType"
									className="w-full border border-rule-2 rounded-lg px-4 py-2 outline-none focus:border-accent"
									value={addressForm.type}
									onInput={(e) =>
										setAddressForm((prev) => ({
											...prev,
											type: (e.target as HTMLInputElement).value,
										}))
									}
									required
								/>
							</div>
							<div>
								<label htmlFor="addrStreet" className="block text-sm font-medium text-ink-2 mb-1">
									Rua
								</label>
								<input
									id="addrStreet"
									className="w-full border border-rule-2 rounded-lg px-4 py-2 outline-none focus:border-accent"
									value={addressForm.street}
									onInput={(e) =>
										setAddressForm((prev) => ({
											...prev,
											street: (e.target as HTMLInputElement).value,
										}))
									}
									required
									minLength={5}
								/>
							</div>
							<div>
								<label htmlFor="addrCity" className="block text-sm font-medium text-ink-2 mb-1">
									Cidade
								</label>
								<input
									id="addrCity"
									className="w-full border border-rule-2 rounded-lg px-4 py-2 outline-none focus:border-accent"
									value={addressForm.city}
									onInput={(e) =>
										setAddressForm((prev) => ({
											...prev,
											city: (e.target as HTMLInputElement).value,
										}))
									}
									required
									minLength={2}
								/>
							</div>
							<div>
								<label htmlFor="addrCep" className="block text-sm font-medium text-ink-2 mb-1">
									CEP
								</label>
								<input
									id="addrCep"
									className="w-full border border-rule-2 rounded-lg px-4 py-2 outline-none focus:border-accent"
									value={addressForm.cep}
									onInput={(e) =>
										setAddressForm((prev) => ({
											...prev,
											cep: (e.target as HTMLInputElement).value,
										}))
									}
									placeholder="00000-000"
									required
									pattern="\d{5}-\d{3}"
								/>
							</div>
							<label className="flex items-center gap-2 text-sm text-ink-2">
								<input
									type="checkbox"
									checked={addressForm.isDefault}
									onChange={(e) =>
										setAddressForm((prev) => ({
											...prev,
											isDefault: (e.target as HTMLInputElement).checked,
										}))
									}
								/>
								Definir como padrão
							</label>
							<div className="mt-4 flex gap-3">
								<button
									type="button"
									onClick={() => setAddressFormOpen(false)}
									className="flex-1 app-panel border border-rule-2 text-ink-2 font-semibold py-2 rounded-lg hover:bg-paper-2 transition"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={addressLoading}
									className="flex-1 bg-accent hover:opacity-90 text-white font-bold py-2 rounded-lg transition disabled:opacity-60"
								>
									{addressLoading ? "Salvando..." : "Salvar"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isModalOpen && (
				<div
					id="modal-overlay"
					onClick={handleModalClickOutside}
					role="dialog"
					aria-modal="true"
					aria-label="Adicionar cartão de pagamento"
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 animate-fade-overlay"
				>
					<div className="app-panel w-full max-w-md rounded-2xl shadow-2xl overflow-hidden m-4 animate-scale-in">
						<div className="bg-paper-2 px-6 py-4 border-b border-rule flex justify-between items-center">
							<h3 className="text-lg font-bold text-ink">Adicionar Cartão</h3>
							<button
								type="button"
								onClick={() => setIsModalOpen(false)}
								aria-label="Fechar modal"
								className="text-muted hover:text-ink transition"
							>
								<X class="w-5 h-5" aria-hidden="true" />
							</button>
						</div>
						<div className="p-6">
							<form onSubmit={handleAddCard}>
								<div className="space-y-4">
									<div>
										<label htmlFor="cardModalBrand" className="block text-sm font-medium text-ink-2 mb-1">
											Bandeira
										</label>
										<input
											id="cardModalBrand"
											name="brand"
											type="text"
											required
											minLength={2}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											placeholder="Visa, Mastercard..."
										/>
									</div>
									<div>
										<label htmlFor="cardModalLast4" className="block text-sm font-medium text-ink-2 mb-1">
											Últimos 4 dígitos
										</label>
										<input
											id="cardModalLast4"
											name="last4"
											type="text"
											required
											minLength={4}
											maxLength={4}
											pattern="\d{4}"
											inputMode="numeric"
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											placeholder="1234"
										/>
									</div>
									<div>
										<label htmlFor="cardModalHolder" className="block text-sm font-medium text-ink-2 mb-1">
											Nome no Cartão
										</label>
										<input
											id="cardModalHolder"
											name="holder"
											type="text"
											required
											minLength={3}
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											placeholder="COMO NO CARTÃO"
										/>
									</div>
									<div>
										<label htmlFor="cardModalExpiry" className="block text-sm font-medium text-ink-2 mb-1">
											Validade
										</label>
										<input
											id="cardModalExpiry"
											name="expiry"
											type="text"
											required
											pattern="\d{2}/\d{2}"
											className="w-full border border-rule-2 rounded-lg px-4 py-2 focus-visible:outline-focus focus:border-accent outline-none"
											placeholder="MM/AA"
										/>
									</div>
								</div>
								<div className="mt-8 flex gap-3">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="flex-1 app-panel border border-rule-2 text-ink-2 font-semibold py-2 rounded-lg hover:bg-paper-2 transition"
									>
										Cancelar
									</button>
									<button
										type="submit"
										disabled={cardLoading}
										className="flex-1 bg-accent hover:opacity-90 text-white font-bold py-2 rounded-lg transition disabled:opacity-60"
									>
										{cardLoading ? "Salvando..." : "Salvar Cartão"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
