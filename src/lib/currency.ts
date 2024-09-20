const formatter = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
});

/**
 * Formats a product price in cents to a currency string.
 *
 * @example
 * 	formatProductPrice(1000); // $10.00
 * 	formatProductPrice(1550); // $15.50
 * 	formatProductPrice(2033.333333); // $20.33
 */
export function formatProductPrice(value: number) {
	return formatter.format(value / 100);
}
