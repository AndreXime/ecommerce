type ToastType = "success" | "error" | "info";

export interface ToastDetail {
	message: string;
	type: ToastType;
}

function notify(message: string, type: ToastType = "success") {
	const event = new CustomEvent("toast", {
		detail: { message, type },
	});
	window.dispatchEvent(event);
}

export const toast = {
	success: (message: string) => notify(message, "success"),
	error: (message: string) => notify(message, "error"),
	info: (message: string) => notify(message, "info"),
};
