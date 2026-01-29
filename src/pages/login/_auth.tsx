import { toast } from "@/lib/toast";
import { actions } from "astro:actions";
import { useState } from "preact/hooks";
import { Icon } from "astro-icon/components";

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
		const rememberMe = formData.get("remember") === "on";

		const { data, error } = await actions.login({ email, password, rememberMe });

		if (error) {
			toast.error(`Erro ao entrar: ${error.message}`);
		} else if (data?.success) {
			window.location.href = "/perfil";
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

		const { data, error } = await actions.register({
			name,
			email,
			password,
			confirmPassword,
		});

		if (error) {
			toast.error(`Erro no cadastro: ${error.message || "Dados inválidos"}`);
		} else if (data?.success) {
			window.location.href = "/perfil";
		}

		setLoading(false);
	};

	return (
		<div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
			<div className="flex border-b border-gray-100">
				<button
					onClick={() => setActiveTab("login")}
					className={`w-1/2 py-4 text-sm font-semibold transition-colors duration-300 focus:outline-none ${activeTab === "login" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
				>
					Entrar
				</button>
				<button
					onClick={() => setActiveTab("register")}
					className={`w-1/2 py-4 text-sm font-semibold transition-colors duration-300 focus:outline-none ${activeTab === "register" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-blue-600"}`}
				>
					Cadastrar
				</button>
			</div>

			<div className="p-8 min-h-[500px]">
				{activeTab === "login" && (
					<div className="animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
						<p className="text-sm text-gray-500 mb-6">Acesse sua conta para ver seus pedidos e favoritos.</p>

						<div className="grid gap-3 mb-6">
							<button
								type="button"
								className="flex items-center justify-center py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700"
							>
								<img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
								Google
							</button>
						</div>

						<div className="relative mb-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-200"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-400">Ou continue com email</span>
							</div>
						</div>

						<form onSubmit={handleLogin}>
							<div className="space-y-4">
								<div>
									<label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										type="email"
										name="email"
										id="login-email"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
										placeholder="seu@email.com"
										required
									/>
								</div>
								<div>
									<div className="flex justify-between items-center mb-1">
										<label htmlFor="login-pass" className="block text-sm font-medium text-gray-700">
											Senha
										</label>
										<a href="/" className="text-xs text-blue-600 hover:underline">
											Esqueceu a senha?
										</a>
									</div>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											id="login-pass"
											name="password"
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
											placeholder="••••••••"
											required
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
										>
											{showPassword ? (
												<Icon name="lucide:eye-off" class="w-5 h-5" />
											) : (
												<Icon name="lucide:eye" class="w-5 h-5" />
											)}
										</button>
									</div>
								</div>
							</div>

							<div className="flex items-center mt-4 mb-6">
								<input
									name="remember"
									type="checkbox"
									id="remember"
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label htmlFor="remember" className="ml-2 block text-sm text-gray-600">
									Lembrar de mim
								</label>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
							>
								{loading ? "Carregando..." : "Entrar"}
							</button>
						</form>

						<p className="text-center text-sm text-gray-500 mt-6">
							Não tem uma conta?
							<button
								onClick={() => setActiveTab("register")}
								className="text-blue-600 font-semibold hover:underline ml-1"
							>
								Cadastre-se
							</button>
						</p>
					</div>
				)}

				{activeTab === "register" && (
					<div className="animate-fade-in">
						<h2 className="text-2xl font-bold text-gray-900 mb-2">Criar conta</h2>
						<p className="text-sm text-gray-500 mb-6">Preencha seus dados para começar a comprar.</p>

						<form onSubmit={handleRegister}>
							<div className="space-y-4">
								<div>
									<label htmlFor="reg-name" className="block text-sm font-medium text-gray-700 mb-1">
										Nome Completo
									</label>
									<input
										type="text"
										name="name"
										id="reg-name"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
										placeholder="Ex: Maria Silva"
										required
									/>
								</div>
								<div>
									<label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
										Email
									</label>
									<input
										type="email"
										name="email"
										id="reg-email"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
										placeholder="seu@email.com"
										required
									/>
								</div>
								<div>
									<label htmlFor="reg-pass" className="block text-sm font-medium text-gray-700 mb-1">
										Senha
									</label>
									<input
										type="password"
										name="password"
										id="reg-pass"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
										placeholder="Mínimo 8 caracteres"
										required
										minLength={8}
									/>
								</div>
								<div>
									<label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-700 mb-1">
										Confirmar Senha
									</label>
									<input
										type="password"
										name="confirmPassword"
										id="reg-confirm"
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition"
										placeholder="Confirme sua senha"
										required
									/>
								</div>
							</div>

							<div className="flex items-start mt-4 mb-6">
								<input
									type="checkbox"
									id="terms"
									required
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
								/>
								<label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
									Eu li e concordo com os
									<a href="/" className="text-blue-600 hover:underline">
										Termos de Uso
									</a>
									e
									<a href="/" className="text-blue-600 hover:underline">
										Política de Privacidade
									</a>
									.
								</label>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
							>
								{loading ? "Carregando..." : "Entrar"}
							</button>
						</form>

						<p className="text-center text-sm text-gray-500 mt-6">
							Já tem uma conta?
							<button
								onClick={() => setActiveTab("login")}
								className="text-blue-600 font-semibold hover:underline ml-1"
							>
								Fazer Login
							</button>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
