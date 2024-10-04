import type { LineItem, Product } from 'storefront:client';
import { z } from 'zod';
import { unwrap } from '~/lib/util.ts';

export type { LineItem } from 'storefront:client';

export interface Cart {
	items: readonly LineItem[];
}

export type LineItemId = LineItem['id'];

export type { Product };
export type ProductId = Product['id'];

export type LineItemData = z.infer<typeof lineItemDataSchema>;
export const lineItemDataSchema = z.object({
	id: z.string(),
	quantity: z.number(),
	productVariantId: z.string(),
});

export type CartData = z.infer<typeof cartDataSchema>;
export const cartDataSchema = z.object({
	items: z.array(lineItemDataSchema),
});

export function expandLineItem(item: LineItemData, product: Product): LineItem {
	return {
		...item,
		productVariant: {
			...unwrap(product.variants.find((it) => it.id === item.productVariantId)),
			product,
		},
	};
}

export function emptyCart(): Cart {
	return {
		items: [],
	};
}

export function addItemToCart(cart: Cart, item: LineItem): Cart {
	return normalizeCart({
		...cart,
		items: [...cart.items, item],
	});
}

export function removeItemFromCart(cart: Cart, lineItemId: LineItemId): Cart {
	return {
		...cart,
		items: cart.items.filter((item) => item.id !== lineItemId),
	};
}

export function updateCartItemQuantity(cart: Cart, lineItemId: LineItemId, quantity: number) {
	return {
		...cart,
		items: cart.items.map((item) => (item.id === lineItemId ? { ...item, quantity } : item)),
	};
}

/** Re-counts all of the cart items, keeping items with different variation selections separate */
export function normalizeCart(cart: Cart) {
	const items = new Map<string, LineItem>();

	for (const item of cart.items) {
		const existing = items.get(item.productVariantId);
		if (!existing) {
			items.set(item.productVariantId, item);
		} else {
			items.set(item.productVariantId, {
				...existing,
				quantity: existing.quantity + item.quantity,
			});
		}
	}

	return {
		...cart,
		items: [...items.values()],
	};
}

export function getCartSubtotal(cart: Cart) {
	return cart.items.reduce(
		(total, item) =>
			total +
			(item.productVariant.product.price - (item.productVariant.product.discount ?? 0)) *
				item.quantity,
		0,
	);
}
