import { RiSystemAddFill, RiSystemSubtractFill } from 'solid-icons/ri';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';
import { clamp } from '~/lib/util.ts';

export function NumberInput(
	props: JSX.InputHTMLAttributes<HTMLInputElement> & {
		min?: number;
		max?: number;
		value: number;
		setValue: (value: number) => void;
	},
) {
	const min = () => props.min ?? 0;
	const max = () => props.max ?? Number.POSITIVE_INFINITY;

	const update = (newValueInput: number) => {
		const newValue = clamp(newValueInput, min(), max());
		if (newValue !== props.value) {
			props.setValue(newValue);
		}
	};

	return (
		<div class="flex h-11 w-fit items-stretch divide-x divide-slate-300 border border-slate-300 bg-slate-100 text-slate-600">
			<NumberInputButton
				icon={<RiSystemSubtractFill />}
				onClick={() => update(props.value - 1)}
				disabled={props.disabled ?? props.value <= min()}
			>
				Decrement
			</NumberInputButton>
			<input
				{...props}
				min={min()}
				max={max()}
				type="number"
				class="w-12 bg-transparent bg-white p-2 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				value={props.value}
				onInput={(e) => update(e.currentTarget.valueAsNumber)}
			/>
			<NumberInputButton
				icon={<RiSystemAddFill />}
				onClick={() => update(props.value + 1)}
				disabled={props.disabled ?? props.value >= max()}
			>
				Increment
			</NumberInputButton>
		</div>
	);
}

function NumberInputButton(
	props: ComponentProps<'button'> & {
		icon: JSX.Element;
	},
) {
	const [local, others] = splitProps(props, ['icon', 'children']);
	return (
		<button
			type="button"
			class="flex aspect-square h-full items-center justify-center transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
			{...others}
		>
			<span class="sr-only">{local.children}</span>
			{local.icon}
		</button>
	);
}
