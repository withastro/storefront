import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.context().clearCookies();
});

test('adding and deleting cart items', async ({ page }) => {
	await page.goto('/lighthouse-100-sticker', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Lighthouse 100 Sticker'),
	).toBeVisible();

	await page.goto('/astro-logo-curve-bill-snapback-cap', { waitUntil: 'networkidle' });
	await page.getByRole('button', { name: 'Add to cart' }).click();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo Curve Bill Snapback Cap'),
	).toBeVisible();

	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'30.00',
	);

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Lighthouse 100 Sticker'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo Curve Bill Snapback Cap'),
	).toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-total')).toContainText(
		'25.00',
	);

	await new Promise((r) => setTimeout(r, 100));

	await page
		.getByRole('dialog', { name: 'Cart' })
		.getByRole('button', { name: 'Remove item' })
		.first()
		.click();

	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Lighthouse 100 Sticker'),
	).not.toBeVisible();
	await expect(
		page.getByRole('dialog', { name: 'Cart' }).getByText('Astro Logo Curve Bill Snapback Cap'),
	).not.toBeVisible();
	await expect(page.getByRole('dialog', { name: 'Cart' }).getByTestId('cart-empty')).toBeVisible();
});
