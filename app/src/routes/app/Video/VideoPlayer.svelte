<script lang='ts'>
	import { Shortcut, Shortcuts } from '$lib/shortcuts.svelte'
	import { onMount } from 'svelte'
	import { on } from 'svelte/events'
	import { VideoState } from './video.svelte'
	import Timeline from './Timeline.svelte'
	import { formatTime } from '$lib/utility/helpers.svelte'
	import { generalCache } from '$lib/general-settings.svelte'
	import Volume from './Volume.svelte'
	import { getCurrentWindow } from '@tauri-apps/api/window'
	import { app } from '@tauri-apps/api'
	
	interface Props {
		video: string
	}
	
	let {
		video
	}: Props = $props()	

	let currentWindow = getCurrentWindow()
	let videoElement = $state() as HTMLVideoElement
	
	const videoState = new VideoState(() => video)
	
	let currentTime = $derived(formatTime(videoState.time.current))
	let maxTime = $derived(formatTime(videoState.time.max))

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
				}),
				Shortcuts.subscribe(
					'play_pause', 
					() => videoElement.paused ? videoElement.play() : videoElement.pause()
				),
				Shortcuts.subscribe(
					'fullscreen',
					async () => currentWindow.setFullscreen(!await currentWindow.isFullscreen())
				)
			]
			
			return () => events.forEach(v => v())
		})
	}	

	let isFullscreen = $state(false)
	currentWindow.onResized(async () => {
		isFullscreen = await currentWindow.isFullscreen()
	})

</script>
<!---------------------------------------------------->



<video-player class:paused={videoState.paused}>
	{#if videoState.videoObjectURL}
		<video
			bind:this={videoElement}
			use:playerEvents
			class='size-full'
			ondblclick={() => Shortcuts.trigger('fullscreen')}
			onclick={() => Shortcuts.trigger('play_pause')}
			bind:volume={
				() => generalCache.enableVolume ? generalCache.volume : 0,
				v => {
					if(v > 0) generalCache.volume = v
				}
			}
		>
			<source src={videoState.videoObjectURL} />
			<track kind='captions' />
		</video>
	{:else}
		<span class='iconify ion--play text-4xl'></span>
	{/if}
	
	{#if videoState.videoObjectURL}
		<video-controls>
			<Timeline
				{videoElement}
				{videoState}
			/>

			<video-controls-buttons>
				<left class='flex gap-3.5 items-center -ml-1.5'>
					<button
						id='play-button'
						onclick={() => videoElement.paused ? videoElement.play() : videoElement.pause()}
						class='iconify size-7'
						aria-label='Play'
					></button>

					<div class='flex items-center -ml-0.5 mr-1'>
						<button
							onclick={() => generalCache.enableVolume = !generalCache.enableVolume}
						>
							<Volume
								enabled={generalCache.enableVolume}
								volume={generalCache.volume}
							/>
						</button>
						<slider></slider>
					</div>
					<span class='tracking-wide flex gap-1.5 items-center'>
						<span class='tabular-nums'> {currentTime} </span>
						<span class='text-sm'> / </span>
						<span class='tabular-nums'> {maxTime} </span>
					</span>
				</left>
				<center></center>
				<right>
					<!-- subtitles -->
					<!-- picture-in-picture -->
					<button
						onclick={() => Shortcuts.trigger('fullscreen')}
						class='
							iconify size-6 ion--tablet-landscape-outline duration-150
							{isFullscreen ? 'scale-125' : 'scale-100'}
							{isFullscreen ? 'hover:scale-100' : 'hover:scale-125'}
						'
						aria-label='Fullscreen'
					>
					</button>
				</right>
			</video-controls-buttons>
		</video-controls>
	{/if}

</video-player>


<!---------------------------------------------------->
<style lang='postcss'>

	left {
		button {
			@apply opacity-85 hover:opacity-100 duration-150 hover:scale-110;
		}
	}

	#play-button {
		@apply ion--pause;
	}

	video-player.paused #play-button {
		@apply ion--play;
	}

	video-controls-buttons {
		@apply grid grid-cols-[auto,1fr,auto] w-full px-10;
	}

	video-controls {
		@apply
			absolute bottom-0 left-0 right-0 h-28 flex flex-col items-center pt-1
			justify-center gap-0
			bg-gradient-to-t from-neutral-900 to-transaparent
		;
	}
	
	video-player {
		@apply relative flex h-full max-h-full w-full max-w-full items-center justify-center;
	}

</style>