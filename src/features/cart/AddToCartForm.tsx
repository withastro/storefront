import { createMutation } from '@tanstack/solid-query';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';
import { actions } from 'astro:actions';
import type { Product } from 'storefront:client';

const MAX_QUANTITY = 20;

export function AddToCartForm(props: { product: Product }) {
	const [quantity, setQuantity] = createSignal(1);

	const [variationSelections, setVariationSelections] = createStore<Record<string, string | null>>(
		Object.fromEntries(
			(props.product.variations ?? []).flatMap((variation) => {
				// ignore variations without options
				if (!variation.options[0]) {
					return [];
				}
				return [[variation.id, null]];
			}),
		),
	);

	const [unpickedVariantsVisible, setUnpickedVariantsVisible] = createSignal(false);

	const variationSelectionList = () =>
		Object.entries(variationSelections)
			// using flatMap because optionId might be nullish,
			// and this is currently the most TS-friendly solution
			.flatMap(([variationId, optionId]) => (optionId != null ? [{ variationId, optionId }] : []));

	const mutationInput = () => ({
		productId: props.product.id,
		quantity: quantity(),
		variationSelections: variationSelectionList(),
	});

	const mutation = createMutation(
		() => ({
			mutationKey: ['cart', 'items', 'add', props.product.id],
			mutationFn: async () => {
				return await actions.cart.addItems.orThrow(mutationInput());
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

	return (
		<form
			class="grid gap-6"
			onSubmit={(event) => {
				event.preventDefault();
				setUnpickedVariantsVisible(true);

				if (Object.values(variationSelections).every((selection) => selection != null)) {
					mutation.mutate();
				}
			}}
		>
			<For each={props.product.variations}>
				{(variation) => (
					<fieldset>
						<legend class="mb-1 text-slate-700">{variation.name}</legend>
						<Show when={unpickedVariantsVisible() && !variationSelections[variation.id]}>
							<p role="alert" class="mb-2 text-sm text-red-400">
								Please make a selection.
							</p>
						</Show>
						<div class="flex flex-wrap gap-2">
							<For each={variation.options}>
								{(option) => (
									<label class="flex h-11 min-w-11 items-center justify-center gap-1.5 border border-slate-300 bg-slate-100 px-3 text-center text-sm text-slate-600 transition hover:border-slate-500 has-[:checked]:border-slate-900 has-[:checked]:text-slate-900">
										<input
											type="radio"
											value={option.id}
											class="peer sr-only"
											checked={variationSelections[variation.id] === option.id}
											onChange={() => {
												setVariationSelections(variation.id, option.id);
											}}
										/>
										<div>{option.caption}</div>
										<RiSystemCheckLine class="hidden peer-checked:block" />
									</label>
								)}
							</For>
						</div>
					</fieldset>
				)}
			</For>

			<div class="mb-2">
				<label for="quantity" class="mb-2 block text-slate-700">
					Quantity
				</label>
				<NumberInput
					id="quantity"
					min={1}
					max={Math.min(props.product.stock, MAX_QUANTITY)}
					value={quantity()}
					setValue={setQuantity}
				/>
			</div>

			<div class="sticky bottom-4 grid gap-2">
				{props.product.stock > 0 ? (
					<Button type="submit" pending={mutation.isPending} disabled={mutation.isPending}>
						Add to cart
					</Button>
				) : (
					<p class="text-slate-500">Out of stock</p>
				)}
				{/* <aside class="text-sm text-slate-500">
					Some kind of message can go here! RE: Shipping, returns, etc.
				</aside> */}
			</div>

			<Show when={mutation.isError}>
				<aside class="text-red-500">Sorry, something went wrong. Please try again.</aside>
			</Show>
		</form>
	);
}
