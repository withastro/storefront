import { describe, expect, test } from 'vitest';
import { getCartSubtotal, normalizeCart } from './cart.ts';
import kitchenSink from './fixtures/kitchen-sink.json';
import normalizeFixture from './fixtures/normalize.json';

test('getCartSubtotal', () => {
	expect(getCartSubtotal(kitchenSink)).toBe(134_25);
});

describe('normalizeCart', () => {
	test('combine quantities by variation selections', () => {
		const result = normalizeCart(normalizeFixture);

		expect(result.items).toHaveLength(3);
		expect(result.items[0]).toEqual({
			...normalizeFixture.items[0],
			quantity: 8,
		});

		// other items should be left alone
		expect(result.items[1]).toEqual(normalizeFixture.items[2]);
		expect(result.items[2]).toEqual(normalizeFixture.items[3]);
	});
});
