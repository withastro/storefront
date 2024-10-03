import { actions } from 'astro:actions';
import type { LineItemInput, Product } from 'storefront:client';
import { createMutation } from '@tanstack/solid-query';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/Button.tsx';
import { NumberInput } from '~/components/ui/NumberInput.tsx';
import { queryClient } from '~/lib/query.ts';
import { CartStore } from './store.ts';

const MAX_QUANTITY = 20;

export function AddToCartForm(props: { product: Product }) {
	const [quantity, setQuantity] = createSignal(1);

	const [selectedVariant, setSelectedVariant] = createSignal<Product['variants'][number] | null>(
		null,
	);
	const [unpickedVariantVisible, setUnpickedVariantVisible] = createSignal(false);

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
		const result = new Map<string, Product['variants']>();
		for (const variant of props.product.variants) {
			for (const option of Object.keys(variant.options)) {
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
			<For each={[...variantsByOption().entries()]}>
				{([option, variants]) => (
					<fieldset>
						<legend class="mb-1 text-slate-700">{option}</legend>
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
										/>
										<div>{variant.options[option]}</div>
										<RiSystemCheckLine class="hidden peer-checked:block" />
									</label>
								)}
							</For>
						</div>
					</fieldset>
				)}
			</For>

			<Show when={selectedVariant()}>
				{(variant) => (
					<Show
						when={variant().stock > 0}
						fallback={
							<Button type="button" disabled>
								Out of stock
							</Button>
						}
					>
						<div class="mb-2">
							<label for="quantity" class="mb-2 block text-slate-700">
								Quantity
							</label>
							<NumberInput
								id="quantity"
								min={1}
								max={Math.min(variant().stock, MAX_QUANTITY)}
								value={quantity()}
								setValue={setQuantity}
							/>
						</div>
						<div class="sticky bottom-4 grid gap-2">
							<Button type="submit" pending={mutation.isPending} disabled={mutation.isPending}>
								Add to cart
							</Button>
						</div>
					</Show>
				)}
			</Show>

			<Show when={mutation.isError}>
				<aside class="text-red-500">Sorry, something went wrong. Please try again.</aside>
			</Show>
		</form>
	);
}
