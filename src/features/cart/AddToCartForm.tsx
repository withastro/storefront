import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Match, Show, Switch, createEffect, createSignal } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';

const MAX_QUANTITY = 20;

export function AddToCartForm(props: { product: Product }) {
	const [selectedOptions, setSelectedOptions] = createSignal<Record<string, string>>({});
	const [quantity, setQuantity] = createSignal(1);
	const [unpickedVariantVisible, setUnpickedVariantVisible] = createSignal(false);

	createEffect(() => {
		// sometimes, the browser will pre-check an option if it was previously selected before a refresh,
		// so we'll look for checked inputs and select the corresponding variant
		for (const input of document.querySelectorAll('[data-product-option]')) {
			if (!(input instanceof HTMLInputElement)) continue;
			if (!input.checked) continue;

			const { productOption, productOptionValue } = input.dataset;
			if (!productOption || !productOptionValue) {
				continue;
			}

			setSelectedOptions((options) => ({
				...options,
				[productOption]: productOptionValue,
			}));
		}
	});

	const selectedVariant = () =>
		props.product.variants.find((variant) =>
			// this could just be isEqual but y'all decided lodash is evil and I'm lazy
			Object.entries(selectedOptions()).every(([key, value]) => variant.options[key] === value),
		);

	const mutation = createMutation(
		() => ({
			mutationKey: ['cart', 'items', 'add', props.product.id],
			mutationFn: async (input: LineItemInput) => {
				return await actions.cart.addItems.orThrow(input);
			},
			// we explicitly don't want an optimistic update here,
			// because we want to make sure the mutation succeeded
			// before showing the cart drawer or doing anything else
			onSuccess: async () => {
				await queryClient.invalidateQueries();
				CartStore.openDrawer();
			},
		}),
		() => queryClient,
	);

	const productOptionValues = () => {
		const result = new Map<string, Set<string>>();
		for (const variant of props.product.variants) {
			for (const [option, value] of Object.entries(variant.options)) {
				const values = result.get(option) ?? new Set();
				values.add(value);
				result.set(option, values);
			}
		}
		return result;
	};

	const getVariantStock = (variant: Product['variants'][number] | undefined) =>
		Math.min(variant?.stock ?? 0, MAX_QUANTITY);

	return (
		<form
			class="grid gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				const productVariant = selectedVariant();
				if (productVariant) {
					mutation.mutate({ productVariantId: productVariant.id, quantity: quantity() });
				} else {
					setUnpickedVariantVisible(true);
				}
			}}
		>
			<Show when={props.product.variants.length > 1}>
				<For each={[...productOptionValues().entries()]}>
					{([option, values]) => (
						<fieldset>
							<legend class="mb-1 text-slate-700">{option ?? 'Variants'}</legend>
							<Show when={unpickedVariantVisible() && !selectedVariant()}>
								<p role="alert" class="mb-2 text-sm text-red-400">
									Please make a selection.
								</p>
							</Show>
							<div class="flex flex-wrap gap-2">
								<For each={[...values]}>
									{(value) => (
										<label class="flex h-11 min-w-11 items-center justify-center gap-1.5 border border-slate-300 bg-slate-100 px-3 text-center text-sm text-slate-600 transition hover:border-slate-500 has-[:checked]:border-slate-900 has-[:checked]:text-slate-900">
											<input
												type="radio"
												value={value}
												class="peer sr-only"
												checked={selectedOptions()[option] === value}
												onChange={() => {
													setSelectedOptions((options) => ({
														...options,
														[option]: value,
													}));
												}}
												data-product-option={option}
												data-product-option-value={value}
											/>
											<div>{value}</div>
											<RiSystemCheckLine class="hidden peer-checked:block" />
										</label>
									)}
								</For>
							</div>
						</fieldset>
					)}
				</For>
			</Show>

			<div class="mb-2">
				<label for="quantity" class="mb-2 block text-slate-700">
					Quantity
				</label>
				<NumberInput id="quantity" min={1} value={quantity()} setValue={setQuantity} />
			</div>
			<div class="sticky bottom-4 grid gap-2">
				<Switch
					fallback={
						<Button type="submit" pending={mutation.isPending}>
							Add to cart
						</Button>
					}
				>
					<Match when={Object.keys(selectedOptions()).length < productOptionValues().size}>
						<p class="h-12">Choose a style.</p>
					</Match>
					<Match when={selectedVariant() == null}>
						<p class="h-12">This style is unavailable.</p>
					</Match>
					<Match when={selectedVariant()?.stock === 0}>
						<p class="h-12">This style is out of stock.</p>
					</Match>
					<Match when={quantity() > getVariantStock(selectedVariant())}>
						<p class="h-12">Only {getVariantStock(selectedVariant())} left in stock.</p>
					</Match>
				</Switch>
			</div>

			<Show when={mutation.isError}>
				<aside class="text-red-500">Sorry, something went wrong. Please try again.</aside>
			</Show>
		</form>
	);
}
