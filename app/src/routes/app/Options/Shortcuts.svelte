<script lang='ts'>
	import { Shortcut, Shortcuts } from '$lib/shortcuts.svelte'
	import { addListener } from '$lib/utility/helpers.svelte'


	interface Props {
	
	}
	
	let {
		
	}: Props = $props()

	function shortcutText(shortcut: Shortcut) {
		switch (shortcut.key) {
			case ' ':
				return 'Space'
			case 'Tab':
				return 'Tab'
			default:
				return shortcut.key.toUpperCase()
		}
	}

	let setting = $state() as undefined | Shortcut
	let cleanSetting = [] as (() => void)[]
	function setKey(shortcut: Shortcut) {
		setting = shortcut

		let modifier = {
			Control: false,
			Shift: false,
			Alt: false,
			Meta: false
		}

		const modifiers = Object.keys(modifier) as (keyof typeof modifier)[]

		const cleanDown = addListener(document, 'keydown', e => {
			e.preventDefault()
			e.stopPropagation()
			e.stopImmediatePropagation()
			
			const target = e.target as HTMLElement
			target.blur()

			if(e.key == 'Escape') {
				setting = undefined
				cleanUp()
				cleanDown()
				return
			}			

			if(modifiers.includes(e.key as any)) {
				const key = e.key as keyof typeof modifier
				modifier[key] = true
				return
			}

			setting = undefined
			cleanSetting.map(v => v())
			cleanSetting = []

			shortcut.alt = modifier.Alt
			shortcut.ctrl = modifier.Control
			shortcut.meta = modifier.Meta
			shortcut.shift = modifier.Shift
			shortcut.key = e.key

			}, { capture: true }
		)

		const cleanUp = addListener(document, 'keyup', e => {
			e.preventDefault()
			e.stopPropagation()
			e.stopImmediatePropagation()
			
			if(modifiers.includes(e.key as any)) {
				const key = e.key as keyof typeof modifier
				modifier[key] = false
				return
			}

			}, { capture: true }
		)

		cleanSetting.map(v => v())
		cleanSetting = []
		cleanSetting.push(cleanUp, cleanDown)
	}

</script>
<!---------------------------------------------------->


<shortcuts>

	{#each Shortcuts as shortcut}
		<shortcut>
			<span>{shortcut.name}</span>
			<button 
				onclick={() => setKey(shortcut)}
				class:setting={setting === shortcut}
			>
				{#if setting === shortcut}
					<span class='animate-pulse flex gap-2 items-center'>
						<small>Press key</small>
						<span class='iconify ion--stop-outline'></span>
					</span>
				{:else}
					{#if shortcut.meta}
						<span class='iconify ion--logo-windows-outline size-3.5'></span>
					{/if}
					{#if shortcut.shift}
						Shift
					{/if}
					{#if shortcut.ctrl}
						Ctrl
					{/if}
					{#if shortcut.alt}
						Alt
					{/if}
					{shortcutText(shortcut)}
				{/if}
			</button>
		</shortcut>
	{/each}

</shortcuts>


<!---------------------------------------------------->
<style lang='postcss'>
	
	shortcuts {
		@apply flex flex-col gap-3.5;
	}

	shortcut {
		@apply grid grid-cols-[1fr,auto] items-center text-neutral-200 select-none;
		button {
			@apply
				flex items-center justify-center gap-2
				border border-neutral-500 text-neutral-300 px-4 py-1 rounded
				bg-neutral-500 bg-opacity-10 duration-150 min-h-9
			;
			&:hover {
				@apply bg-opacity-20 border-primary-400 border-opacity-75 text-neutral-100;
			}

			&.setting {
				@apply text-primary-400 border-primary-400 border-opacity-85;
			}
		}
	}

</style>