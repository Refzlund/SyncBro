<script lang='ts'>
	import { generalCache } from '$lib/general-settings.svelte'
	import floatingUI, { portal } from 'floating-runes'
	import { fly } from 'svelte/transition'
	import { open as openDialog } from '@tauri-apps/plugin-dialog'
	import { Shortcuts } from '$lib/shortcuts.svelte'

	interface Props {
		open: boolean
		float: ReturnType<typeof floatingUI>
	}

	let { float, open }: Props = $props()
	
</script>
<!---------------------------------------------------->

{#if open}
	<select-source 
		transition:fly={{ y: -5, duration: 300 }}
		use:float
		use:portal
		style='width: {float.referenced?.scrollWidth}px;'
	>
		<grouped>
			<list> Recent </list>
			<list> Playlists </list>
			<button class='flex items-center gap-1.5 overflow-visible'>
				<span class='ping'>
					<span class='animate-ping'></span>
					<span></span>
				</span>
				<span>Connect</span>
			</button>
		</grouped>
		<button onclick={() => Shortcuts.trigger('open_file')}>This PC</button>
		<button>YouTube</button>
	</select-source>
{/if}


<!---------------------------------------------------->
<style lang='postcss'>

	.ping {
		@apply relative flex h-2 w-2;
		> span:first-child {
			@apply absolute inline-flex h-full w-full rounded-full bg-alert-500 opacity-75;
			animation-duration: 1.5s;
		}
		> span:last-child {
			@apply relative inline-flex rounded-full h-2 w-2 bg-alert-500;
		}
	}

	grouped {
		@apply grid grid-cols-3 gap-4 w-full p-4 py-4;

		list, button {
			@apply 
				flex justify-center px-4 py-1 border border-neutral-700 rounded-lg
				duration-150 cursor-pointer
				hover:bg-neutral-700 bg-neutral-700 bg-opacity-25 hover:bg-opacity-85
				hover:border-primary-400 hover:border-opacity-50
			;
		}
	}

	select-source {
		@apply 
			flex flex-col items-center justify-center bg-neutral-800 rounded-md
			overflow-hidden pb-3 bg-opacity-80 backdrop-blur-md
		;
	}

	select-source > button {
		@apply
			flex w-full p-4 py-2 hover:bg-neutral-600 hover:bg-opacity-50 duration-150
			hover:text-primary-400
			/* border-t border-b border-opacity-0 hover:border-opacity-50 border-t-primary-400 border-b-primary-400 */
		;
	}

</style>