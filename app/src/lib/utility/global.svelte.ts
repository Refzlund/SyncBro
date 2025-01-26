import { emit, emitTo, listen } from '@tauri-apps/api/event'
import { getAllWindows, getCurrentWindow, Window } from '@tauri-apps/api/window'


export const globals = $state({
	dev: true
}) as Record<string, unknown>

/**
 * Global values that gets updated across all windows in Tauri
*/
export function global() {
	$effect(() => {
		for (const key in globals) {
			$effect(() => {
				emit('global', { [key]: globals[key] })
			})
		}
	})

	/** Receive update from other window */
	listen<Record<string, unknown>>('global', (event) => {
		for (const [key, val] of Object.entries(event.payload)) {
			globals[key] = val
		}
	})

	/** Share global `values` to other window */
	listen<{ target: string }>('request', (event) => {
		emitTo(event.payload.target, 'global', globals)
	})

	request()
}

async function request() {
	const [current, all] = await Promise.all([getCurrentWindow(), getAllWindows()])
	let webviews = all.filter(win => win.label !== current.label)
	if (webviews.length > 0) {
		emitTo(webviews[0].label, 'request', { target: current.label })
	}
}