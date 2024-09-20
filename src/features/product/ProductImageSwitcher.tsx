import type { GetImageResult } from 'astro';
import { RiSystemCheckLine } from 'solid-icons/ri';
import { For, Show, createSignal } from 'solid-js';
import { twMerge } from 'tailwind-merge';
import Card from '~/components/ui/Card.tsx';

interface ProductImageSwitcherProps {
	productImages: GetImageResult[];
}

export function ProductImageSwitcher(props: ProductImageSwitcherProps) {
	const [currentImageIndex, setCurrentImageIndex] = createSignal(0);
	const currentImage = () => {
		const img = props.productImages[currentImageIndex() % props.productImages.length];
		if (!img) throw new Error('Product image index out of bounds.');
		return img;
	};

	return (
		<div class="flex aspect-[10/9] items-stretch gap-2">
			<div class="relative flex flex-col gap-[inherit] overflow-hidden will-change-scroll">
				<For each={props.productImages}>
					{(image, index) => (
						<button
							onClick={() => {
								setCurrentImageIndex(index());
							}}
							class={twMerge(
								'relative aspect-square h-20 flex-shrink-0 border border-theme-base-200 bg-theme-base-100 p-1 first:mt-auto last:mb-auto',
								index() === currentImageIndex() && 'border-theme-base-900',
							)}
							type="button"
						>
							<img
								{...image.attributes}
								alt=""
								src={image.src}
								srcset={image.srcSet.attribute}
								class="h-full w-full object-cover"
							/>
							<Show when={index() === currentImageIndex()}>
								<RiSystemCheckLine
									class="pointer-events-none absolute right-1 top-1 text-theme-base-900"
									aria-hidden
								/>
							</Show>
						</button>
					)}
				</For>
			</div>
			<Card class="aspect-square">
				<img
					{...currentImage().attributes}
					alt=""
					src={currentImage().src}
					srcset={currentImage().srcSet.attribute}
					class="h-full w-full rounded-lg object-cover"
				/>
			</Card>
		</div>
	);
}
