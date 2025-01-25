export const noPropagation = (e: PointerEvent) => e.stopPropagation()

export function addListener<K extends keyof HTMLElementEventMap>(
	node: HTMLElement | Document,
	event: K,
	cb: (event: HTMLElementEventMap[K]) => void,
	options?: AddEventListenerOptions
) {
	node.addEventListener(event, cb as any, options)
	return () => node.removeEventListener(event, cb as any, options)
}

/**
 * By combining `@starting-style` and `.exiting` we can style transitions.
 * 
 * <div class:exiting={value.exiting}>
*/
export function exit(timeMs: number, show = true) {
	let showState = $state(show)
	let target = show
	let timer: ReturnType<typeof setTimeout> | undefined

	const value = $state({
		get show() {
			return showState
		},
		set show(value) {
			target = value
			clearTimeout(timer)
			if(value) {
				showState = value
				this.exiting = false
			}
			else {
				this.exiting = true
			}
			timer = setTimeout(() => {
				showState = value
			}, timeMs)
		},
		toggle() {
			return this.show = !target
		},
		exiting: false
	})

	return value
}

export function formatTime(timeMs: number) {
	let hours = Math.floor(timeMs / 3600)
	let minutes = Math.floor((timeMs % 3600) / 60)
	let seconds = Math.floor(timeMs % 60)

	if (hours > 0) {
		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	} else {
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
	}
}