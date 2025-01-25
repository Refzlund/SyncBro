<script lang="ts">
	import { generalCache } from '$lib/general-settings.svelte'
	import { open } from '@tauri-apps/plugin-dialog'
	import Options from './Options/Options.svelte'
	import VideoPlayer from './Video/VideoPlayer.svelte'
	import { onMount } from 'svelte'
	import { Shortcuts } from '$lib/shortcuts.svelte'
	
	async function openFile() {
		const file = await open({
			directory: false,
			multiple: false,
			filters: [
				{
					name: 'Videos',
					extensions: ['mp4', 'webm']
				},
				{
					name: 'Audio',
					extensions: ['mp3']
				}
			]
		})
		if(!file) return
		generalCache.currentVideo = file
		generalCache.recentVideo = file
	}

	onMount(() => Shortcuts.subscribe('open_file', openFile))

</script>

<!---------------------------------------------------->

<VideoPlayer video={generalCache.currentVideo}></VideoPlayer>

<Options />

<!---------------------------------------------------->
<style lang="postcss">
</style>
