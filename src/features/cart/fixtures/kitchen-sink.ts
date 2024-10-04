import type { Cart } from '../cart.ts';

const shirt = {
	id: 'c930f512-8b41-4dd3-94de-baf06686e1d6',
	quantity: 5,
	productVariantId: 'size-xs',
	productVariant: {
		id: 'size-xs',
		name: 'Size XS',
		stock: 50,
		options: {
			Size: 'XS',
		},
		product: {
			id: 'astro-icon-unisex-shirt',
			name: 'Astro Icon Unisex Shirt',
			slug: 'astro-icon-unisex-shirt',
			tagline: 'A comfy Tee with the classic Astro logo.',
			price: 1775,
			imageUrl: '/assets/astro-unisex-tshirt.png',
			variants: [
				{
					id: 'size-xs',
					name: 'Size XS',
					stock: 10,
					options: { Size: 'XS' },
				},
				{
					id: 'size-s',
					name: 'Size S',
					stock: 20,
					options: { Size: 'S' },
				},
				{
					id: 'size-m',
					name: 'Size M',
					stock: 30,
					options: { Size: 'M' },
				},
				{
					id: 'size-l',
					name: 'Size L',
					stock: 40,
					options: { Size: 'L' },
				},
				{
					id: 'size-xl',
					name: 'Size XL',
					stock: 50,
					options: { Size: 'XL' },
				},
			],
			collectionIds: ['apparel'],
			description: '',
			images: [],
			discount: 0,
			createdAt: '2024-09-20T20:09:51.523Z',
			updatedAt: '2024-09-20T20:09:51.523Z',
			deletedAt: null,
		},
	},
};

export const kitchenSinkFixture: Cart = {
	items: [
		{ ...shirt, quantity: 5 },
		{ ...shirt, quantity: 3 },
		{
			...shirt,
			quantity: 1,
			productVariantId: 'size-s',
			productVariant: {
				...shirt.productVariant,
				id: 'size-s',
				options: {
					Size: 'S',
				},
			},
		},
		{
			id: 'e436c975-21a2-49e3-96c2-f543361d00d9',
			quantity: 1,
			productVariantId: 'default',
			productVariant: {
				id: 'default',
				name: 'Default',
				stock: 50,
				options: {},
				product: {
					id: 'astro-sticker-sheet',
					name: 'Astro Sticker Sheet',
					slug: 'astro-sticker-sheet',
					tagline: "You probably want this for the fail whale sticker, don't you?",
					price: 1000,
					imageUrl: '/assets/astro-universe-stickers.png',
					collectionIds: ['stickers'],
					description: '',
					images: [],
					discount: 0,
					createdAt: '2024-09-20T20:09:51.523Z',
					updatedAt: '2024-09-20T20:09:51.523Z',
					deletedAt: null,
					variants: [
						{
							id: 'default',
							name: 'Default',
							stock: 50,
							options: {},
						},
					],
				},
			},
		},
	],
};
