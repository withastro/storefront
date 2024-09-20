import kobalte from '@kobalte/tailwindcss';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import colors from 'tailwindcss/colors.js';
import { fontFamily } from 'tailwindcss/defaultTheme.js';
import plugin from 'tailwindcss/plugin.js';

export default {
	content: ['./src/**/*.{astro,js,jsx,ts,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter Variable', ...fontFamily.sans],
			},
			colors: {
				theme: {
					base: colors.slate,
				},
			},
		},
	},
	plugins: [
		animate,
		kobalte,
		typography,
		plugin(function customStyles(api) {
			api.addUtilities({
				'.grid-center': {
					display: 'grid',
					'place-items': 'center',
					'place-content': 'center',
				},
			});
		}),
	],
	corePlugins: {
		container: false,
	},
} satisfies Config;
