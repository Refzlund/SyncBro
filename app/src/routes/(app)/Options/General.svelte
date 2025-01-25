<script lang='ts'>

	import { generalSettings } from '$lib/general-settings.svelte'

	interface Props {
	
	}
	
	let {
		
	}: Props = $props()

</script>
<!---------------------------------------------------->

<div class='flex flex-col gap-4'>
	<small class='text-neutral-400'>
		Work in progress
	</small>

	<label class='select-none cursor-pointer'>
		Open with last video
		<input type='checkbox' bind:checked={generalSettings.app.onStart.openLastVideo}>
	</label>
</div>




<!---------------------------------------------------->
<style lang='postcss'>
	
	

</style>