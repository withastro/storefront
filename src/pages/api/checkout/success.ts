import { STRIPE_SECRET_KEY } from 'astro:env/server';
import { createCustomer, createOrder } from 'storefront:client';
import type { APIRoute } from 'astro';
import Stripe from 'stripe';
import { saveCartToCookies } from '~/features/cart/cart.server.ts';
import { emptyCart } from '~/features/cart/cart.ts';
import { formatOneLineAddress } from '~/lib/address';
import { sendCheckoutSuccessEmail } from '~/lib/emails.ts';
import { stripeProductMetadataSchema } from '~/lib/products.ts';

export const GET: APIRoute = async (context) => {
	const stripe = new Stripe(STRIPE_SECRET_KEY);

	const sessionId = context.url.searchParams.get('session_id');
	if (!sessionId) {
		return new Response('Bad request', { status: 400 });
	}

	const session = await stripe.checkout.sessions.retrieve(sessionId, {
		expand: ['line_items', 'line_items.data.price.product'],
	});

	if (session.status !== 'complete') {
		return new Response('Session not complete', { status: 400 });
	}

	if (session.line_items == null) {
		return new Response('Session line items not found', { status: 400 });
	}

	try {
		const order = await createOrderFromStripe(session, session.line_items.data);
		if (!import.meta.env.DEV && session.customer_details?.email) {
			await sendCheckoutSuccessEmail(
				session.customer_details.email,
				order.id,
				session.line_items.data,
				session,
			).catch((error) => {
				console.error('Failed to send checkout success email:', error);
			});
		}
		return context.redirect(`/orders/${order.id}`);
	} catch (e) {
		console.error(e);
		return context.redirect('/500', 307);
	} finally {
		saveCartToCookies(emptyCart(), context.cookies);
	}
};

async function createOrderFromStripe(
	session: Stripe.Checkout.Session,
	lineItems: Stripe.LineItem[],
) {
	const customerId =
		typeof session.customer === 'string'
			? session.customer
			: session.customer != null
				? session.customer.id
				: undefined;

	const customerResponse = await createCustomer({
		body: {
			id: customerId,
			name: session.customer_details?.name ?? '',
			email: session.customer_details?.email ?? '',
			location: session.customer_details?.address
				? formatOneLineAddress({
						line1: session.customer_details.address.line1,
						line2: session.customer_details.address.line2,
						city: session.customer_details.address.city,
						province: session.customer_details.address.state,
					})
				: '',
		},
	});

	if (!customerResponse.data) {
		throw new Error(`Unexpected error creating customer. ${customerResponse.response.status}`);
	}
	const customer = customerResponse.data;

	const { shipping_details, customer_details } = session;
	const customerAddressDetails = {
		phone: session.customer_details?.phone ?? undefined,
		company: session.customer_details?.name ?? undefined,
		firstName: session.customer_details?.name ?? undefined,
		lastName: session.customer_details?.name ?? undefined,
	};

	const orderResponse = await createOrder({
		body: {
			customerId: customer.id,
			customerName: customer.name,
			totalPrice: session.amount_total ?? 0,
			shippingPrice:
				typeof session.shipping_cost === 'number'
					? session.shipping_cost
					: session.shipping_cost?.amount_total ?? 0,
			lineItems: lineItems.map((item) => {
				const metadata = stripeProductMetadataSchema.parse(
					(item.price?.product as Stripe.Product).metadata,
				);
				return {
					quantity: item.quantity ?? 1,
					productVariantId: metadata.productVariantId,
				};
			}),
			shippingAddress: shipping_details
				? {
						line1: shipping_details.address?.line1 ?? '',
						line2: shipping_details.address?.line2 ?? '',
						city: shipping_details.address?.city ?? '',
						province: shipping_details.address?.state ?? '',
						country: shipping_details.address?.country ?? '',
						postal: shipping_details.address?.postal_code ?? '',
						...customerAddressDetails,
					}
				: undefined,
			billingAddress: customer_details
				? {
						line1: session.customer_details?.address?.line1 ?? '',
						line2: session.customer_details?.address?.line2 ?? '',
						city: session.customer_details?.address?.city ?? '',
						province: session.customer_details?.address?.state ?? '',
						country: session.customer_details?.address?.country ?? '',
						postal: session.customer_details?.address?.postal_code ?? '',
						...customerAddressDetails,
					}
				: undefined,
		},
	});

	const order = orderResponse.data;
	if (!order) {
		throw new Error(`Unexpected error creating order. ${orderResponse.response.status}`);
	}

	return order;
}
