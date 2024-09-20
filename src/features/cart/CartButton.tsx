import { createQuery } from '@tanstack/solid-query';
import { RiFinanceShoppingCartLine } from 'solid-icons/ri';
import { type ComponentProps } from 'solid-js';
import { SquareIconButton } from '~/components/ui/Button.tsx';
import { cartQueryOptions } from '~/features/cart/cart.queries.ts';
import { queryClient } from '~/lib/query.ts';
import type { StrictOmit } from '~/lib/types.ts';

export function CartButton(props: StrictOmit<ComponentProps<typeof SquareIconButton>, 'children'>) {
	const query = createQuery(
		() => cartQueryOptions(),
		() => queryClient,
	);

	const itemCount = () => query.data.items.reduce((total, item) => total + item.quantity, 0);

	return (
		<div class="relative">
			<SquareIconButton {...props}>
				<RiFinanceShoppingCartLine />
				<span class="sr-only">Show cart</span>
			</SquareIconButton>
			<div class="absolute right-0 top-0 -translate-y-1/3 translate-x-1/3">
				<div
					role="status"
					data-visible={itemCount() > 0 || undefined}
					class="grid size-4 place-content-center rounded-full bg-slate-700 text-xs text-white opacity-0 transition-opacity data-[visible]:opacity-100"
				>
					{itemCount()} <span class="sr-only">items added</span>
				</div>
			</div>
		</div>
	);
}
