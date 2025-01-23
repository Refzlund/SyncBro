const { addIconSelectors } = require('@iconify/tailwind')

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {},
		colors: {
			transaparent: 'transparent',
			primary: {
				400: 'hsl(333, 85%, 65%)'
			},
			accent: {
				300: 'hsl(290, 95%, 35%)'
			},
			neutral: {
				900: 'hsl(222, 15%, 5%)',
				800: 'hsl(222, 15%, 15%)',
				700: 'hsl(222, 15%, 17%)',
				600: 'hsl(222, 15%, 20%)',
				550: 'hsl(222, 15%, 25%)',
				500: 'hsl(222, 15%, 40%)',
				400: 'hsl(222, 15%, 60%)',
				200: 'hsl(222, 25%, 85%)',
				100: 'hsl(222, 25%, 95%)',
			},
			alert: {
				500: 'hsl(10, 80%, 50%)'
			}
		}
	},
	plugins: [addIconSelectors(['ion'])]
}
