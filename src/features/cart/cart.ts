import { z } from 'zod';
import type { Product } from 'storefront:client';

export interface Cart {
	items: readonly LineItem[];
}

export type LineItemId = string;
export interface LineItem {
	id: LineItemId;
	product: Product;
	quantity: number;
	variationSelections: ReadonlyArray<{
		variation: Variation;
		option: VariationOption;
	}>;
}

export type { Product };
export type ProductId = Product['id'];

export type Variation = NonNullable<Product['variations']>[number];
export type VariationId = Variation['id'];

export type VariationOption = NonNullable<Variation['options']>[number];
export type VariationOptionId = VariationOption['id'];

export type LineItemData = z.infer<typeof lineItemDataSchema>;
export const lineItemDataSchema = z.object({
	id: z.string(),
	productId: z.string(),
	quantity: z.number(),
	variationSelections: z
		.array(z.object({ variationId: z.string(), optionId: z.string() }))
		.readonly(),
});

export function expandLineItem(item: LineItemData, product: Product): LineItem {
	const variationSelections = item.variationSelections.map((selection) => {
		const variation = product.variations?.find((it) => it.id === selection.variationId);
		if (!variation) {
			throw new Error(
				`Could not find variation ${selection.variationId} for product ${item.productId}`,
			);
		}
		const option = variation.options?.find((it) => it.id === selection.optionId);
		if (!option) {
			throw new Error(
				`Could not find option ${selection.optionId} for variation ${selection.variationId} for product ${item.productId}`,
			);
		}
		return {
			variation,
			option,
		};
	});
	return {
		id: item.id,
		product,
		quantity: item.quantity,
		variationSelections,
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

export function normalizeCart(cart: Cart) {
	const itemsByProductId = new Map<string, LineItem>();
	for (const item of cart.items) {
		const seen = itemsByProductId.get(item.product.id);
		if (seen) {
			itemsByProductId.set(item.product.id, {
				...item,
				quantity: seen.quantity + item.quantity,
			});
		} else {
			itemsByProductId.set(item.product.id, item);
		}
	}
	return {
		...cart,
		items: [...itemsByProductId.values()],
	};
}
