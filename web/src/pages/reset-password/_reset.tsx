import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { Eye, EyeOff } from "lucide-preact";
import { request } from "@/lib/request";

interface ResetPasswordFormProps {
	token: string | null;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	if (!token) {
		return (
			<div class="app-panel w-full max-w-md overflow-hidden">
				<div class="p-6 sm:p-8">
					<h2 class="font-display font-semibold text-xl text-ink mb-1">Link inválido</h2>
					<p class="text-sm text-muted mb-6">
						Este link de redefinição está incompleto ou expirado. Solicite um novo e-mail de recuperação.
					</p>
					<a href="/forgot-password" class="btn btn-primary w-full !py-3 text-center">
						Solicitar novo link
					</a>
					<p class="text-center text-sm text-muted mt-6">
						<a href="/login" class="text-accent font-semibold hover:underline">
							Voltar ao login
						</a>
					</p>
				</div>
			</div>
		);
	}

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		if (password !== confirmPassword) {
			toast.error("As senhas não coincidem.");
			setLoading(false);
			return;
		}

		const response = await request.post<{ message: string }>("/auth/reset-password", {
			token,
			password,
		});

		if (!response.ok) {
			if (response.errors) {
				response.errors.forEach((error) => toast.error(error.message));
			} else {
				toast.error(response.message);
			}
			setLoading(false);
			return;
		}

		toast.success(response.message || "Senha redefinida com sucesso.");
		window.location.href = "/login";
	};

	return (
		<div class="app-panel w-full max-w-md overflow-hidden">
			<div class="p-6 sm:p-8">
				<h2 class="font-display font-semibold text-xl text-ink mb-1">Nova senha</h2>
				<p class="text-sm text-muted mb-6">Escolha uma nova senha para acessar sua conta.</p>

				<form onSubmit={handleSubmit} class="space-y-4">
					<div>
						<label htmlFor="reset-pass" class="block text-sm font-medium text-ink-2 mb-1.5">
							Nova senha
						</label>
						<div class="relative">
							<input
								type={showPassword ? "text" : "password"}
								id="reset-pass"
								name="password"
								class="input !pr-11"
								placeholder="Mínimo 6 caracteres"
								required
								minLength={6}
								autocomplete="new-password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus rounded"
								aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
							>
								{showPassword ? <EyeOff class="w-5 h-5" /> : <Eye class="w-5 h-5" />}
							</button>
						</div>
					</div>

					<div>
						<label htmlFor="reset-confirm" class="block text-sm font-medium text-ink-2 mb-1.5">
							Confirmar senha
						</label>
						<input
							type={showPassword ? "text" : "password"}
							id="reset-confirm"
							name="confirmPassword"
							class="input"
							placeholder="Confirme a nova senha"
							required
							minLength={6}
							autocomplete="new-password"
						/>
					</div>

					<button type="submit" disabled={loading} class="btn btn-primary w-full !py-3 mt-2">
						{loading ? "Salvando..." : "Redefinir senha"}
					</button>
				</form>

				<p class="text-center text-sm text-muted mt-6">
					<a href="/login" class="text-accent font-semibold hover:underline">
						Voltar ao login
					</a>
				</p>
			</div>
		</div>
	);
}
