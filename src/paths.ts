import type { Product } from './lib/client.ts';

export const productPath = (slug: Product['slug']) => `/products/${slug}`;
