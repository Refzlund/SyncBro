<script lang='ts'>
	import { invoke } from '@tauri-apps/api/core'
	import { readFile } from '@tauri-apps/plugin-fs'
	import floatingUI, { portal, offset, shift, arrow } from 'floating-runes'
	import { onDestroy } from 'svelte'
	import { on } from 'svelte/events'
	import { fly } from 'svelte/transition'
	
	interface Props {
		video: string
	}
	
	let {
		video
	}: Props = $props()

	let float = floatingUI({
		placement: 'top',
		middleware: [
			offset(24),
			shift({ padding: 14 }),
			arrow({ padding: 10 })
		]
	})

	let videoElement: HTMLVideoElement
	let timebarElement: HTMLDivElement

	let objectUrls = [] as string[]
	async function updateVideoStream() {
		
		const test = await readFile(video)
		const url = URL.createObjectURL(new Blob([test.buffer as any], { type: 'video/mp4' }))

		objectUrls.push(url)
		videoElement.src = url
	}

	$effect(() => {
		updateVideoStream()
	})

	onDestroy(() => {
		for(const url of objectUrls) {
			URL.revokeObjectURL(url)
		}
	})
	
	const videoState = $state({
		paused: true,
		time: {
			current: 0,
			max: 0
		},
		thumbnails: [] as string[]
	})

	let thumbnailPreview = $state(1)
	let thumbnailURL = $derived(videoState.thumbnails[Math.max(0, Math.min(thumbnailPreview, videoState.thumbnails.length - 1))])
	let thumbnailTime = $state(0)

	let timelineX = $state('0')

	async function generateThumbnails() {
		try {
			const base64 = await invoke<string[]>('generate_thumbnails', {
				path: video,
				count: 100,
				width: 160,
				height: 90
			})
			videoState.thumbnails = base64.map(v => `data:image/jpeg;base64,${v}`)
		} catch(e) {
			console.error("Thumbnail generation failed:", e)
		}
	}

	function playerEvents(node: HTMLVideoElement) {
		const update = () => {
			videoState.time.max = node.duration
			videoState.time.current = node.currentTime
		}

		node.currentTime = 24

		$effect(() => {
			const events = [
				on(node, 'loadeddata', () => {
					videoElement.pause()
					update()

					generateThumbnails()
				}),
				on(node, 'pause', () => {
					videoState.paused = true
					update()
				}),
				on(node, 'play', () => {
					videoState.paused = false
					update()
				}),
				on(node, 'timeupdate', () => {
					update()
				})
			]
			
			return () => events.forEach(v => v())
		})
	}

	let lastThumbnailAt = 0

	const formattedThumbnailTime = $derived.by(() => {
		let hours = Math.floor(thumbnailTime / 3600);
		let minutes = Math.floor((thumbnailTime % 3600) / 60);
		let seconds = Math.floor(thumbnailTime % 60);

		if (hours > 0) {
			return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		} else {
			return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}
	})

	let hoverTimeline = $state(false)

</script>
<!---------------------------------------------------->

<svelte:window
	onkeydown={e => {
		const target = e.target as HTMLElement
		const interactiveElement = ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A']
		if(interactiveElement.includes(target.tagName)) return

		if(e.key === ' ') {
			videoElement.paused ? videoElement.play() : videoElement.pause() 
		}
	}}
	onmousemove={e => {
		if(!hoverTimeline) return

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
	}}
/>

<video-player class:paused={videoState.paused}>
	{#if video}
		<video use:playerEvents bind:this={videoElement}>
			<track kind='captions' />
		</video>
	{:else}
		<span class='iconify ion--play text-4xl'></span>
	{/if}

	<video-controls>
		{#if hoverTimeline && videoState.time.max > 0}
			<time-thumbnail class:!bg-opacity-0={!thumbnailURL} use:float use:portal transition:fly={{ y: -10, duration: 150 }}>
				{#if thumbnailURL}
					<img src={thumbnailURL} alt='Thumbnail' />
				{/if}
				<arrow use:float.arrow class:rounded-lg={!thumbnailURL}>
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
			onclick={(e: MouseEvent) => {
				const rect = timebarElement.getBoundingClientRect()
				videoElement.currentTime = (e.clientX - rect.left) / rect.width * videoElement.duration
			}}
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
				>
				</current-time>
				<time-handle
					class='pointer-events-none'
					style:left='{(videoState.time.current / videoState.time.max) * 100}%'
				></time-handle>
			</time-bar>
		</video-time>

		<video-controls-buttons>
			<button
				id='play-button'
				onclick={() => videoElement.paused ? videoElement.play() : videoElement.pause()}
				class='iconify text-3xl'
				aria-label='Play'
			></button>
		</video-controls-buttons>

	</video-controls>

</video-player>


<!---------------------------------------------------->
<style lang='postcss'>

	#play-button {
		@apply ion--pause;
	}

	video-player.paused #play-button {
		@apply ion--play;
	}

	video-controls {
		@apply
			absolute bottom-0 left-0 right-0 h-28 flex flex-col items-center pt-1
			justify-center gap-0
			bg-gradient-to-t from-neutral-900 to-transaparent
		;
	}

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
			flex justify-center items-center p-[3px] rounded-xl
			bg-neutral-800 pointer-events-none
		;
		img {
			@apply h-32 rounded-lg z-10;
		}
		arrow {
			@apply 
				absolute flex justify-center items-center 
				!-bottom-5 px-2 h-5 bg-neutral-800
				rounded-b-lg bg-opacity-60 backdrop-blur-md
			;
			small {
				@apply -mt-0.5 py-2.5 text-neutral-200 text-opacity-90;
			}
		}
	}

	time-thumbnail arrow.rounded-lg {
		@apply h-6;
	}
	time-thumbnail arrow:not(.rounded-lg) small {
		@apply -mt-1;
	}

	video-controls:hover {
		time-bar {
			@apply h-2;
		}
		time-handle {
			@apply opacity-100 scale-100;
		}
	}
	
	video-player {
		@apply relative flex h-full max-h-full w-full max-w-full items-center justify-center;
	}

</style>