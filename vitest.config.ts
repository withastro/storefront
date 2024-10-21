import tsconfigPaths from 'vite-plugin-tsconfig-paths';
import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		exclude: [...defaultExclude, 'e2e/**/*'],
	},
});
