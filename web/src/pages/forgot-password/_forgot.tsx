import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { request } from "@/lib/request";

export default function ForgotPasswordForm() {
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const email = formData.get("email") as string;

		const response = await request.post<{ message: string }>("/auth/forgot-password", { email });

		if (!response.ok) {
			if (response.errors) {
				response.errors.forEach((error) => toast.error(error.message));
			} else {
				toast.error(response.message);
			}
		} else {
			setSent(true);
			toast.success(response.message || "Se o e-mail existir, enviaremos as instruções.");
		}

		setLoading(false);
	};

	return (
		<div class="app-panel w-full max-w-md overflow-hidden">
			<div class="p-6 sm:p-8">
				<h2 class="font-display font-semibold text-xl text-ink mb-1">Recuperar senha</h2>
				<p class="text-sm text-muted mb-6">
					Informe o e-mail da sua conta. Se existir, enviaremos um link para redefinir a senha.
				</p>

				{sent ? (
					<div class="space-y-4">
						<p class="text-sm text-ink-2">
							Se esse e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também a pasta de spam.
						</p>
						<a href="/login" class="btn btn-primary w-full !py-3 text-center">
							Voltar ao login
						</a>
					</div>
				) : (
					<form onSubmit={handleSubmit} class="space-y-4">
						<div>
							<label htmlFor="forgot-email" class="block text-sm font-medium text-ink-2 mb-1.5">
								Email
							</label>
							<input
								type="email"
								name="email"
								id="forgot-email"
								class="input"
								placeholder="seu@email.com"
								required
								autocomplete="email"
							/>
						</div>

						<button type="submit" disabled={loading} class="btn btn-primary w-full !py-3 mt-2">
							{loading ? "Enviando..." : "Enviar link"}
						</button>
					</form>
				)}

				{!sent && (
					<p class="text-center text-sm text-muted mt-6">
						<a href="/login" class="text-accent font-semibold hover:underline">
							Voltar ao login
						</a>
					</p>
				)}
			</div>
		</div>
	);
}
