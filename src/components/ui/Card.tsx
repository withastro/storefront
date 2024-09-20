import { type JSX } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import { card } from '~/styles';

type Props = JSX.HTMLAttributes<HTMLDivElement>;

export default function Card(props: Props) {
	return (
		<div {...props} class={twMerge(card(), props.class)}>
			{props.children}
		</div>
	);
}
