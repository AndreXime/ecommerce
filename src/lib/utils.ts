export const calculateOldPrice = (price: number, discountPercentage?: number): number => {
	if (!discountPercentage) return price;
	return price / (1 - discountPercentage / 100);
};

export const formatPrice = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
