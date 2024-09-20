import { defineConfig } from '@hey-api/openapi-ts';
import { loadEnv } from 'vite';

const { SHOP_API_URL } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
	client: '@hey-api/client-fetch',
	input: new URL('/doc', SHOP_API_URL).href,
	output: {
		format: 'prettier',
		path: 'src/lib/.client',
	},
});
