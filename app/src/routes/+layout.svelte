<script lang='ts'>
	import type { Snippet } from 'svelte'
	import '../app.pcss'
	import { global } from '$lib/utility/global.svelte'

	interface Props {
		children: Snippet
	}

	global()

	let {
		children
	}: Props = $props()
</script>

{@render children()}
