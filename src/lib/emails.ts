import Stripe from 'stripe';
import { formatProductPrice } from '~/lib/currency.ts';
import {
	LOOPS_API_KEY,
	LOOPS_FULFILLMENT_EMAIL,
	LOOPS_FULFILLMENT_TRANSACTIONAL_ID,
	LOOPS_SHOP_TRANSACTIONAL_ID,
} from 'astro:env/server';

export async function sendCheckoutSuccessEmail(
	email: string,
	orderId: string,
	lineItems: Stripe.LineItem[],
	session: Stripe.Checkout.Session,
) {
	if (
		!LOOPS_API_KEY ||
		!LOOPS_SHOP_TRANSACTIONAL_ID ||
		!LOOPS_FULFILLMENT_TRANSACTIONAL_ID ||
		!LOOPS_FULFILLMENT_EMAIL
	) {
		console.error('Missing Loops credentials. Skipping email sending.');
		return;
	}
	const { address } = session.shipping_details ?? {};

	const itemList = lineItems
		.map((item) => {
			return `${item.description} x ${item.quantity} for ${formatProductPrice(item.amount_total)}`;
		})
		.join('\n');

	const formattedAddress = address
		? [address.line1, address.line2, `${address.city}, ${address.state} ${address.postal_code}`]
				.filter((s) => typeof s === 'string')
				.join('\n')
		: 'No address provided.';

	const dataVariables = {
		customerName: session.customer_details?.name ?? 'Astronaut',
		orderRefNumber: orderId,
		orderDate: new Date(session.created * 1000).toLocaleDateString(),
		subTotal: formatProductPrice(session.amount_subtotal ?? 0),
		discount: formatProductPrice(session.total_details?.amount_discount ?? 0),
		shippingFee: formatProductPrice(session.total_details?.amount_shipping ?? 0),
		total: formatProductPrice(session.amount_total ?? 0),
		address: formattedAddress,
		items: itemList,
	};

	const requestInit: RequestInit = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${LOOPS_API_KEY}`,
		},
	};

	// Email sending will block the order redirect.
	// Ideally, this should use a queueing service.
	const responses = await Promise.all([
		fetch('https://app.loops.so/api/v1/transactional', {
			...requestInit,
			body: JSON.stringify({
				transactionalId: LOOPS_SHOP_TRANSACTIONAL_ID,
				email,
				dataVariables,
			}),
		}),
		fetch('https://app.loops.so/api/v1/transactional', {
			...requestInit,
			body: JSON.stringify({
				// Send copy to your store owner for fulfillment
				transactionalId: LOOPS_FULFILLMENT_TRANSACTIONAL_ID,
				email: LOOPS_FULFILLMENT_EMAIL,
				dataVariables,
			}),
		}),
	]);
	for (const res of responses) {
		if (!res.ok) {
			throw new Error(`Failed to send email. Response: ${await res.text()}`);
		}
	}
}
