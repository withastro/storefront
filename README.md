# Astro Storefront (Alpha)

Your storefront deserves best-in-class performance without the learning curve.

Astro has spent years building the right foundation for content-driven websites, and ecommerce is naturally the next frontier. This repository showcases the top features that our community uses to ship with confidence:

- [Islands architecture](https://docs.astro.build/en/concepts/islands/) with [SolidJS](https://docs.astro.build/en/guides/integrations-guide/solid-js/) for the smallest possible runtime cost.
- [On-demand rendering](https://docs.astro.build/en/guides/server-side-rendering/) with CDN caching to deliver pages at the speed of HTML.
- [`astro:actions`](https://docs.astro.build/en/guides/actions/) to build simple, type-safe endpoints for managing the user's session.
- [`astro:assets`](https://docs.astro.build/en/guides/images/#image--astroassets) for on-demand image optimization. Backed by Netlify CDN, Sharp, or your favorite image provider.
- [`astro:env`](https://docs.astro.build/en/reference/configuration-reference/#experimentalenv) for environment variable management and type-safety.

Astro Storefront powers [shop.astro.build](https://shop.astro.build) today, and our opinionated choice of services and libraries reflects that. We expect this repository to be the start of a new platform to meet your storefront's needs.

## Project structure

The primary project directories are outlined below:

```sh
├── public/
├── src/
│   └── actions/
│   └── components/
│       └── ui/
│   └── features/
│   └── pages/
└── package.json
```

`actions/` contains backend functions called from the client to manage a customer's cart. These are called client-side and backed by optimistic updates.

`components/ui/` contains reusable components for common UI elements, including Buttons, Drawers, and Inputs. These are tested to meet modern accessibility guidelines.

`features/` contains domain-specific components and state management, organized by common ecommerce concepts:

- `product/` - Used on the product landing page (PDP) and recommendation carousels.
- `collection/` - Used to display product collections with sorting logic.
- `cart/` - Used to manage the cart flyout and related client-side state.

`pages/` contains file-based routes for your storefront.

- `pages/api/` manages customer checkout using Stripe.
- `pages/orders/` displays the customer's receipt on successful checkout.
- `pages/collections/` displays product collections with dynamic filtering.
- `pages/*` displays all other base-level routes.

## Services

This repository connects to related services to power payments, emails, and map embeds. Visit the [`astro.config.ts`](https://github.com/withastro/storefront/blob/main/astro.config.ts) file for an overview of all environment variables and access permissions required for each.

You are welcome to change or entirely remove any of these services to meet your needs.

### Storefront API

[shop.astro.build](https://shop.astro.build) uses a custom API to manage products and fulfill orders.

This client isn't available for public use today, though we've provided a "mock" version of all API functions under `src/lib/client.mock.ts`. We recommend using this file as a way to standardize requests for your ecommerce provider of choice.

To use the mock API, update the [`tsconfig.json`](https://github.com/withastro/storefront/blob/main/tsconfig.json) entry for the `storefront:client` module:

```diff
{
	"compilerOptions": {
		"paths": {
			"~/*": ["./src/*"],
-			"storefront:client": ["./src/lib/client.ts"]
+			"storefront:client": ["./src/lib/client.mock.ts"]
		},
	}
}
```

### Stripe

[The Stripe API](https://docs.stripe.com/api) is used to accept payment and manage the checkout flow.

#### Environment variables

- `STRIPE_SECRET_KEY` - A Stripe API key [used to authenticate requests](https://docs.stripe.com/keys).

### Loops

[Loops.so](https://loops.so/) is an email sending service used to send a confirmation email to the customer after checking out successfully.

#### Environment variables

- `LOOPS_API_KEY` - A Loops API key [generated through their admin console](https://loops.so/docs/api-reference/intro).
- `LOOPS_SHOP_TRANSACTIONAL_ID` - The ID of a [Loops transaction email](https://loops.so/docs/transactional/guide) to send to a customer when an order is placed. See `src/lib/emails.ts` for related email template data.
- `LOOPS_FULFILLMENT_TRANSACTIONAL_ID` - The ID of a [Loops transaction email](https://loops.so/docs/transactional/guide) to send to _you_ (the seller) for order fulfillment. See `src/lib/emails.ts` for related email template data.
- `LOOPS_FULFILLMENT_EMAIL` - The seller's email address to receive a receipt for fulfillment.

### Google Maps

[The Google Maps Platform](https://developers.google.com/maps) is used to embed a map with the customer's shipping address on the order details page.

#### Environment variables

- `GOOGLE_GEOLOCATION_SERVER_KEY` - A Google API key with permissions to use the Geolocation API. This key is only used server-side and can be [created with an IP address app restriction](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys).
- `GOOGLE_MAPS_BROWSER_KEY` - A Google API key with permissions to use the "Maps JavaScript API." This key is **publicly available on the client** and must be [created with a Website app restriction](https://developers.google.com/maps/api-security-best-practices#restricting-api-keys) to only allow access from your project's deployment URL.

## Commands

This project uses [pnpm](https://pnpm.io/) to manage dependencies. Be sure to install this tool, then run startup commands from your terminal:

| Command             | Action                                           |
| :------------------ | :----------------------------------------------- |
| `pnpm install`      | Installs dependencies                            |
| `pnpm dev`          | Starts local dev server                          |
| `pnpm build`        | Build your production site to `./dist/`          |
| `pnpm astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro --help` | Get help using the Astro CLI                     |
