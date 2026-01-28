import type { User } from "@/database/users";
import { useState, useEffect } from "preact/hooks";

type Tab = "orders" | "profile" | "addresses" | "payments" | "wishlist";

export default function AccountDashboard({ user }: { user: User }) {
	const [activeTab, setActiveTab] = useState<Tab>("orders");
	const [isModalOpen, setIsModalOpen] = useState(false);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsModalOpen(false);
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, []);

	useEffect(() => {
		document.body.style.overflow = isModalOpen ? "hidden" : "auto";
	}, [isModalOpen]);

	const handleModalClickOutside = (e: MouseEvent) => {
		if ((e.target as HTMLElement).id === "modal-overlay") {
			setIsModalOpen(false);
		}
	};

	return (
		<div className="flex flex-col md:flex-row gap-8">
			{/* SIDEBAR DE NAVEGAÇÃO */}
			<aside className="w-full md:w-1/4 flex-shrink-0">
				<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center gap-4">
					<div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-md capitalize">
						{user.personalData.name[0].toUpperCase()}
						{user.personalData.name[1].toUpperCase()}
					</div>
					<div>
						<h2 className="font-bold text-gray-900">{user.personalData.name}</h2>
						<p className="text-xs text-gray-500">Membro desde {user.personalData.registredAt.getFullYear()}</p>
					</div>
				</div>

				<nav className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					{[
						{ id: "orders", label: "Meus Pedidos", icon: "fas fa-box-open" },
						{ id: "profile", label: "Dados Pessoais", icon: "far fa-user" },
						{ id: "addresses", label: "Endereços", icon: "fas fa-map-marker-alt" },
						{ id: "payments", label: "Pagamentos", icon: "far fa-credit-card" },
						{ id: "wishlist", label: "Lista de Desejos", icon: "far fa-heart" },
					].map((item) => (
						<button
							key={item.id}
							onClick={() => setActiveTab(item.id as Tab)}
							className={`w-full text-left px-6 py-4 flex items-center transition border-l-4 ${activeTab === item.id ? "bg-blue-50 text-blue-600 border-blue-600" : "hover:bg-gray-50 text-gray-700 border-transparent"}`}
						>
							<i className={`${item.icon} w-6 text-center mr-3`}></i> {item.label}
						</button>
					))}
					<div className="h-px bg-gray-100 my-1"></div>
					<a
						href="/login"
						className="w-full text-left px-6 py-4 flex items-center text-red-500 hover:bg-red-50 transition"
					>
						<i className="fas fa-sign-out-alt w-6 text-center mr-3"></i> Sair
					</a>
				</nav>
			</aside>

			{/* CONTEÚDO DAS ABAS */}
			<div className="flex-grow w-full md:w-3/4">
				{/* ABA 1: MEUS PEDIDOS */}
				{activeTab === "orders" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Histórico de Pedidos</h2>
						{user.ordersHistory.map((order) => (
							<div key={order.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
								<div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
									<div className="flex gap-6 text-sm">
										<div>
											<span className="block text-gray-500 text-xs uppercase font-bold">Data</span>
											<span className="font-medium text-gray-900">{order.date}</span>
										</div>
										<div>
											<span className="block text-gray-500 text-xs uppercase font-bold">Total</span>
											<span className="font-medium text-gray-900">${order.total.toFixed(2)}</span>
										</div>
										<div>
											<span className="block text-gray-500 text-xs uppercase font-bold">Status</span>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
												{order.status}
											</span>
										</div>
									</div>
									<div className="text-sm text-gray-500">Pedido {order.id}</div>
								</div>
								<div className="p-6 space-y-4">
									{order.items.map((item, idx) => (
										<div
											key={idx}
											className={`flex items-center gap-4 ${idx > 0 ? "pt-4 border-t border-gray-100" : ""}`}
										>
											<img src={item.img} className="w-16 h-16 object-cover rounded-md bg-gray-100" alt={item.name} />
											<div className="flex-grow">
												<h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
												<p className="text-xs text-gray-500">{item.variant}</p>
											</div>
											<a href="/" className="text-blue-600 hover:underline text-sm font-medium">
												Ver Detalhes
											</a>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}

				{/* ABA 2: DADOS PESSOAIS - CORREÇÃO DE ACESSIBILIDADE APLICADA */}
				{activeTab === "profile" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Dados Pessoais</h2>
						<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
							<form>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
									<div>
										<label htmlFor="profileName" className="block text-sm font-medium text-gray-700 mb-1">
											Nome Completo
										</label>
										<input
											id="profileName"
											type="text"
											defaultValue={user.personalData.name}
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										/>
									</div>
									<div>
										<label htmlFor="profileEmail" className="block text-sm font-medium text-gray-700 mb-1">
											Email
										</label>
										<input
											id="profileEmail"
											type="email"
											defaultValue={user.personalData.email}
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
											readOnly
										/>
									</div>
									<div>
										<label htmlFor="profileCpf" className="block text-sm font-medium text-gray-700 mb-1">
											CPF
										</label>
										<input
											id="profileCpf"
											type="text"
											defaultValue={user.personalData.registration}
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
											readOnly
										/>
									</div>
									<div>
										<label htmlFor="profilePhone" className="block text-sm font-medium text-gray-700 mb-1">
											Telefone
										</label>
										<input
											id="profilePhone"
											type="text"
											defaultValue={user.personalData.phone}
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										/>
									</div>
								</div>
								<div className="flex justify-end">
									<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
										Salvar Alterações
									</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* ABA 3: ENDEREÇOS */}
				{activeTab === "addresses" && (
					<div className="space-y-6 animate-fade-in">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-2xl font-bold text-gray-900">Meus Endereços</h2>
							<button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center">
								<i className="fas fa-plus mr-2"></i> Novo Endereço
							</button>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{user.addresses.map((addr) => (
								<div
									key={addr.id}
									className={`bg-white p-6 rounded-xl border shadow-sm relative ${addr.isDefault ? "border-blue-500" : "border-gray-200 hover:border-gray-300 transition"}`}
								>
									{addr.isDefault && (
										<span className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
											Padrão
										</span>
									)}
									<div className="flex items-start gap-3 mb-3">
										<i className={`fas ${addr.type === "Casa" ? "fa-home" : "fa-building"} text-gray-400 mt-1`}></i>
										<div>
											<h4 className="font-bold text-gray-900">{addr.type}</h4>
											<p className="text-sm text-gray-600 mt-1">
												{addr.street}
												<br />
												{addr.city}
											</p>
										</div>
									</div>
									<div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
										{!addr.isDefault && (
											<button className="text-gray-500 hover:text-gray-700 font-medium">Definir como Padrão</button>
										)}
										<button className="text-blue-600 hover:underline font-medium">Editar</button>
										<button className="text-red-500 hover:underline font-medium">Excluir</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* ABA 4: PAGAMENTOS */}
				{activeTab === "payments" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Cartões Salvos</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{user.paymentCards.map((card) => (
								<div
									key={card.id}
									onClick={() => setIsModalOpen(true)}
									className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
								>
									<div className="absolute right-0 top-0 h-24 w-24 bg-white opacity-5 rounded-full transform translate-x-8 -translate-y-8"></div>
									<div className="flex justify-between items-start mb-8">
										<i className={`fab fa-cc-${card.brand} text-3xl`}></i>
										<div className="text-gray-400 hover:text-white transition">
											<i className="fas fa-edit"></i>
										</div>
									</div>
									<div className="font-mono text-xl tracking-widest mb-4">•••• •••• •••• {card.last4}</div>
									<div className="flex justify-between items-end text-sm text-gray-300">
										<div>
											<div className="text-xs text-gray-500 uppercase">Titular</div>
											<div>{card.holder}</div>
										</div>
										<div>
											<div className="text-xs text-gray-500 uppercase">Validade</div>
											<div>{card.expiry}</div>
										</div>
									</div>
								</div>
							))}

							{/* Trigger do Modal */}
							<div
								onClick={() => setIsModalOpen(true)}
								className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer h-full min-h-[180px]"
							>
								<i className="fas fa-plus-circle text-3xl mb-2"></i>
								<span className="font-medium">Adicionar Novo Cartão</span>
							</div>
						</div>
					</div>
				)}

				{/* ABA 5: LISTA DE DESEJOS */}
				{activeTab === "wishlist" && (
					<div className="space-y-6 animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">Lista de Desejos</h2>
						<div className="space-y-4">
							{user.wishlistProducts.map((item) => (
								<div
									key={item.id}
									className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 ${!item.inStock ? "opacity-75" : ""}`}
								>
									<div className="relative w-16 h-16 flex-shrink-0">
										<img
											src={item.image}
											className={`w-full h-full object-cover rounded-md ${!item.inStock ? "grayscale" : ""}`}
											alt={item.name}
										/>
										{!item.inStock && (
											<div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-md">
												<span className="text-[10px] font-bold bg-gray-800 text-white px-1 rounded">Esgotado</span>
											</div>
										)}
									</div>
									<div className="flex-grow">
										<h4 className={`font-bold ${item.inStock ? "text-gray-900" : "text-gray-500"}`}>{item.name}</h4>
										<p className={`text-sm mb-1 ${item.inStock ? "text-gray-500" : "text-gray-400"}`}>
											{item.category}
										</p>
										<span className={`font-bold ${item.inStock ? "text-gray-900" : "text-gray-400"}`}>
											${item.price.toFixed(2)}
										</span>
									</div>
									<div className="flex flex-col items-end gap-2">
										{item.inStock ? (
											<button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition whitespace-nowrap">
												Adicionar
											</button>
										) : (
											<button className="bg-gray-200 text-gray-400 text-sm px-4 py-2 rounded-lg cursor-not-allowed whitespace-nowrap">
												Indisponível
											</button>
										)}
										<button className="text-red-500 hover:underline text-xs">Remover</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>

			{/* MODAL DE CARTÃO - CORREÇÃO DE ACESSIBILIDADE APLICADA */}
			{isModalOpen && (
				<div
					id="modal-overlay"
					onClick={handleModalClickOutside}
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 animate-fade-overlay"
				>
					<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden m-4 animate-scale-in">
						<div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
							<h3 className="text-lg font-bold text-gray-900">Adicionar Cartão</h3>
							<button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
								<i className="fas fa-times text-xl"></i>
							</button>
						</div>
						<div className="p-6">
							<form
								onSubmit={(e) => {
									e.preventDefault();
									setIsModalOpen(false);
									alert("Cartão salvo!");
								}}
							>
								<div className="space-y-4">
									<div>
										<label htmlFor="cardModalNumber" className="block text-sm font-medium text-gray-700 mb-1">
											Número do Cartão
										</label>
										<div className="relative">
											<input
												id="cardModalNumber"
												type="text"
												className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-blue-500 focus:border-blue-500 outline-none"
												placeholder="0000 0000 0000 0000"
											/>
											<div className="absolute left-3 top-2.5 text-gray-400">
												<i className="far fa-credit-card"></i>
											</div>
										</div>
									</div>
									<div>
										<label htmlFor="cardModalHolder" className="block text-sm font-medium text-gray-700 mb-1">
											Nome no Cartão
										</label>
										<input
											id="cardModalHolder"
											type="text"
											className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
											placeholder="COMO NO CARTÃO"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label htmlFor="cardModalExpiry" className="block text-sm font-medium text-gray-700 mb-1">
												Validade
											</label>
											<input
												id="cardModalExpiry"
												type="text"
												className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
												placeholder="MM/AA"
											/>
										</div>
										<div>
											<label htmlFor="cardModalCvv" className="block text-sm font-medium text-gray-700 mb-1">
												CVV
											</label>
											<div className="relative">
												<input
													id="cardModalCvv"
													type="text"
													className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
													placeholder="123"
												/>
												<div className="absolute right-3 top-2.5 text-gray-400 cursor-help" title="3 dígitos no verso">
													<i className="far fa-question-circle"></i>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="mt-8 flex gap-3">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
									>
										Cancelar
									</button>
									<button
										type="submit"
										className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
									>
										Salvar Cartão
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
