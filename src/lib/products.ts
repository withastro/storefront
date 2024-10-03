import { type Product } from 'storefront:client';
import { z } from 'zod';

export const stripeProductMetadataSchema = z.object({
	productVariantId: z.string(),
	productVariantJson: z
		.string()
		.describe('JSON representation of the product variant, for debugging purposes '),
});

export function getProductStock(product: Product) {
	return product.variants.reduce((total, variant) => total + variant.stock, 0);
}
