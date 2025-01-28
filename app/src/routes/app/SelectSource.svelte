<script lang="ts">
	import floatingUI, { portal } from 'floating-runes'
	import { fly } from 'svelte/transition'
	import { Shortcuts } from '$lib/shortcuts.svelte'

	interface Props {
		open: boolean
		float: ReturnType<typeof floatingUI>
	}

	let { float, open }: Props = $props()
</script>

<!---------------------------------------------------->

{#if open}
	<select-source transition:fly={{ y: -5, duration: 300 }} use:float use:portal class="w-96">
		<grouped>
			<button>
				<span class="iconify ion--list-outline size-[18px]"></span>
				Playlists
			</button>
			<button class="gap-1.5 overflow-visible">
				<span class="ping">
					<span class="animate-ping"></span>
					<span></span>
				</span>
				<span>Watch Together</span>
			</button>
		</grouped>
		<button class="group" onclick={() => Shortcuts.trigger('open_file')}>
			<span
				class="
					iconify ion--folder-outline group-hover:!ion--folder-open-outline
					group-hover:opacity-100
				"
			></span>This PC
		</button>
		<button class="group">
			<span class="iconify ion--logo-youtube-outline group-hover:opacity-100"></span>
			YouTube
		</button>
		<lists>
			<ul>
				<h4>Recent</h4>
			</ul>
			<!-- <ul>
				<h4>Playlists</h4>
			</ul> -->
		</lists>
	</select-source>
{/if}

<!---------------------------------------------------->
<style lang="postcss">
	lists {
		@apply grid grid-cols-2 w-full px-4 mt-3 mb-1;
		h4 {
			@apply font-medium select-none text-sm text-neutral-400;
		}
	}

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
		@apply grid grid-cols-2 gap-4 w-full p-4;

		button {
			@apply flex justify-center px-4 py-1 border border-neutral-700 rounded-lg
				duration-150 cursor-pointer gap-2 items-center 
				hover:bg-neutral-700 bg-neutral-700 bg-opacity-25 hover:bg-opacity-85
				hover:border-primary-400 hover:border-opacity-50;
		}
	}

	select-source {
		@apply flex flex-col items-center justify-center bg-neutral-800 rounded-md
			overflow-hidden pb-3 bg-opacity-80 backdrop-blur-md;
	}

	select-source > button {
		@apply flex w-full p-4 py-2 hover:bg-neutral-600 hover:bg-opacity-50 duration-100
			hover:text-primary-400 items-center gap-3;

		.iconify {
			@apply size-5 !opacity-60;
		}
	}
</style>
