import { type Product, getProducts } from 'storefront:client';
import type { AstroCookies } from 'astro';
import { type Cart, type CartData, cartDataSchema, expandLineItem } from './cart.ts';

export function parseCartData(input: unknown): CartData {
	return cartDataSchema.catch(() => ({ items: [] })).parse(input);
}

export async function expandCartData(cartData: CartData): Promise<Cart> {
	const productsResponse = await getProducts({
		query: {},
	});
	if (!productsResponse.data) {
		throw new Error('Failed to fetch products', { cause: productsResponse.error });
	}

	const items = expandCartDataFromProducts(cartData, productsResponse.data.items);

	return { items };
}

export function expandCartDataFromProducts(cartData: CartData, products: Product[]) {
	return cartData.items
		.map((item) => {
			const product = products.find((product) =>
				product.variants.some((variant) => variant.id === item.productVariantId),
			);
			if (!product) {
				console.warn(`Product not found for variant ${item.productVariantId}`);
				return;
			}
			return expandLineItem(item, product);
		})
		.filter(Boolean);
}

export function toCartData(cart: Cart): CartData {
	return {
		items: cart.items.map((item) => ({
			id: item.id,
			quantity: item.quantity,
			productVariantId: item.productVariantId,
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
