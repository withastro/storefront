import type { Product } from 'storefront:client';
import { describe, expect, test } from 'vitest';
import { it } from 'vitest';
import { expandCartDataFromProducts } from './cart.server';
import { getCartSubtotal, normalizeCart } from './cart.ts';
import { kitchenSinkFixture } from './fixtures/kitchen-sink.ts';

test('getCartSubtotal', () => {
	expect(getCartSubtotal(kitchenSinkFixture)).toBe(16_975);
});

describe('normalizeCart', () => {
	test('combine quantities by variation selections', () => {
		const result = normalizeCart(kitchenSinkFixture);

		expect(result.items).toHaveLength(3);
		expect(result.items[0]).toEqual({
			...kitchenSinkFixture.items[0],
			quantity: 8,
		});

		// other items should be left alone
		expect(result.items[1]).toEqual(kitchenSinkFixture.items[2]);
		expect(result.items[2]).toEqual(kitchenSinkFixture.items[3]);
	});
});

describe('expandCartDataFromProducts', () => {
	const mockProducts = [
		{
			id: 'product1',
			name: 'Test Product 1',
			slug: 'test-product-1',
			price: 1000,
			variants: [
				{ id: 'variant1', name: 'Variant 1', stock: 10, options: { Size: 'S' } },
				{ id: 'variant2', name: 'Variant 2', stock: 5, options: { Size: 'M' } },
			],
		},
		{
			id: 'product2',
			name: 'Test Product 2',
			slug: 'test-product-2',
			price: 2000,
			variants: [{ id: 'variant3', name: 'Variant 3', stock: 8, options: { Color: 'Red' } }],
		},
	] as unknown as Product[];

	it('should expand cart data correctly', () => {
		const cartData = {
			items: [
				{ id: 'item1', quantity: 2, productVariantId: 'variant1' },
				{ id: 'item2', quantity: 1, productVariantId: 'variant3' },
			],
		};

		const result = expandCartDataFromProducts(cartData, mockProducts);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			id: 'item1',
			quantity: 2,
			productVariantId: 'variant1',
			productVariant: {
				id: 'variant1',
				name: 'Variant 1',
				stock: 10,
				options: { Size: 'S' },
				product: mockProducts[0],
			},
		});
		expect(result[1]).toMatchObject({
			id: 'item2',
			quantity: 1,
			productVariantId: 'variant3',
			productVariant: {
				id: 'variant3',
				name: 'Variant 3',
				stock: 8,
				options: { Color: 'Red' },
				product: mockProducts[1],
			},
		});
	});

	it('should throw an error for non-existent product variant', () => {
		const cartData = {
			items: [{ id: 'item1', quantity: 1, productVariantId: 'non-existent' }],
		};

		expect(() => expandCartDataFromProducts(cartData, mockProducts)).toThrow(
			'Product not found for variant non-existent',
		);
	});

	it('should handle an empty cart', () => {
		const cartData = { items: [] };

		const result = expandCartDataFromProducts(cartData, mockProducts);

		expect(result).toEqual([]);
	});
});
