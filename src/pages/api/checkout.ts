import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { z } from 'zod';
import { loadCartFromCookies } from '~/features/cart/cart.server.ts';
import type { stripeProductMetadataSchema } from '~/lib/products.ts';
import {
	INTERNATIONAL_SHIPPING_RATE_ID,
	STRIPE_SECRET_KEY,
	US_SHIPPING_RATE_ID,
} from 'astro:env/server';

export const POST: APIRoute = async (context) => {
	const cart = await loadCartFromCookies(context.cookies);

	// TODO: we probably want to check here the stock of items/variants
	// because they could be in the checkout screen _while_ the last thing was being ordered,
	// then get an error after submitting payment

	const stripe = new Stripe(STRIPE_SECRET_KEY);

	const countrySpecs = await stripe.countrySpecs.retrieve('US');

	const session = await stripe.checkout.sessions.create({
		mode: 'payment',
		line_items: cart.items.map<Stripe.Checkout.SessionCreateParams.LineItem>((item) => {
			const metadata: z.input<typeof stripeProductMetadataSchema> = {
				productVariantId: item.productVariantId,
				// some simple metadata for identification
				productName: item.productVariant.product.name,
				productId: item.productVariant.product.id,
				variantName: item.productVariant.name,
				variantId: item.productVariant.id,
			};
			return {
				price_data: {
					currency: 'usd',
					product_data: {
						name: item.productVariant.product.name,
						description:
							item.productVariant.product.description ||
							item.productVariant.product.tagline ||
							undefined,
						images: [new URL(item.productVariant.product.imageUrl, context.url).href],
						metadata,
					},
					unit_amount: item.productVariant.product.price - item.productVariant.product.discount,
				},
				quantity: item.quantity,
			};
		}),
		success_url: new URL('/api/checkout/success?session_id={CHECKOUT_SESSION_ID}', context.url)
			.href,
		cancel_url: new URL('/', context.url).href,
		shipping_address_collection: {
			allowed_countries:
				countrySpecs.supported_transfer_countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
		},
		shipping_options: [
			{ shipping_rate: US_SHIPPING_RATE_ID },
			{ shipping_rate: INTERNATIONAL_SHIPPING_RATE_ID },
		],
		phone_number_collection: {
			enabled: true,
		},
	});

	if (!session.url) {
		throw new Error('Failed to create Stripe checkout session', {
			cause: session,
		});
	}

	return context.redirect(session.url, 303);
};
