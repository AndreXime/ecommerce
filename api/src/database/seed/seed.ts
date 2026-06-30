import { hashPassword } from "@/modules/auth/shared/hash";
import type { Prisma } from "../client/client";
import { database } from "../database";
import { generateSeedProductImages } from "./seedProductsImages";
import { getCategoryLabel, getCategorySlugs, loadSeedProducts, type SeedProduct } from "./seedProductsData";

async function seedCategories(tx: Prisma.TransactionClient, categorySlugs: string[]) {
	const names = categorySlugs.map((slug) => getCategoryLabel(slug));
	return tx.category.createManyAndReturn({
		data: names.map((name) => ({ name })),
		skipDuplicates: true,
	});
}

async function seedProducts(
	tx: Prisma.TransactionClient,
	categoryMap: Map<string, string>,
	products: SeedProduct[],
) {
	const productImages = await generateSeedProductImages(products);

	for (const p of products) {
		const categoryId = categoryMap.get(p.categorySlug);
		if (!categoryId) {
			throw new Error(`Categoria não encontrada para slug "${p.categorySlug}"`);
		}

		const { images: _, options, specs, categorySlug: __, ...data } = p;
		await tx.product.create({
			data: {
				...data,
				categoryId,
				specs,
				images: { create: productImages[p.tag] },
				...(options.length > 0 ? { options: { create: options } } : {}),
			},
		});
	}
}

async function seedUsers(tx: Prisma.TransactionClient) {
	const users = [
		{
			email: "admin@example.com",
			password: await hashPassword("123456"),
			name: "Admin Sistema",
			role: "ADMIN" as const,
			registration: "ADM-001",
			phone: "(11) 99999-0000",
		},
		{
			email: "user@example.com",
			password: await hashPassword("123456"),
			name: "João Silva",
			registration: "USR-001",
			phone: "(11) 98888-1111",
		},
		{
			email: "user2@example.com",
			password: await hashPassword("123456"),
			name: "André Ximenes",
			registration: "USR-002",
			phone: "(21) 97777-2222",
		},
	] satisfies Prisma.UserCreateInput[];

	return tx.user.createManyAndReturn({ data: users, skipDuplicates: true });
}

async function seed() {
	console.log("[seed] iniciando...");
	try {
		await database.$transaction(
			async (tx) => {
				const userCount = await tx.user.count();
				if (userCount > 0) {
					console.log("[seed] banco já populado, abortando.");
					return;
				}

				console.log("[seed] criando usuários...");
				const users = await seedUsers(tx);

				console.log("[seed] criando categorias...");
				const products = await loadSeedProducts();
				const categorySlugs = getCategorySlugs(products);
				const categories = await seedCategories(tx, categorySlugs);
				const categoryMap = new Map(
					categorySlugs.map((slug) => {
						const name = getCategoryLabel(slug);
						const category = categories.find((c) => c.name === name);
						if (!category) throw new Error(`Categoria "${name}" não foi criada`);
						return [slug, category.id] as const;
					}),
				);

				console.log("[seed] criando produtos...");
				await seedProducts(tx, categoryMap, products);

				const customer = users.find((u) => u.role === "CUSTOMER");
				if (customer) {
					console.log(`[seed] criando endereço e cartão para "${customer.name}"...`);
					await tx.address.create({
						data: {
							userId: customer.id,
							type: "casa",
							street: "Rua das Flores, 123 - Jardim Primavera",
							city: "São Paulo",
							isDefault: true,
						},
					});
					await tx.paymentCard.create({
						data: {
							userId: customer.id,
							brand: "Visa",
							last4: "4242",
							holder: customer.name.toUpperCase(),
							expiry: "12/28",
						},
					});
				}

				console.log("[seed] concluído com sucesso.");
			},
			{ maxWait: 5000, timeout: 300000 },
		);
	} catch (error) {
		console.error("Erro ao executar seed:\n", error);
		process.exit(1);
	}
}

await seed();
