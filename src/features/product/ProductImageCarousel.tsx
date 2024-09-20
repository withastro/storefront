import type { GetImageResult } from 'astro';
import { For, createSignal, onMount } from 'solid-js';
import Card from '~/components/ui/Card.tsx';

interface ProductImageCarouselProps {
	productImages: GetImageResult[];
}

export function ProductImageCarousel(props: ProductImageCarouselProps) {
	const [currentIndex, setCurrentIndex] = createSignal(0);
	let containerRef: HTMLUListElement | undefined;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setCurrentIndex(Number(entry.target.getAttribute('data-index')));
					}
				}
			},
			{ root: containerRef, threshold: 0.5 },
		);

		for (const el of containerRef?.querySelectorAll('li[data-index]') ?? []) {
			observer.observe(el);
		}

		return () => observer.disconnect();
	});

	const scrollToImage = (index: number) => {
		containerRef?.children[index]?.scrollIntoView({
			block: 'nearest',
			inline: 'center',
			behavior: 'smooth',
		});
	};

	return (
		<div class="relative">
			<ul
				ref={containerRef}
				class="relative flex w-full snap-x snap-mandatory gap-2 overflow-x-auto"
				tabindex="0"
				aria-label="Product images"
			>
				<For each={props.productImages}>
					{(image, index) => (
						<li class="w-full shrink-0" data-index={index()}>
							<Card class="flex aspect-square w-full items-center justify-center">
								<img
									{...image.attributes}
									alt=""
									src={image.src}
									srcset={image.srcSet.attribute}
									loading={index() === 0 ? 'eager' : 'lazy'}
									draggable={false}
									class="snap-center"
								/>
							</Card>
						</li>
					)}
				</For>
			</ul>

			<div class="absolute inset-x-0 bottom-4 flex justify-center">
				<div class="flex gap-3 rounded-full bg-white p-1.5">
					<For each={props.productImages}>
						{(_, index) => (
							<div
								class="relative flex size-4 items-center justify-center rounded-full bg-white will-change-transform after:pointer-events-none after:block after:size-2 after:rounded-full after:bg-theme-base-400 after:transition-colors after:will-change-transform after:content-[''] hover:after:bg-theme-base-500 data-[current=true]:bg-black data-[current=true]:after:bg-white"
								data-current={index() === currentIndex()}
								aria-label={`Show image ${index() + 1}`}
							>
								<button
									type="button"
									class="absolute left-1/2 top-1/2 size-11 -translate-x-1/2 -translate-y-1/2"
									onClick={() => scrollToImage(index())}
								>
									<span class="sr-only">Show image {index() + 1}</span>
								</button>
							</div>
						)}
					</For>
				</div>
			</div>
		</div>
	);
}
