<script lang='ts'>
	import { getCurrentWindow } from '@tauri-apps/api/window'
	import { onMount, type Snippet } from 'svelte'
	import Center from './Center.svelte'
	import { addListener, noPropagation } from '../../lib/utility/helpers.svelte'

	const window = getCurrentWindow()

	let isFocused = $state(true)
	window.onFocusChanged((e) => isFocused = e.payload)

	onMount(() => {
		window.isFocused().then((focused) => isFocused = focused)
	})
	
	interface Props {
		children: Snippet
	}

	let {
		children
	}: Props = $props()

	let isDragging = $state(false)
	/** A workaround to avoid flickering the cursor-type after moving the window. */
	let windowMovedAt = $state(Date.now())
	let drag = () => {
		const end = () => {
			clean()
			isDragging = false
		}
		const start = () => {
			isDragging = true
			window.startDragging()
			windowMovedAt = Date.now()
			clean = addListener(document, 'pointermove', (e) => {
				if (windowMovedAt > Date.now() - 50) return
				end()
			})
		}
		let clean = addListener(document, 'pointermove', start, { once: true })
		addListener(document, 'pointerup', end, { once: true })
	}

	window.onMoved(() => windowMovedAt = Date.now())



</script>
<!---------------------------------------------------->

<svelte:head>
	{#if isDragging}
		<style> * { cursor: grabbing !important; } </style>
	{/if}
</svelte:head>

<svelte:window
	onpointerup={() => isDragging = false}
	oncontextmenu={(e) => e.preventDefault()}	
/>

<window class:focused={isFocused}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<header 
		onpointerdown={drag} 
		ondblclick={e => {
			const target = e.target as HTMLElement
			if (target.tagName === 'BUTTON') return
			window.toggleMaximize()
		}}
	>
		<h4 id='title' class='flex gap-3'>
			<img id='logo' width='18px' src='/syncbro.png' alt='syncbro logo'>
			SyncBro
		</h4>
		<Center />
		<actions>
			<button 
				id='window-minimize' 
				onpointerdowncapture={noPropagation} 
				onclick={window.minimize} 
				aria-label='Minimize window'
			>
				<span class='ion--remove-outline'></span>
			</button>
			<button 
				id='window-maximize' 
				onpointerdowncapture={noPropagation} 
				onclick={window.toggleMaximize} 
				aria-label='Maximize window'
			>
				<span class='ion--scan-outline'></span>
			</button>
			<button 
				id='window-close' 
				onpointerdowncapture={noPropagation} 
				onclick={window.close} 
				aria-label='Close window'
			>
				<span class='ion--close-outline'></span>
			</button>
		</actions>
	</header>
	<view>
		{@render children()}
	</view>
</window>




<!---------------------------------------------------->
<style lang='postcss'>

	:global(:root) {
		@apply bg-opacity-0 text-neutral-200;
	}

	#logo, #title {
		@apply duration-300 opacity-100;
	}

	view, header {
		@apply duration-300;
	}

	window:not(.focused) {
		view, header {
			@apply bg-opacity-100;
		}
		#logo {
			@apply opacity-50;
		}
		#title {
			@apply opacity-60;
		}
	}

	view {
		@apply bg-neutral-700 bg-opacity-90 h-full flex w-full overflow-auto;
	}
	
	window {
		@apply grid grid-rows-[40px,1fr] h-screen;
	}

	header {
		@apply grid justify-between grid-cols-[130px,1fr,130px] hover:!cursor-grab bg-neutral-800 bg-opacity-60;
	}

	header > * {
		@apply flex h-full items-center px-4 select-none;
	}

	actions {
		@apply justify-end pr-0;
	}

	actions > button {
		@apply flex px-3 items-center h-full hover:text-neutral-100 duration-200;
	}

	actions > button > span {
		@apply iconify pointer-events-none;
	}

	#window-close {
		@apply hover:bg-alert-500 hover:bg-opacity-50 pr-4;
	}

	actions > button:hover > span {
		@apply duration-100 scale-125;
	}

</style>