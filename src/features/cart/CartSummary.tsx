import { createQuery } from '@tanstack/solid-query';
import { Index, Show } from 'solid-js';
import { formatProductPrice } from '~/lib/currency.ts';
import { queryClient } from '~/lib/query.ts';
import { button } from '~/styles.ts';
import { CartItem } from './CartItem.tsx';
import { cartQueryOptions } from './cart.queries.ts';

export function CartSummary() {
	const query = createQuery(
		() => cartQueryOptions(),
		() => queryClient,
	);

	const subtotal = () =>
		query.data.items.reduce(
			(total, item) =>
				total +
				(item.productVariant.product.price - (item.productVariant.product.discount ?? 0)) *
					item.quantity,
			0,
		);

	// const discount = () =>
	// 	query.data.items.reduce(
	// 		(total, item) => total + (item.product.discount ?? 0) * item.quantity,
	// 		0,
	// 	);

	// const total = () => subtotal() - discount();

	return (
		<div class="flex h-full min-h-0 flex-col">
			<ul class="min-h-0 flex-1 overflow-y-auto">
				<Index each={query.data.items} fallback={<CartEmptyState />}>
					{(item) => <CartItem item={item()} class="border-b pb-3 pt-4" />}
				</Index>
			</ul>
			<Show when={query.data.items.length > 0}>
				<dl class="grid grid-cols-[auto,1fr] gap-3 py-3 [&>dd]:text-right">
					{/* <dt class="font-normal text-slate-600">Subtotal</dt>
					<dd class="font-medium text-slate-700">{formatProductPrice(subtotal())}</dd>
					<dt class="font-normal text-slate-600">Discount</dt>
					<dd class="font-medium text-slate-700">{formatProductPrice(discount())}</dd>
					<hr class="col-span-2 border-t border-slate-200" /> */}
					<dt class="my-2 text-lg font-normal text-slate-600">Subtotal</dt>
					<dd class="my-2 text-xl font-medium text-slate-700" data-testid="cart-total">
						{formatProductPrice(subtotal())}
					</dd>
				</dl>
			</Show>
		</div>
	);
}

function CartEmptyState() {
	return (
		<div class="flex h-full flex-col items-center justify-center gap-8 p-4 text-center">
			<EmptyStateCartGraphic />

			<div data-testid="cart-empty" class="flex flex-col items-center gap-4">
				<h2 class="text-lg font-medium text-gray-700">Your cart is empty</h2>
				<a href="/" class={button({ className: 'mt-2' })}>
					Start shopping
				</a>
			</div>
		</div>
	);
}

function EmptyStateCartGraphic() {
	return (
		<svg
			width="172"
			height="168"
			viewBox="0 0 172 168"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path d="M0 140H156" stroke="#E2E8F0" stroke-dasharray="2 2" />
			<path d="M16 32H172" stroke="#E2E8F0" stroke-dasharray="2 2" />
			<path d="M140 156L140 -5.30481e-06" stroke="#E2E8F0" stroke-dasharray="2 2" />
			<path d="M32 168L32 12" stroke="#E2E8F0" stroke-dasharray="2 2" />
			<g filter="url(#filter0_dd_1142_19245)">
				<rect width="100" height="100" transform="translate(36 36)" fill="#F8FAFC" />
				<path
					d="M62 69.2425L52.271 59.5165L56.516 55.2715L66.242 65.0005H111.968C112.436 65.0005 112.897 65.1097 113.315 65.3196C113.732 65.5294 114.095 65.8341 114.375 66.2092C114.654 66.5843 114.842 67.0194 114.923 67.4799C115.004 67.9405 114.976 68.4136 114.842 68.8615L107.642 92.8615C107.457 93.4797 107.077 94.0218 106.559 94.4071C106.042 94.7924 105.413 95.0005 104.768 95.0005H68V101H101V107H65C64.2043 107 63.4413 106.684 62.8787 106.122C62.3161 105.559 62 104.796 62 104V69.2425ZM68 71.0005V89.0005H102.536L107.936 71.0005H68ZM66.5 119C65.3065 119 64.1619 118.526 63.318 117.682C62.4741 116.839 62 115.694 62 114.5C62 113.307 62.4741 112.162 63.318 111.319C64.1619 110.475 65.3065 110 66.5 110C67.6935 110 68.8381 110.475 69.682 111.319C70.5259 112.162 71 113.307 71 114.5C71 115.694 70.5259 116.839 69.682 117.682C68.8381 118.526 67.6935 119 66.5 119ZM102.5 119C101.307 119 100.162 118.526 99.318 117.682C98.4741 116.839 98 115.694 98 114.5C98 113.307 98.4741 112.162 99.318 111.319C100.162 110.475 101.307 110 102.5 110C103.693 110 104.838 110.475 105.682 111.319C106.526 112.162 107 113.307 107 114.5C107 115.694 106.526 116.839 105.682 117.682C104.838 118.526 103.693 119 102.5 119Z"
					fill="#475569"
				/>
			</g>
			<defs>
				<filter
					id="filter0_dd_1142_19245"
					x="32"
					y="35"
					width="108"
					height="109"
					filterUnits="userSpaceOnUse"
					color-interpolation-filters="sRGB"
				>
					<feFlood flood-opacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="4" />
					<feGaussianBlur stdDeviation="2" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
					<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1142_19245" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feMorphology
						radius="1"
						operator="dilate"
						in="SourceAlpha"
						result="effect2_dropShadow_1142_19245"
					/>
					<feOffset />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
					<feBlend
						mode="normal"
						in2="effect1_dropShadow_1142_19245"
						result="effect2_dropShadow_1142_19245"
					/>
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="effect2_dropShadow_1142_19245"
						result="shape"
					/>
				</filter>
			</defs>
		</svg>
	);
}
