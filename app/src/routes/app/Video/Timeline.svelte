<script lang='ts'>
	import floatingUI, { portal, arrow, offset, shift } from 'floating-runes'
	import type { VideoState } from './video.svelte'
	import { fade, fly } from 'svelte/transition'
	import { addListener, formatTime } from '$lib/utility/helpers.svelte'


	interface Props {
		videoState: VideoState
		videoElement: HTMLVideoElement
	}
	
	let {
		videoState,
		videoElement
	}: Props = $props()

	let float = floatingUI({
		placement: 'top',
		middleware: [
			offset(24),
			shift({ padding: 14 }),
			arrow({ padding: 10 })
		]
	})


	let hoverTimeline = $state(false)
	let timebarElement = $state() as HTMLElement
	let thumbnailPreview = $state(1)
	let thumbnailURL = $derived(
		videoState.thumbnails[Math.max(0, Math.min(thumbnailPreview, videoState.thumbnails.length - 1))])
	let thumbnailTime = $state(0)

	let timelineX = $state('0')

	const formattedThumbnailTime = $derived(formatTime(thumbnailTime))

	let scrollingTimeline = $state(false)

	function pointerDown(e: MouseEvent) {
		e.stopPropagation()
		e.preventDefault()

		const cleanMove = addListener(document, 'pointermove', e => {
			e.stopPropagation()
			e.preventDefault()
			cleanMove()
			cleanUp()
			scrollingTimeline = true

			const endMove = addListener(document, 'pointermove', e => {
				const rect = timebarElement.getBoundingClientRect()
				videoElement.currentTime = (e.clientX - rect.left) / rect.width * videoElement.duration
				videoState.time.current = videoElement.currentTime
				computeTimelabel(e)
			})

			addListener(document, 'pointerup', e => {
				endMove()
				scrollingTimeline = false
			}, { once: true })
		}, { once: true })

		const cleanUp = addListener(document, 'pointerup', e => {
			e.stopPropagation()
			e.preventDefault()

			const rect = timebarElement.getBoundingClientRect()
			videoElement.currentTime = (e.clientX - rect.left) / rect.width * videoElement.duration
			videoState.time.current = videoElement.currentTime

			cleanMove()
			cleanUp()
		}, { once: true })
	}

	function computeTimelabel(e: MouseEvent) {
		if(!hoverTimeline || !timebarElement) return

		const rect = timebarElement.getBoundingClientRect()
		
		/** 0 to 1 */
		const pos = (e.clientX - rect.left) / rect.width
		
		timelineX = Math.min(
			Math.max(pos * 100, 0),
			100
		).toFixed(2)
		
		thumbnailTime = Math.min(
			Math.max(0.01, pos * videoElement.duration),
			videoElement.duration - 0.01
		)

		float.compute()

		const size = videoState.thumbnails.length
		thumbnailPreview = Math.floor(pos * size)
	}

</script>
<!---------------------------------------------------->


<svelte:window onmousemove={computeTimelabel} />

{#if hoverTimeline && videoState.time.max > 0}
	<time-thumbnail 
		use:float
		use:portal
		transition:fly={{ y: -10, duration: 150 }}
	>
		{#if thumbnailURL && !scrollingTimeline}
			<img
				src={thumbnailURL}
				alt='Thumbnail'
				out:fade={{ duration: 75 }}
				in:fade={{ duration: 200 }}
			/>
		{/if}
		<arrow use:float.arrow class:rounded-lg={!thumbnailURL || scrollingTimeline}>
			<small>
				{formattedThumbnailTime}
			</small>
		</arrow>
	</time-thumbnail>
{/if}

<!-- svelte-ignore a11y_click_events_have_key_events -->
<video-time
	role='button'
	tabindex='-1'
	onpointerenter={() => hoverTimeline = true}
	onpointerleave={() => hoverTimeline = false}
	onpointerdowncapture={pointerDown}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<time-bar
		bind:this={timebarElement}
		class='relative'
	>
		<div class='absolute w-full h-full overflow-hidden rounded-full'>
			<mouse-position
				use:float.ref
				style='left: {timelineX}%'
			></mouse-position>
		</div>
		<current-time
			role='progressbar'
			class='pointer-events-none'
			style:width='{(videoState.time.current / videoState.time.max) * 100}%'
			style:transition='{scrollingTimeline ? 'none' : ''}'
		>
		</current-time>
		<time-handle
			class='pointer-events-none'
			style:left='{(videoState.time.current / videoState.time.max) * 100}%'
		></time-handle>
	</time-bar>
</video-time>


<!---------------------------------------------------->
<style lang='postcss'>

	video-time {
		@apply 
			flex w-full h-8 items-center cursor-pointer
			rounded-full bg-opacity-25 duration-150
			outline-none	
		;
	}

	mouse-position {
		@apply absolute left-0 pointer-events-none w-1 h-full bg-neutral-400 opacity-0;
		transition: opacity 200ms ease;
	}

	video-time:hover {
		mouse-position {
			@apply opacity-50;
		}
	}

	time-bar {
		@apply flex w-full h-1.5 bg-neutral-100 mx-8 rounded-full bg-opacity-25 duration-150;
	}

	current-time {
		@apply h-full bg-gradient-to-r from-primary-400 to-accent-300 rounded-full select-none;
		transition: width 333ms linear;
	}

	time-handle {
		@apply 
			size-3.5 bg-accent-300 rounded-full opacity-0 duration-150
			-translate-x-1/2 -translate-y-[25%]	scale-50 ease-out
		;
	}

	time-thumbnail {
		@apply
			flex justify-center items-center rounded-xl
			 pointer-events-none
		;
		img {
			@apply h-32 rounded-lg z-10 bg-neutral-800 p-[3px] bg-opacity-75 backdrop-blur-md;
		}
		arrow {
			@apply 
				absolute flex justify-center items-center 
				!-bottom-5 px-2 h-5 bg-neutral-800
				rounded-b-lg bg-opacity-60 backdrop-blur-md
			;
			small {
				@apply -mt-0 py-2.5 text-neutral-200 text-opacity-90;
			}
		}
	}

	time-thumbnail arrow.rounded-lg {
		@apply h-6;
	}

	time-thumbnail arrow:not(.rounded-lg) small {
		@apply -mt-1;
	}

	:global(video-controls:hover) {
		time-bar {
			@apply h-2;
		}
		time-handle {
			@apply opacity-100 scale-100;
		}
	}

</style>