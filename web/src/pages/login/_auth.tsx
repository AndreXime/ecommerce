import { toast } from "@/lib/toast";
import { useState } from "preact/hooks";
import { Eye, EyeOff } from "lucide-preact";
import { request } from "@/lib/request";

interface AuthResponse {
	message: string;
	role: "ADMIN" | "CUSTOMER" | "SUPPORT";
}

export default function Auth() {
	const [activeTab, setActiveTab] = useState<"login" | "register">("login");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		const response = await request.post<AuthResponse>("/auth/login", { email, password });

		if (!response.ok) {
			if (response.errors) {
				response.errors.forEach((error) => toast.error(error.message));
			} else {
				toast.error(response.message);
			}
		} else {
			toast.success("Login feito com sucesso");
			window.location.href = response.data.role === "ADMIN" ? "/admin" : "/perfil";
		}

		setLoading(false);
	};

	const handleRegister = async (e: SubmitEvent) => {
		e.preventDefault();
		setLoading(true);

		const formData = new FormData(e.currentTarget as HTMLFormElement);
		const name = formData.get("name") as string;
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		const response = await request.post<AuthResponse>("/auth/register", {
			name,
			email,
			password,
			confirmPassword,
		});

		if (!response.ok) {
			if (response.errors) {
				response.errors.forEach((error) => toast.error(error.message));
			} else {
				toast.error(response.message);
			}
		} else {
			toast.success("Registro feito com sucesso");
			window.location.href = response.data.role === "ADMIN" ? "/admin" : "/perfil";
		}

		setLoading(false);
	};

	const tabClass = (tab: "login" | "register") =>
		`flex-1 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
			activeTab === tab ? "text-accent border-b-2 border-accent" : "text-muted hover:text-ink"
		}`;

	return (
		<div class="app-panel w-full max-w-md overflow-hidden">
			<div class="flex border-b border-rule" role="tablist">
				<button type="button" role="tab" aria-selected={activeTab === "login"} onClick={() => setActiveTab("login")} class={tabClass("login")}>
					Entrar
				</button>
				<button type="button" role="tab" aria-selected={activeTab === "register"} onClick={() => setActiveTab("register")} class={tabClass("register")}>
					Cadastrar
				</button>
			</div>

			<div class="p-6 sm:p-8 min-h-[28rem]">
				{activeTab === "login" && (
					<div>
						<h2 class="font-display font-semibold text-xl text-ink mb-1">Bem-vindo de volta</h2>
						<p class="text-sm text-muted mb-6">Acesse sua conta para ver pedidos e favoritos.</p>

						<form onSubmit={handleLogin} class="space-y-4">
							<div>
								<label htmlFor="login-email" class="block text-sm font-medium text-ink-2 mb-1.5">
									Email
								</label>
								<input type="email" name="email" id="login-email" class="input" placeholder="seu@email.com" required />
							</div>
							<div>
								<div class="flex justify-between items-center mb-1.5">
									<label htmlFor="login-pass" class="block text-sm font-medium text-ink-2">
										Senha
									</label>
									<a href="/" class="text-xs text-accent hover:underline">
										Esqueceu a senha?
									</a>
								</div>
								<div class="relative">
									<input
										type={showPassword ? "text" : "password"}
										id="login-pass"
										name="password"
										class="input !pr-11"
										placeholder="••••••••"
										required
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

							<label class="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
								<input name="remember" type="checkbox" id="remember" class="rounded border-rule-2 text-accent focus:ring-accent" />
								Lembrar de mim
							</label>

							<button type="submit" disabled={loading} class="btn btn-primary w-full !py-3 mt-2">
								{loading ? "Carregando..." : "Entrar"}
							</button>
						</form>

						<p class="text-center text-sm text-muted mt-6">
							Não tem uma conta?
							<button type="button" onClick={() => setActiveTab("register")} class="text-accent font-semibold hover:underline ml-1">
								Cadastre-se
							</button>
						</p>
					</div>
				)}

				{activeTab === "register" && (
					<div>
						<h2 class="font-display font-semibold text-xl text-ink mb-1">Criar conta</h2>
						<p class="text-sm text-muted mb-6">Preencha seus dados para começar a comprar.</p>

						<form onSubmit={handleRegister} class="space-y-4">
							<div>
								<label htmlFor="reg-name" class="block text-sm font-medium text-ink-2 mb-1.5">
									Nome completo
								</label>
								<input type="text" name="name" id="reg-name" class="input" placeholder="Ex: Maria Silva" required />
							</div>
							<div>
								<label htmlFor="reg-email" class="block text-sm font-medium text-ink-2 mb-1.5">
									Email
								</label>
								<input type="email" name="email" id="reg-email" class="input" placeholder="seu@email.com" required />
							</div>
							<div>
								<label htmlFor="reg-pass" class="block text-sm font-medium text-ink-2 mb-1.5">
									Senha
								</label>
								<input type="password" name="password" id="reg-pass" class="input" placeholder="Mínimo 8 caracteres" required minLength={8} />
							</div>
							<div>
								<label htmlFor="reg-confirm" class="block text-sm font-medium text-ink-2 mb-1.5">
									Confirmar senha
								</label>
								<input type="password" name="confirmPassword" id="reg-confirm" class="input" placeholder="Confirme sua senha" required />
							</div>

							<label class="flex items-start gap-2 text-sm text-ink-2 cursor-pointer">
								<input type="checkbox" id="terms" required class="mt-1 rounded border-rule-2 text-accent focus:ring-accent" />
								<span>
									Eu li e concordo com os{" "}
									<a href="/" class="text-accent hover:underline">
										Termos de Uso
									</a>{" "}
									e{" "}
									<a href="/" class="text-accent hover:underline">
										Política de Privacidade
									</a>
									.
								</span>
							</label>

							<button type="submit" disabled={loading} class="btn btn-primary w-full !py-3 mt-2">
								{loading ? "Carregando..." : "Criar conta"}
							</button>
						</form>

						<p class="text-center text-sm text-muted mt-6">
							Já tem uma conta?
							<button type="button" onClick={() => setActiveTab("login")} class="text-accent font-semibold hover:underline ml-1">
								Fazer login
							</button>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
