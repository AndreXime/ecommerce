interface FetchOptions extends RequestInit {
	params?: Record<string, string | undefined | null | number>;
	formData?: boolean;
}

export interface ApiValidationError {
	param: string;
	message: string;
}

export type ApiErrorType = ApiValidationError[] | null;

export interface SuccessResponse<T> {
	ok: true;
	data: T;
	message: string;
	error: null;
}

export interface ErrorResponse {
	ok: false;
	data: null;
	message: string;
	errors: ApiErrorType;
}

export type ServiceResponse<T> = SuccessResponse<T> | ErrorResponse;

interface BackendErrorResponse {
	message?: string;
	error?: string;
	errors?: ApiValidationError[];
}

class Request {
	private baseURL = import.meta.env.PUBLIC_API_URL as string;

	private async request<T>(path: string, options: FetchOptions = {}): Promise<ServiceResponse<T>> {
		const safePath = path.startsWith("/") ? path : `/${path}`;
		const urlString = path.startsWith("http") ? path : `${this.baseURL}${safePath}`;
		const url = new URL(urlString);

		if (options.params) {
			for (const [key, value] of Object.entries(options.params)) {
				if (value) {
					url.searchParams.append(key, String(value));
				}
			}
		}

		const headers = new Headers(options.headers);
		if (!options.formData && !headers.has("Content-Type")) {
			headers.set("Content-Type", "application/json");
		}

		let response: Response;

		try {
			response = await fetch(url, {
				...options,
				headers,
				credentials: "include",
			});
		} catch {
			return {
				ok: false,
				data: null,
				message: "Erro de conexão. Verifique sua internet.",
				errors: [],
			};
		}

		// Tenta ler o body (pode ser JSON, Texto ou Vazio)
		let responseBody: unknown = null;
		try {
			const text = await response.text();
			if (text) responseBody = JSON.parse(text);
		} catch {
			responseBody = null;
		}

		console.log(`[HTTP] ${response.status} ${url.pathname}`, responseBody);

		if (!response.ok) {
			const errorData = responseBody as BackendErrorResponse | null;

			let errorMessage = "Ocorreu um erro ao processar a requisição.";
			if (errorData?.message) errorMessage = errorData.message;
			else if (typeof responseBody === "string") errorMessage = responseBody;

			let validationErrors: ApiValidationError[] | null = null;

			if (errorData?.errors && Array.isArray(errorData.errors)) {
				validationErrors = errorData.errors;
			}

			return {
				ok: false,
				data: null,
				message: errorMessage,
				errors: validationErrors,
			};
		}

		return {
			ok: true,
			data: responseBody as T,
			error: null,
			message: "",
		};
	}

	async get<T>(path: string, options?: FetchOptions): Promise<ServiceResponse<T>> {
		return this.request<T>(path, { ...options, method: "GET" });
	}

	async post<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<ServiceResponse<T>> {
		const isFormData = options.formData;

		return this.request<T>(path, {
			...options,
			method: "POST",
			body: isFormData ? (data as BodyInit) : JSON.stringify(data),
		});
	}

	async put<T>(path: string, data?: unknown, options: FetchOptions = {}): Promise<ServiceResponse<T>> {
		const isFormData = options.formData;
		return this.request<T>(path, {
			...options,
			method: "PUT",
			body: isFormData ? (data as BodyInit) : JSON.stringify(data),
		});
	}

	async patch<T>(path: string, data?: unknown, options?: RequestInit): Promise<ServiceResponse<T>> {
		return this.request<T>(path, {
			...options,
			method: "PATCH",
			body: JSON.stringify(data),
		});
	}

	async delete<T>(path: string, data?: unknown, options?: RequestInit): Promise<ServiceResponse<T>> {
		return this.request<T>(path, { ...options, method: "DELETE", body: JSON.stringify(data) });
	}
}

export const request = new Request();
