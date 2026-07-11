import { hashPassword } from "@/modules/auth/shared/hash";
import type { Prisma } from "../client/client";
import { database } from "../database";
import { generateSeedProductImages } from "./seedProductsImages";
import { getCategoryLabel, getCategorySlugs, loadSeedProducts, type SeedProduct, type SeedReview } from "./seedProductsData";
import { buildEmailToUserMap, loadSeedUsers } from "./seedUsersData";
import { uploadSeedUserAvatars } from "./seedUsersImages";

type LinkedUser = { id: string; avatar: string };

function toReviewCreateData(
	review: SeedReview,
	emailToUser: Map<string, LinkedUser>,
	linkedEmails: Set<string>,
): Prisma.ReviewUncheckedCreateWithoutProductInput {
	const linked = emailToUser.get(review.reviewerEmail);
	if (!linked) {
		throw new Error(`Usuário não encontrado para review: ${review.reviewerEmail}`);
	}
	if (linkedEmails.has(review.reviewerEmail)) {
		throw new Error(`Review duplicada para ${review.reviewerEmail} no mesmo produto`);
	}
	linkedEmails.add(review.reviewerEmail);

	return {
		author: review.author,
		initials: review.initials,
		rating: review.rating,
		title: review.title,
		content: review.content,
		date: review.date,
		userId: linked.id,
		avatar: linked.avatar,
	};
}

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
	emailToUser: Map<string, LinkedUser>,
) {
	const productImages = await generateSeedProductImages(products);

	for (const p of products) {
		const categoryId = categoryMap.get(p.categorySlug);
		if (!categoryId) {
			throw new Error(`Categoria não encontrada para slug "${p.categorySlug}"`);
		}

		const linkedEmails = new Set<string>();
		const { images: _, options, specs, categorySlug: __, reviews, ...data } = p;
		await tx.product.create({
			data: {
				...data,
				categoryId,
				specs,
				images: { create: productImages[p.tag] },
				...(options.length > 0 ? { options: { create: options } } : {}),
				...(reviews.length > 0
					? {
							reviews: {
								create: reviews.map((review) => toReviewCreateData(review, emailToUser, linkedEmails)),
							},
						}
					: {}),
			},
		});
	}
}

async function createUsers(tx: Prisma.TransactionClient) {
	const password = await hashPassword("123456");
	const jsonUsers = await loadSeedUsers();

	const users = [
		{
			email: "admin@example.com",
			password,
			name: "Admin Sistema",
			role: "ADMIN" as const,
			registration: "ADM-001",
			phone: "(11) 99999-0000",
		},
		...jsonUsers.map((user) => ({
			email: user.email,
			password,
			name: user.name,
			phone: user.phone,
			registration: user.registration,
			role: "CUSTOMER" as const,
		})),
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

				const jsonUsers = await uploadSeedUserAvatars(await loadSeedUsers());
				const products = await loadSeedProducts(jsonUsers);

				console.log("[seed] criando usuários...");
				const users = await createUsers(tx);
				const emailToUserId = new Map(users.map((user) => [user.email, user.id]));
				const emailToUser = buildEmailToUserMap(jsonUsers, emailToUserId);

				console.log("[seed] criando categorias...");
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
				await seedProducts(tx, categoryMap, products, emailToUser);

				console.log("[seed] criando transportadoras e métodos de frete...");
				await seedCarriers(tx);

				const customer = users.find((u) => u.role === "CUSTOMER");
				if (customer) {
					console.log(`[seed] criando endereço e cartão para "${customer.name}"...`);
					await tx.address.create({
						data: {
							userId: customer.id,
							type: "casa",
							street: "Rua das Flores, 123 - Jardim Primavera",
							city: "São Paulo",
							cep: "01310-100",
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

async function seedCarriers(tx: Prisma.TransactionClient) {
	// Hub no Carrier; preço/prazo no Method.
	// Calibração (~2300 km, SP → Sobral): PAC ~14d, SEDEX ~8d, Expresso ~5d.
	const spHub = { hubLat: -23.55, hubLng: -46.633 };

	const correios = await tx.carrier.create({
		data: {
			name: "Correios Mock",
			slug: "correios-mock",
			...spHub,
			methods: {
				create: [
					{
						name: "PAC",
						code: "pac",
						basePrice: 14,
						pricePerKm: 0.022,
						pricePerKg: 1.5,
						daysBase: 4,
						kmPerDay: 230,
					},
					{
						name: "SEDEX",
						code: "sedex",
						basePrice: 18,
						pricePerKm: 0.032,
						pricePerKg: 2,
						daysBase: 2,
						kmPerDay: 330,
					},
				],
			},
		},
	});

	await tx.carrier.create({
		data: {
			name: "Express Local",
			slug: "express-local",
			...spHub,
			methods: {
				create: [
					{
						name: "Expresso",
						code: "express",
						basePrice: 28,
						pricePerKm: 0.055,
						pricePerKg: 3,
						daysBase: 2,
						kmPerDay: 580,
					},
				],
			},
		},
	});

	return correios;
}

await seed();
