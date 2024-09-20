import { type ClassNameValue, twMerge } from 'tailwind-merge';

export function button({
	theme = 'dark',
	className,
}: {
	theme?: 'light' | 'dark';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		theme === 'dark' && 'bg-theme-base-900 hover:bg-theme-base-600 text-white',
		theme === 'light' && 'bg-theme-base-100 hover:bg-theme-base-200 text-theme-base-900',
		'h-9 px-4 text-sm font-semibold uppercase transition flex items-center justify-center gap-1.5',
		className,
	);
}

export function input({
	theme = 'light',
	className,
}: {
	theme?: 'light' | 'dark';
	className?: ClassNameValue;
} = {}) {
	return twMerge(
		'border px-3 min-h-9 min-w-0 block w-64',
		theme === 'dark' && 'bg-theme-base-800 text-white border-theme-base-700',
		theme === 'light' && 'bg-theme-base-100 text-theme-base-600 border-theme-base-200',
		className,
	);
}

export function card({ className }: { className?: ClassNameValue } = {}) {
	return twMerge('relative flex bg-theme-base-100', className);
}
