import { QueryClientProvider } from '@tanstack/solid-query';
import { SolidQueryDevtools as Devtools } from '@tanstack/solid-query-devtools';
import { queryClient } from '~/lib/query.ts';

export function SolidQueryDevtools() {
	return (
		<QueryClientProvider client={queryClient}>
			<Devtools />
		</QueryClientProvider>
	);
}
