import { twMerge } from 'tailwind-merge';
import { formatProductPrice } from '~/lib/currency.ts';
import type { Product } from '../cart/cart.ts';

type Props = {
	price: Product['price'];
	discount: Product['discount'];
	class?: string;
};

export function ProductPrice(props: Props) {
	return (
		<span class={twMerge('flex gap-2 font-medium', props.class)}>
			{formatProductPrice(props.price - props.discount)}
			{props.discount > 0 && (
				<span class="text-slate-400 line-through">{formatProductPrice(props.price)}</span>
			)}
		</span>
	);
}
