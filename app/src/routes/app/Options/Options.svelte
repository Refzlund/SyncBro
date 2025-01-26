<script lang='ts'>
	import { app } from '@tauri-apps/api'
	import floatingUI from 'floating-runes'
	import General from './General.svelte'
	import Video from './Video.svelte'
	import ShortcutsComponent from './Shortcuts.svelte'
	import Plugins from './Plugins.svelte'
	import { Shortcuts } from '$lib/shortcuts.svelte'
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import { exit } from '$lib/utility/helpers.svelte'

	let float = floatingUI()

	let currentSection = $state('General')
	let CurrentSection = $derived(
		currentSection === 'General' ? General 
		: currentSection === 'Video' ? Video
		: currentSection === 'Shortcuts' ? ShortcutsComponent
		: currentSection === 'Plugins' ? Plugins
		: undefined
	)

	let visible = exit(250, true)

	onMount(() => Shortcuts.subscribe('toggle_menu_options', () => visible.toggle()))

</script>
<!---------------------------------------------------->

{#snippet section(text: string)}
	{@const active = currentSection === text}
	<li
		use:float.ref={() => active}
		use:float.tether={'pointerenter'}
	>
		<button
			class={active ? 'cursor-default' : 'cursor-pointer'}
			class:active={active}
			onclick={() => currentSection = text}
		>
			{text} 
		</button>
	</li>
{/snippet}


{#if visible.show}
	<app-options class='overflow-hidden'>
		<modal class:exiting={visible.exiting}>
			<modal-header>
				{#if float.referenced}
					<float
						use:float style='width: {float.attached?.scrollWidth}px;'
					></float>
				{/if}
				<ul id='options-header' use:float.untether={'pointerleave'}>
					{@render section('General')}
					{@render section('Video')}
					{@render section('Shortcuts')}
					{@render section('Plugins')}
				</ul>
				<button
					class='iconify ion--close-outline p-2.5'
					aria-label='Close Options'
					onclick={() => Shortcuts.trigger('toggle_menu_options')}
				></button>
			</modal-header>
			<modal-content>
				<CurrentSection />
			</modal-content>
			<modal-footer>
				{#await app.getVersion() then version}
					Version {version}
				{/await}
			</modal-footer>
		</modal>

	</app-options>
{/if}





<!---------------------------------------------------->
<style lang='postcss'>
	
	float {
		@apply absolute h-0.5 bg-primary-400 rounded-full left-0 scale-100;
		transition: 
			left 100ms ease-out,
			width 150ms ease-out,
			opacity 250ms ease-out,
			transform 200ms ease-out,
		;

		@starting-style {
			height: 0px;
			opacity: 0;
			transform: translateY(2px);
			transition: all 0s;
		}
	}

	app-options {
		@apply absolute right-0 top-0 bottom-0 p-4;
	}

	modal {
		@apply 
			bg-neutral-800 h-full py-4 rounded-lg px-6 min-w-96
			border border-neutral-200 border-opacity-10	bg-opacity-85 backdrop-blur-lg
			grid grid-rows-[auto,1fr,auto] gap-6
		;

		transition: 250ms ease-out;

		@starting-style {
			opacity: 0;
			transform: translateX(2rem);
		}
		&.exiting {
			opacity: 0;
			transform: translateX(2rem);
		}
	}

	modal-footer {
		@apply grid justify-center text-neutral-400 select-none text-sm;
	}

	modal-header {
		@apply flex items-center;
		> button {
			@apply text-neutral-400 duration-150 ml-auto;
			&:hover {
				@apply text-primary-400 scale-125;
			}
		}
	}

	#options-header {
		@apply flex gap-5 select-none items-center;

		

		li > button {
			@apply text-neutral-400 duration-150;
			&:hover {
				@apply text-neutral-300;
			}
			&.active {
				@apply text-neutral-200;
			}
		}
	}

</style>