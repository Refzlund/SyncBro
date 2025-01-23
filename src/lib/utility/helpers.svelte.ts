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
