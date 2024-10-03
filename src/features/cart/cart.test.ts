import { describe, expect, test } from 'vitest';
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
