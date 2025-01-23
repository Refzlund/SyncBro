<script lang='ts'>
	
	import { noPropagation } from '../../lib/utility/helpers.svelte'
	import SelectSource from './SelectSource.svelte'

	import floatingUI, { portal, offset, shift } from 'floating-runes'

	const float = floatingUI({
		middleware: [
			offset(8),
			shift()
		]
	})

	let selectSource = $state(false)

</script>
<!---------------------------------------------------->


<div>
	<button
		id='select-source'
		onpointerdowncapture={noPropagation}
		use:float.ref
		onclickcapture={() => selectSource = !selectSource}
	>
		<span>Select source</span>
	</button>
	<button
		id='menu'
		onpointerdowncapture={noPropagation}
		aria-label='Menu'
	>
		<span class='iconify ion--menu-outline'></span>	
	</button>
</div>

<SelectSource
	{float} open={selectSource}
/>


<!---------------------------------------------------->
<style lang='postcss'>

	:global(window:not(.focused) div) {
		@apply opacity-50;
	}

	div {
		@apply flex items-center justify-center opacity-90 duration-300 gap-1.5 select-none;
	}

	#select-source {
		@apply
			flex max-w-96 w-full h-8 rounded-lg opacity-90
			justify-center items-center duration-150
			border border-neutral-500 border-opacity-40 bg-neutral-600 bg-opacity-50
			hover:bg-opacity-80 hover:border-opacity-80
		;
	}

	span {
		@apply text-sm duration-200 text-neutral-200 text-opacity-80;
	}

	button:hover span {
		@apply text-neutral-100;
	}

	#menu, #menu span {
		@apply flex items-center justify-center h-full w-8;
	}

	#menu span {
		@apply w-4;
	}

	#menu:hover span {
		@apply scale-y-125;
	}

</style>