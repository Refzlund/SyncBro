<script module lang='ts'>
	import { TrayIcon } from '@tauri-apps/api/tray'
	import { onDestroy, onMount, tick } from 'svelte'
	import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
	import { defaultWindowIcon } from '@tauri-apps/api/app'
	import { globals } from '$lib/utility/global.svelte'

	let appWindow: WebviewWindow
	let tray: TrayIcon | undefined
	let trayWindow: WebviewWindow | undefined

	globals.openTray = false

	// $inspect(globals)

	const width = 300, height = 300

</script>

<script lang='ts'>
	
	let opening = false
	let destroyed = false

	let closeTimer: ReturnType<typeof setTimeout> | undefined

	let stayOpenRateLimit: ReturnType<typeof setTimeout> | undefined

	function closeTrayMenu(cb?: () => void) {
		globals.openTray = false
		stayOpenRateLimit = setTimeout(() => { stayOpenRateLimit = undefined }, 200)
		clearTimeout(closeTimer)
		closeTimer = setTimeout(() => {
			closeTimer = undefined
			trayWindow?.close()
			trayWindow = undefined
			cb?.()
		}, 300)
	}

	onMount(async () => {
		destroyed = false
		appWindow = (await WebviewWindow.getByLabel('app'))!

		tray = await TrayIcon.new({
			tooltip: `           SyncBro
Left	Open
Middle	Play/Pause
Right	Menu`,
			icon: (await defaultWindowIcon())!,
			async action(event) {
				console.log(event)
				if(event.type === 'Click') {
					if(event.buttonState === 'Up') return
					if(event.button === 'Middle') {
						// Toggle media playing
					}
					if(event.button === 'Left') {
						if(!await appWindow.isVisible()) {
							appWindow.show()
						}
						appWindow.setFocus()
						return
					}

					// * Open tray menu

					if(stayOpenRateLimit !== undefined) return

					if(closeTimer !== undefined) {
						clearTimeout(closeTimer)
						closeTimer = undefined
						globals.openTray = true
					}

					if(opening) return
					

					if(trayWindow) {
						if(globals.dev) {
							closeTrayMenu()
						} else {
							trayWindow.show()
							trayWindow.setFocus()
						}
						return
					}

					opening = true
					
					const window = new WebviewWindow('tray-menu', {
						title: "SyncBro Menu",
						url: "/tray-menu",
						maxWidth: width,
						maxHeight: height,
						x: 18 + event.rect.position.x - width / 2,
						y: event.rect.position.y - height,
						decorations: false,
						resizable: false,
						transparent: true,
						shadow: false,
						zoomHotkeysEnabled: false,
						focus: true,
						skipTaskbar: true,
						alwaysOnTop: true,
						visibleOnAllWorkspaces: true,
						hiddenTitle: true,
						backgroundColor: "#00000000",
						windowEffects: {
							effects: [
								// Effect.Acrylic,
								
							]
						}
					})

					const clearCreated = window.once('tauri://created', function () {
						tick().then(() => globals.openTray = true)

						trayWindow = window
						opening = false
						window?.show()
						window?.setFocus()
						clearError.then(v => v())
						
						const clearFocus = window?.onFocusChanged(({ event }) => {
							if(event !== 'tauri://blur') return
							if(globals.dev) return
							closeTrayMenu(() => {
								clearFocus.then(v => v())
								clearClose.then(v => v())
							})
						})

						const clearClose = window.onCloseRequested(() => {
							clearFocus.then(v => v())
							clearClose.then(v => v())
							trayWindow = undefined
						})
					})
					const clearError = window.once('tauri://error', function (e) {
						opening = false
						window?.close()
						clearCreated.then(v => v())
						console.error('Failed opening tray menu:', e)
					})
				}
			}
		})

		if(destroyed) {
			tray?.close()
			tray = undefined
			trayWindow?.close()
			trayWindow = undefined
		}
	})

	onDestroy(() => {
		destroyed = true
		tray?.close()
		tray = undefined
		trayWindow?.close()
		trayWindow = undefined
	})
	
</script>