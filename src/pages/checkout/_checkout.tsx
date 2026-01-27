import { useState } from "preact/hooks";

interface CartItem {
	id: number;
	name: string;
	price: number;
	img: string;
	quantity: number;
}

interface OrderSummary {
	items: CartItem[];
	subtotal: number;
	shipping: number;
	total: number;
}

interface UserProfile {
	name: string;
	email: string;
}

interface CheckoutProps {
	initialOrder: OrderSummary; // Dados do carrinho
	user: UserProfile; // Dados do usuário logado
}

type PaymentMethod = "card" | "pix" | "boleto";

export default function Checkout({ initialOrder, user }: CheckoutProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

	const nextStep = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		setCurrentStep((prev) => prev + 1);
	};

	const prevStep = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
		setCurrentStep((prev) => prev - 1);
	};

	const getIndicatorClass = (stepNumber: number) => {
		if (stepNumber < currentStep) return "completed";
		if (stepNumber === currentStep) return "active";
		return "";
	};

	return (
		<div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
			<div className="flex-grow">
				{/* Indicador de Progresso */}
				<div className="max-w-4xl mx-auto mb-10">
					<div className="flex items-center justify-between relative">
						<div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
						{[1, 2, 3].map((step) => {
							const status = getIndicatorClass(step);
							let bgClass = "bg-white border-gray-300 text-gray-500";
							let textClass = "text-gray-400";

							if (status === "completed") {
								bgClass = "bg-green-500 border-green-500 text-white";
								textClass = "text-green-600";
							} else if (status === "active") {
								bgClass = "bg-blue-600 border-blue-600 text-white";
								textClass = "text-blue-600";
							}

							return (
								<div key={step} className={`flex flex-col items-center bg-gray-50 px-4`}>
									<div
										className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-colors duration-300 ${bgClass}`}
									>
										{status === "completed" ? <i className="fas fa-check"></i> : <span>{step}</span>}
									</div>
									<span className={`text-xs font-semibold mt-2 uppercase tracking-wide ${textClass}`}>
										{step === 1 ? "Envio" : step === 2 ? "Pagamento" : "Confirmação"}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* STEP 1: ENVIO */}
				{currentStep === 1 && (
					<div className="step-content active animate-fade-in">
						<h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
							<i className="far fa-map text-blue-600 mr-3"></i> Informações de Envio
						</h2>

						<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
							{/* Correção A11y: Adicionado htmlFor e id correspondentes */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
										Nome Completo
									</label>
									<input
										id="fullName"
										type="text"
										defaultValue={user.name}
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
									/>
								</div>
								<div>
									<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										id="email"
										type="email"
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										placeholder="joao@email.com"
									/>
								</div>
								<div>
									<label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
										CPF
									</label>
									<input
										id="cpf"
										type="text"
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										placeholder="000.000.000-00"
									/>
								</div>
								<div>
									<label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
										Telefone
									</label>
									<input
										id="phone"
										type="text"
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										placeholder="(00) 00000-0000"
									/>
								</div>
							</div>

							<div className="h-px bg-gray-100"></div>

							{/* Endereço */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="md:col-span-1">
									<label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
										CEP
									</label>
									<input
										id="cep"
										type="text"
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
										placeholder="00000-000"
									/>
								</div>
								<div className="md:col-span-2">
									<label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
										Rua / Avenida
									</label>
									<input
										id="street"
										type="text"
										className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
									/>
								</div>
							</div>

							{/* Opções de Frete - Nesting (Aqui o input está DENTRO do label, então não precisa de ID/For) */}
							<div>
								<span className="block text-sm font-medium text-gray-700 mb-3">Opções de Entrega</span>
								<div className="space-y-3">
									<label className="flex items-center justify-between border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition border-blue-500 bg-blue-50">
										<div className="flex items-center">
											<input
												type="radio"
												name="shipping"
												defaultChecked
												className="h-4 w-4 text-blue-600 focus:ring-blue-500"
											/>
											<div className="ml-3">
												<span className="block text-sm font-medium text-gray-900">Entrega Padrão</span>
												<span className="block text-xs text-gray-500">5 a 7 dias úteis</span>
											</div>
										</div>
										<span className="text-sm font-bold text-gray-900">Grátis</span>
									</label>
								</div>
							</div>

							<div className="pt-4 flex justify-end">
								<button
									onClick={nextStep}
									className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center"
								>
									Ir para Pagamento <i className="fas fa-arrow-right ml-2"></i>
								</button>
							</div>
						</div>
					</div>
				)}

				{/* STEP 2: PAGAMENTO */}
				{currentStep === 2 && (
					<div className="step-content active animate-fade-in">
						<div className="flex items-center mb-6">
							<button onClick={prevStep} className="text-gray-400 hover:text-gray-600 mr-4 transition">
								<i className="fas fa-arrow-left"></i>
							</button>
							<h2 className="text-xl font-bold text-gray-900 flex items-center">
								<i className="far fa-credit-card text-blue-600 mr-3"></i> Detalhes do Pagamento
							</h2>
						</div>

						<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
							<div className="grid grid-cols-3 gap-3 mb-6">
								<button
									onClick={() => setPaymentMethod("card")}
									className={`border rounded-lg p-3 text-center transition hover:border-blue-300 ${paymentMethod === "card" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200"}`}
								>
									<i className="far fa-credit-card text-xl mb-1 block"></i>
									<span className="text-sm font-medium">Cartão</span>
								</button>
								<button
									onClick={() => setPaymentMethod("pix")}
									className={`border rounded-lg p-3 text-center transition hover:border-blue-300 ${paymentMethod === "pix" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200"}`}
								>
									<i className="fas fa-qrcode text-xl mb-1 block"></i>
									<span className="text-sm font-medium">Pix</span>
								</button>
								<button
									onClick={() => setPaymentMethod("boleto")}
									className={`border rounded-lg p-3 text-center transition hover:border-blue-300 ${paymentMethod === "boleto" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200"}`}
								>
									<i className="fas fa-barcode text-xl mb-1 block"></i>
									<span className="text-sm font-medium">Boleto</span>
								</button>
							</div>

							{/* Conteúdo: Cartão - Correção A11y aqui também */}
							{paymentMethod === "card" && (
								<div className="space-y-4 animate-fade-in">
									<div>
										<label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
											Número do Cartão
										</label>
										<div className="relative">
											<input
												id="cardNumber"
												type="text"
												className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-blue-500 focus:border-blue-500 outline-none"
												placeholder="0000 0000 0000 0000"
											/>
											<div className="absolute left-3 top-2.5 text-gray-400">
												<i className="far fa-credit-card"></i>
											</div>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
												Validade
											</label>
											<input
												id="cardExpiry"
												type="text"
												className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
												placeholder="MM/AA"
											/>
										</div>
										<div>
											<label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 mb-1">
												CVV
											</label>
											<input
												id="cardCvv"
												type="text"
												className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
												placeholder="123"
											/>
										</div>
									</div>
								</div>
							)}

							{paymentMethod === "pix" && (
								<div className="text-center py-6 animate-fade-in">
									<div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-4 inline-block">
										<i className="fas fa-qrcode text-6xl text-gray-800"></i>
									</div>
									<p className="text-sm text-gray-600 mb-2">O código Pix será gerado após a finalização do pedido.</p>
									<p className="text-xs text-blue-600 font-semibold">
										<i className="fas fa-stopwatch mr-1"></i> Aprovação imediata
									</p>
								</div>
							)}

							{paymentMethod === "boleto" && (
								<div className="text-center py-6 animate-fade-in">
									<i className="fas fa-barcode text-5xl text-gray-400 mb-4"></i>
									<p className="text-sm text-gray-600 mb-2">O boleto será gerado na próxima tela.</p>
									<p className="text-xs text-orange-500 font-semibold">
										<i className="fas fa-clock mr-1"></i> Aprovação em 1 a 3 dias úteis
									</p>
								</div>
							)}

							<div className="h-px bg-gray-100 my-6"></div>

							<div className="flex justify-end">
								<button
									onClick={nextStep}
									className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center w-full md:w-auto justify-center"
								>
									Finalizar Pedido <i className="fas fa-check ml-2"></i>
								</button>
							</div>
						</div>
					</div>
				)}

				{/* STEP 3: CONFIRMAÇÃO */}
				{currentStep === 3 && (
					<div className="text-center py-8 animate-fade-in">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<i className="fas fa-check text-4xl text-green-600"></i>
						</div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">Pedido Recebido!</h2>
						<p className="text-gray-500 text-lg mb-8">Obrigado pela sua compra, André.</p>

						<div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-lg mx-auto mb-8 text-left">
							<div className="flex">
								<div className="flex-shrink-0">
									<i className="fas fa-info-circle text-yellow-600 text-xl"></i>
								</div>
								<div className="ml-4">
									<h3 className="text-sm font-bold text-yellow-800">
										Status: {paymentMethod === "card" ? "Processando Pagamento" : "Aguardando Pagamento"}
									</h3>
									<p className="text-sm text-yellow-700 mt-1">
										{paymentMethod === "pix"
											? "Use o QR Code gerado para pagar. O pedido será liberado imediatamente após."
											: "Estamos processando suas informações. Você receberá um e-mail de confirmação."}
									</p>
								</div>
							</div>
						</div>

						<a
							href="/index"
							className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition"
						>
							Voltar para a Loja
						</a>
					</div>
				)}
			</div>

			{/* Coluna da Direita: Resumo */}
			<div className={`w-full lg:w-1/3 flex-shrink-0 ${currentStep === 3 ? "hidden lg:block" : ""}`}>
				<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg sticky top-24">
					<h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Pedido</h3>

					<div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
						{initialOrder.items.map((item) => (
							<div key={item.id} className="flex gap-3">
								<div className="h-16 w-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
									<img src={item.img} alt={item.name} className="h-full w-full object-cover" />
								</div>
								<div className="flex-grow">
									<h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
									<p className="text-xs text-gray-500">Qtd: 1</p>
								</div>
								<span className="text-sm font-semibold text-gray-900">
									${item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
								</span>
							</div>
						))}
					</div>

					<div className="space-y-2 border-t border-gray-100 pt-4 mb-4">
						<div className="flex justify-between text-sm text-gray-600">
							<span>Subtotal</span>
							<span>${initialOrder.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-600">
							<span>Frete</span>
							<span className="text-green-600">Grátis</span>
						</div>
					</div>

					<div className="border-t border-gray-100 pt-4">
						<div className="flex justify-between items-center">
							<span className="text-base font-bold text-gray-900">Total</span>
							<span className="text-2xl font-bold text-blue-900">
								${initialOrder.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
