import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Match, Show, Switch, createEffect, createSignal } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { clamp, unwrap } from '~/lib/util.ts';
import { CartStore } from './store.ts';

const MAX_QUANTITY = 20;

export function AddToCartForm(props: { product: Product }) {
	const [selectedVariant, setSelectedVariant] = createSignal<Product['variants'][number] | null>(
		props.product.variants.length > 1 ? null : unwrap(props.product.variants[0]),
	);
	const [unpickedVariantVisible, setUnpickedVariantVisible] = createSignal(false);

	const [quantitySignal, setQuantity] = createSignal(1);

	const quantity = () => {
		const value = quantitySignal();
		return clamp(value, 1, Math.min(selectedVariant()?.stock ?? 0, MAX_QUANTITY));
	};

	createEffect(() => {
		// sometimes, the browser will pre-check an option if it was previously selected before a refresh,
		// so we'll look for checked inputs and select the corresponding variant
		for (const input of document.querySelectorAll('[data-variant-id]')) {
			if (input instanceof HTMLInputElement && input.checked) {
				setSelectedVariant(
					unwrap(props.product.variants.find((variant) => variant.id === input.dataset.variantId)),
				);
				break;
			}
		}
	});

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

	const variantsByOption = () => {
		const result = new Map<string | null, Product['variants']>();

		for (const variant of props.product.variants) {
			const optionNames = Object.keys(variant.options);

			if (optionNames.length === 0) {
				result.set(null, [variant]);
				continue;
			}

			for (const option of optionNames) {
				const variants = result.get(option) ?? [];
				result.set(option, [...variants, variant]);
			}
		}

		return result;
	};

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
				<For each={[...variantsByOption().entries()]}>
					{([option, variants]) => (
						<fieldset>
							<legend class="mb-1 text-slate-700">{option ?? 'Variants'}</legend>
							<Show when={unpickedVariantVisible() && !selectedVariant()}>
								<p role="alert" class="mb-2 text-sm text-red-400">
									Please make a selection.
								</p>
							</Show>
							<div class="flex flex-wrap gap-2">
								<For each={variants}>
									{(variant) => (
										<label class="flex h-11 min-w-11 items-center justify-center gap-1.5 border border-slate-300 bg-slate-100 px-3 text-center text-sm text-slate-600 transition hover:border-slate-500 has-[:checked]:border-slate-900 has-[:checked]:text-slate-900">
											<input
												type="radio"
												value={variant.id}
												class="peer sr-only"
												checked={selectedVariant()?.id === variant.id}
												onChange={() => {
													setSelectedVariant(variant);
												}}
												data-variant-id={variant.id}
											/>
											<div>{option !== null ? variant.options[option] : variant.name}</div>
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
				<Show
					when={selectedVariant()}
					fallback={<NumberInput id="quantity" value={1} setValue={() => {}} disabled />}
				>
					{(variant) => (
						<NumberInput
							id="quantity"
							min={1}
							max={Math.min(variant().stock, MAX_QUANTITY)}
							value={quantity()}
							setValue={setQuantity}
						/>
					)}
				</Show>
			</div>
			<div class="sticky bottom-4 grid gap-2">
				<Switch
					fallback={
						<Button type="submit" pending={mutation.isPending}>
							Add to cart
						</Button>
					}
				>
					<Match when={selectedVariant() === null}>
						<Button type="submit" disabled>
							Select a style
						</Button>
					</Match>
					<Match when={selectedVariant()?.stock === 0}>
						<Button type="submit" disabled>
							Out of stock
						</Button>
					</Match>
				</Switch>
			</div>

			<Show when={mutation.isError}>
				<aside class="text-red-500">Sorry, something went wrong. Please try again.</aside>
			</Show>
		</form>
	);
}
