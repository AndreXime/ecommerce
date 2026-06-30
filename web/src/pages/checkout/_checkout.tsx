import { formatPrice } from "@/lib/utils";
import { useState } from "preact/hooks";
import { Check, MapPin, ArrowRight, ArrowLeft, CreditCard, QrCode, Barcode, Timer, Clock, Info } from "lucide-preact";

interface CartItem {
	id: string;
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
	initialOrder: OrderSummary;
	user: UserProfile;
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

	const stepDotClass = (step: number) => {
		if (step < currentStep) return "bg-success border-success text-accent-ink";
		if (step === currentStep) return "bg-accent border-accent text-accent-ink";
		return "bg-paper border-rule-2 text-muted";
	};

	const stepLabelClass = (step: number) => {
		if (step < currentStep) return "text-success";
		if (step === currentStep) return "text-accent";
		return "text-muted";
	};

	const paymentTabClass = (method: PaymentMethod) =>
		`border rounded-[var(--radius-input)] p-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
			paymentMethod === method
				? "border-accent bg-accent-soft text-accent"
				: "border-rule hover:border-rule-2 text-ink-2"
		}`;

	return (
		<div class="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto min-w-0">
			<div class="flex-grow min-w-0">
				<nav class="mb-10" aria-label="Etapas do checkout">
					<ol class="flex items-center justify-between relative">
						<div class="absolute left-0 top-5 w-full h-px bg-rule -z-10" aria-hidden="true" />
						{[1, 2, 3].map((step) => (
							<li key={step} class="flex flex-col items-center gap-2 bg-paper px-2">
								<span
									class={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-colors ${stepDotClass(step)}`}
								>
									{step < currentStep ? <Check class="w-5 h-5" aria-hidden="true" /> : step}
								</span>
								<span class={`text-xs font-medium uppercase tracking-wide ${stepLabelClass(step)}`}>
									{step === 1 ? "Envio" : step === 2 ? "Pagamento" : "Confirmação"}
								</span>
							</li>
						))}
					</ol>
				</nav>

				{currentStep === 1 && (
					<section>
						<h2 class="font-display font-semibold text-lg text-ink mb-6 flex items-center gap-2">
							<MapPin class="text-accent" size={20} aria-hidden="true" /> Informações de envio
						</h2>

						<div class="app-panel p-6 space-y-6">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="fullName" class="block text-sm font-medium text-ink-2 mb-1.5">
										Nome completo
									</label>
									<input id="fullName" type="text" defaultValue={user.name} class="input" />
								</div>
								<div>
									<label htmlFor="email" class="block text-sm font-medium text-ink-2 mb-1.5">
										Email
									</label>
									<input id="email" type="email" defaultValue={user.email} class="input" placeholder="joao@email.com" />
								</div>
								<div>
									<label htmlFor="cpf" class="block text-sm font-medium text-ink-2 mb-1.5">
										CPF
									</label>
									<input id="cpf" type="text" class="input" placeholder="000.000.000-00" />
								</div>
								<div>
									<label htmlFor="phone" class="block text-sm font-medium text-ink-2 mb-1.5">
										Telefone
									</label>
									<input id="phone" type="text" class="input" placeholder="(00) 00000-0000" />
								</div>
							</div>

							<hr class="section-rule" />

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label htmlFor="cep" class="block text-sm font-medium text-ink-2 mb-1.5">
										CEP
									</label>
									<input id="cep" type="text" class="input" placeholder="00000-000" />
								</div>
								<div class="md:col-span-2">
									<label htmlFor="street" class="block text-sm font-medium text-ink-2 mb-1.5">
										Rua / Avenida
									</label>
									<input id="street" type="text" class="input" />
								</div>
							</div>

							<fieldset>
								<legend class="block text-sm font-medium text-ink-2 mb-3">Opções de entrega</legend>
								<label class="flex items-center justify-between border border-accent bg-accent-soft p-4 rounded-[var(--radius-card)] cursor-pointer">
									<div class="flex items-center gap-3">
										<input type="radio" name="shipping" defaultChecked class="text-accent focus:ring-accent" />
										<div>
											<span class="block text-sm font-medium text-ink">Entrega padrão</span>
											<span class="block text-xs text-muted">5 a 7 dias úteis</span>
										</div>
									</div>
									<span class="text-sm font-semibold text-success">Grátis</span>
								</label>
							</fieldset>

							<div class="flex justify-end pt-2">
								<button type="button" onClick={nextStep} class="btn btn-primary !px-6">
									Ir para pagamento <ArrowRight class="w-4 h-4" aria-hidden="true" />
								</button>
							</div>
						</div>
					</section>
				)}

				{currentStep === 2 && (
					<section>
						<div class="flex items-center gap-3 mb-6">
							<button
								type="button"
								onClick={prevStep}
								class="p-2 text-muted hover:text-ink rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
								aria-label="Voltar"
							>
								<ArrowLeft class="w-5 h-5" />
							</button>
							<h2 class="font-display font-semibold text-lg text-ink flex items-center gap-2">
								<CreditCard class="text-accent" size={20} aria-hidden="true" /> Detalhes do pagamento
							</h2>
						</div>

						<div class="app-panel p-6">
							<div class="grid grid-cols-3 gap-2 mb-6" role="tablist">
								<button type="button" role="tab" aria-selected={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} class={paymentTabClass("card")}>
									<CreditCard class="mx-auto mb-1 w-5 h-5" aria-hidden="true" />
									<span class="text-xs font-medium">Cartão</span>
								</button>
								<button type="button" role="tab" aria-selected={paymentMethod === "pix"} onClick={() => setPaymentMethod("pix")} class={paymentTabClass("pix")}>
									<QrCode class="mx-auto mb-1 w-5 h-5" aria-hidden="true" />
									<span class="text-xs font-medium">Pix</span>
								</button>
								<button type="button" role="tab" aria-selected={paymentMethod === "boleto"} onClick={() => setPaymentMethod("boleto")} class={paymentTabClass("boleto")}>
									<Barcode class="mx-auto mb-1 w-5 h-5" aria-hidden="true" />
									<span class="text-xs font-medium">Boleto</span>
								</button>
							</div>

							{paymentMethod === "card" && (
								<div class="space-y-4">
									<div>
										<label htmlFor="cardNumber" class="block text-sm font-medium text-ink-2 mb-1.5">
											Número do cartão
										</label>
										<div class="relative">
											<input id="cardNumber" type="text" class="input !pl-10" placeholder="0000 0000 0000 0000" />
											<CreditCard class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
										</div>
									</div>
									<div class="grid grid-cols-2 gap-4">
										<div>
											<label htmlFor="cardExpiry" class="block text-sm font-medium text-ink-2 mb-1.5">
												Validade
											</label>
											<input id="cardExpiry" type="text" class="input" placeholder="MM/AA" />
										</div>
										<div>
											<label htmlFor="cardCvv" class="block text-sm font-medium text-ink-2 mb-1.5">
												CVV
											</label>
											<input id="cardCvv" type="text" class="input" placeholder="123" />
										</div>
									</div>
								</div>
							)}

							{paymentMethod === "pix" && (
								<div class="text-center py-6">
									<div class="inline-flex p-6 rounded-[var(--radius-card)] bg-accent-soft border border-rule mb-4">
										<QrCode class="w-14 h-14 text-ink" aria-hidden="true" />
									</div>
									<p class="text-sm text-ink-2 mb-2">O código Pix será gerado após a finalização do pedido.</p>
									<p class="text-xs text-accent font-medium flex items-center justify-center gap-1">
										<Timer size={14} aria-hidden="true" /> Aprovação imediata
									</p>
								</div>
							)}

							{paymentMethod === "boleto" && (
								<div class="text-center py-6">
									<Barcode class="w-12 h-12 text-muted mb-4 mx-auto" aria-hidden="true" />
									<p class="text-sm text-ink-2 mb-2">O boleto será gerado na próxima tela.</p>
									<p class="text-xs text-warning font-medium flex items-center justify-center gap-1">
										<Clock size={14} aria-hidden="true" /> Aprovação em 1 a 3 dias úteis
									</p>
								</div>
							)}

							<hr class="section-rule my-6" />

							<button type="button" onClick={nextStep} class="btn btn-success w-full md:w-auto md:ml-auto md:flex !px-6">
								Finalizar pedido <Check class="w-4 h-4" aria-hidden="true" />
							</button>
						</div>
					</section>
				)}

				{currentStep === 3 && (
					<section class="text-center py-6">
						<div class="w-16 h-16 bg-success-soft rounded-full flex items-center justify-center mx-auto mb-6">
							<Check class="text-success w-8 h-8" aria-hidden="true" />
						</div>
						<h2 class="font-display font-semibold text-display-s text-ink mb-2">Pedido recebido</h2>
						<p class="text-muted mb-8">Obrigado pela sua compra, {user.name.split(" ")[0]}.</p>

						<div class="app-panel p-5 max-w-lg mx-auto mb-8 text-left border-warning/30 bg-warning-soft">
							<div class="flex gap-3">
								<Info class="text-warning shrink-0 w-5 h-5" aria-hidden="true" />
								<div>
									<h3 class="text-sm font-semibold text-ink">
										Status: {paymentMethod === "card" ? "Processando pagamento" : "Aguardando pagamento"}
									</h3>
									<p class="text-sm text-ink-2 mt-1">
										{paymentMethod === "pix"
											? "Use o QR Code gerado para pagar. O pedido será liberado após confirmação."
											: "Você receberá um e-mail de confirmação em breve."}
									</p>
								</div>
							</div>
						</div>

						<a href="/" class="btn btn-primary !px-8">
							Voltar para a loja
						</a>
					</section>
				)}
			</div>

			<aside class={`w-full lg:w-72 shrink-0 min-w-0 ${currentStep === 3 ? "hidden lg:block" : ""}`}>
				<div class="app-panel p-5 lg:sticky lg:top-24">
					<h3 class="font-display font-semibold text-ink mb-4">Resumo do pedido</h3>

					<ul class="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
						{initialOrder.items.map((item) => (
							<li key={item.id} class="flex gap-3 min-w-0">
								<div class="h-14 w-14 bg-paper-3 rounded-[var(--radius-input)] overflow-hidden shrink-0 border border-rule">
									<img src={item.img} alt={item.name} class="h-full w-full object-cover" />
								</div>
								<div class="flex-grow min-w-0">
									<p class="text-sm font-medium text-ink truncate">{item.name}</p>
									<p class="text-xs text-muted">Qtd: {item.quantity}</p>
								</div>
								<span class="text-sm font-semibold text-ink shrink-0">{formatPrice(item.price * item.quantity)}</span>
							</li>
						))}
					</ul>

					<hr class="section-rule mb-4" />
					<div class="space-y-2 text-sm mb-4">
						<div class="flex justify-between text-muted">
							<span>Subtotal</span>
							<span>{formatPrice(initialOrder.subtotal)}</span>
						</div>
						<div class="flex justify-between text-muted">
							<span>Frete</span>
							<span class="text-success font-medium">Grátis</span>
						</div>
					</div>
					<div class="flex justify-between items-center font-display font-semibold text-lg text-ink">
						<span>Total</span>
						<span>{formatPrice(initialOrder.total)}</span>
					</div>
				</div>
			</aside>
		</div>
	);
}
