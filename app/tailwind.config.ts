import { addIconSelectors } from '@iconify/tailwind'
import { defaultTheme } from './src/colors.config'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		colors: defaultTheme
	},
	plugins: [addIconSelectors(['ion'])]
}
