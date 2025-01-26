<script lang='ts'>
	import { getAllWindows, Window } from '@tauri-apps/api/window'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { invoke } from '@tauri-apps/api/core'
	import { globals } from '$lib/utility/global.svelte'

	let appWindow: Window

	onMount(async () => {
		appWindow = (await Window.getByLabel('app'))!
	})

	interface Props {
	
	}
	
	let {
		
	}: Props = $props()

</script>
<!---------------------------------------------------->


<tray>
	{#if globals.openTray}
		<tray-menu transition:fly|global={{ y: 100, duration: 200 }}>
			<button
				onclick={async () => {
					await appWindow.setSkipTaskbar(false)
					await appWindow.show()
					await appWindow.setFocus()
				}}
			>
				<img class='animate-bounce' id='logo' width='18px' src='/syncbro.png' alt='syncbro logo'>
				Open SyncBro
			</button>
			<button
				onclick={async () => {
					await appWindow.setSkipTaskbar(true)
					await appWindow.hide()
				}}
			>
				Minimize to tray
			</button>
			<button
				onclick={() => { invoke('exit_app') }}
			>
				Exit
			</button>

			{#if globals.dev}
				<small class='p-4 pt-0 text-neutral-400 select-none'>
					Developer mode enabled
				</small>
			{/if}
		</tray-menu>
	{/if}
</tray>


<!---------------------------------------------------->
<style lang='postcss'>
	
	tray {
		@apply grid w-screen h-screen items-end overflow-hidden p-2.5 justify-center;
	}

	tray-menu {
		@apply
			flex flex-col w-56 bg-neutral-800 text-neutral-200 rounded-lg
			p-2 gap-2 bg-opacity-95 backdrop-blur-lg
		;
	}

	button {
		@apply
			flex gap-3 items-center
			w-full border border-neutral-400 bg-neutral-500 rounded-lg p-2.5 px-4 text-left
			border-opacity-0 bg-opacity-0 hover:bg-opacity-25 hover:border-opacity-25 duration-100
		;
	}

</style>