import { z } from 'zod';
import { type Product, getProducts } from 'storefront:client';

export const stripeProductMetadataSchema = z.object({
	productId: z.string(),
	variationSelectionsJson: z
		.string()
		.transform((value) => JSON.parse(value))
		.pipe(z.array(z.object({ variationId: z.string(), optionId: z.string() }))),
});

export async function joinWithProducts<T extends { productId: string }>(
	items: T[],
): Promise<Array<T & { product: Product }>> {
	const productsResponse = await getProducts({
		query: { ids: items.map((item) => item.productId) },
	});

	if (!productsResponse.data) throw new Error('Failed to fetch products.');

	return items
		.map((item) => {
			const product = productsResponse.data.items.find((product) => product.id === item.productId);
			// Filter out items that don't have a corresponding product.
			// This can happen if a product is deleted from the catalog.
			if (!product) return undefined;
			return { ...item, product };
		})
		.filter((item): item is T & { product: Product } => item !== undefined);
}
