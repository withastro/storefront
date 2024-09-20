import type { AstroCookies } from 'astro';
import { z } from 'zod';
import { joinWithProducts } from '~/lib/products.ts';
import { type Cart, expandLineItem } from './cart.ts';

export type LineItemData = z.infer<typeof lineItemDataSchema>;

export const lineItemDataSchema = z.object({
	id: z.string(),
	productId: z.string(),
	quantity: z.number(),
	variationSelections: z
		.array(z.object({ variationId: z.string(), optionId: z.string() }))
		.readonly(),
});

export type CartData = z.infer<typeof cartDataSchema>;
export const cartDataSchema = z.object({
	items: z.array(lineItemDataSchema),
});

export function parseCartData(input: unknown): CartData {
	return cartDataSchema.catch(() => ({ items: [] })).parse(input);
}

export async function expandCartData(cartData: CartData): Promise<Cart> {
	const items = await joinWithProducts(cartData.items).then((items) =>
		items.map(({ product, ...item }) => expandLineItem(item, product)),
	);
	return { items };
}

export function toCartData(cart: Cart): CartData {
	return {
		items: cart.items.map((item) => ({
			id: item.id,
			productId: item.product.id,
			quantity: item.quantity,
			variationSelections: item.variationSelections.map((selection) => ({
				variationId: selection.variation.id,
				optionId: selection.option.id,
			})),
		})),
	};
}

const COOKIE_NAME = 'cart';

export async function loadCartFromCookies(cookies: AstroCookies) {
	const json = cookies.get(COOKIE_NAME)?.json();
	return await expandCartData(parseCartData(json));
}

export function saveCartToCookies(cart: Cart, cookies: AstroCookies) {
	cookies.set(COOKIE_NAME, toCartData(cart), {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
	});
}
