import { invoke } from '@tauri-apps/api/core'
import { readFile } from '@tauri-apps/plugin-fs'
import { untrack } from 'svelte'

export class VideoState {
	videoPath = $state('')
	videoObjectURL = $state() as undefined | string

	paused = $state(true)
	time = $state({
		current: 0,
		max: 0
	})
	thumbnails = $state([]) as string[]

	constructor(videoPath: () => string) {
		$effect(() => {
			this.videoPath = videoPath()
			untrack(() => {
				this.thumbnails = []
				this.loadVideo()
				this.loadThumbnails()
			})
		})
	}

	async loadVideo() {
		if(this.videoObjectURL) {
			URL.revokeObjectURL(this.videoObjectURL)
			this.videoObjectURL = undefined
		}

		const blob = new Blob([
			await readFile(this.videoPath)
		], {
			type: 'video/mp4'
		})

		this.videoObjectURL = URL.createObjectURL(blob)
	}

	async loadThumbnails() {
		try {
			const base64 = await invoke<string[]>('get_thumbnails', {
				videoPath: this.videoPath,
				count: 100,
				width: 160,
				height: 90
			})

			this.thumbnails = await Promise.all(
				base64.map(v =>
					new Promise<string>(async resolve => {
						const blob = new Blob([await readFile(v)], { type: 'image/webp' })
						resolve(URL.createObjectURL(blob))
					})
				)
			)
		} catch (e) {
			console.error("Thumbnail generation failed:", e)
		}
	}
}