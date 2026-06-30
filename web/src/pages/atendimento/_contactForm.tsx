import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { Loader2, Send } from "lucide-preact";

const SUPPORT_EMAIL = "contato@lojasximenes.com";

const topics = [
	{ value: "pedido", label: "Pedido ou entrega" },
	{ value: "pagamento", label: "Pagamento" },
	{ value: "troca", label: "Troca ou devolução" },
	{ value: "produto", label: "Produto ou garantia" },
	{ value: "conta", label: "Conta e login" },
	{ value: "outro", label: "Outro assunto" },
] as const;

export default function ContactForm() {
	const [loading, setLoading] = useState(false);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		const name = String(data.get("name") ?? "").trim();
		const email = String(data.get("email") ?? "").trim();
		const topic = String(data.get("topic") ?? "");
		const orderId = String(data.get("orderId") ?? "").trim();
		const message = String(data.get("message") ?? "").trim();

		const topicLabel = topics.find((t) => t.value === topic)?.label ?? "Atendimento";
		const subject = encodeURIComponent(`[${topicLabel}] Contato via site`);
		const body = encodeURIComponent(
			[
				`Nome: ${name}`,
				`Email: ${email}`,
				`Assunto: ${topicLabel}`,
				orderId ? `Pedido: ${orderId}` : null,
				"",
				message,
			]
				.filter((line) => line !== null)
				.join("\n"),
		);

		window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
		toast.info("Abrindo seu cliente de email com a mensagem preenchida.");

		setTimeout(() => setLoading(false), 600);
	};

	return (
		<form onSubmit={handleSubmit} class="space-y-5">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label htmlFor="contact-name" class="block text-sm font-medium text-ink-2 mb-1.5">
						Nome completo
					</label>
					<input type="text" id="contact-name" name="name" class="input" placeholder="Seu nome" required autoComplete="name" />
				</div>
				<div>
					<label htmlFor="contact-email" class="block text-sm font-medium text-ink-2 mb-1.5">
						Email
					</label>
					<input
						type="email"
						id="contact-email"
						name="email"
						class="input"
						placeholder="seu@email.com"
						required
						autoComplete="email"
					/>
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label htmlFor="contact-topic" class="block text-sm font-medium text-ink-2 mb-1.5">
						Assunto
					</label>
					<select id="contact-topic" name="topic" class="input appearance-none cursor-pointer" required defaultValue="">
						<option value="" disabled>
							Selecione um tema
						</option>
						{topics.map((topic) => (
							<option key={topic.value} value={topic.value}>
								{topic.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="contact-order" class="block text-sm font-medium text-ink-2 mb-1.5">
						Número do pedido <span class="text-muted font-normal">(opcional)</span>
					</label>
					<input type="text" id="contact-order" name="orderId" class="input" placeholder="Ex: PED-12345" />
				</div>
			</div>

			<div>
				<label htmlFor="contact-message" class="block text-sm font-medium text-ink-2 mb-1.5">
					Mensagem
				</label>
				<textarea
					id="contact-message"
					name="message"
					class="input min-h-[9rem] resize-y"
					placeholder="Descreva sua dúvida ou problema com o máximo de detalhes possível."
					required
					minLength={20}
				/>
				<p class="text-xs text-muted mt-1.5">Mínimo de 20 caracteres.</p>
			</div>

			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
				<p class="text-xs text-muted max-w-md">
					Ao enviar, seu cliente de email abrirá com a mensagem pronta para{" "}
					<a href={`mailto:${SUPPORT_EMAIL}`} class="text-accent hover:underline">
						{SUPPORT_EMAIL}
					</a>
					.
				</p>
				<button type="submit" disabled={loading} class="btn btn-primary !px-6 shrink-0">
					{loading ? (
						<>
							<Loader2 class="w-4 h-4 animate-spin" aria-hidden="true" />
							Abrindo...
						</>
					) : (
						<>
							Enviar mensagem
							<Send class="w-4 h-4" aria-hidden="true" />
						</>
					)}
				</button>
			</div>
		</form>
	);
}
