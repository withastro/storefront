import { QueryClient } from '@tanstack/solid-query';

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			onSettled: async () => {
				await queryClient.invalidateQueries();
			},
			onError: (error) => {
				console.error(error);
			},
		},
	},
});
