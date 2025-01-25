export class Shortcut {
	name = $state('')
	command = $state('') as SyncBro.ShortcutCommand

	shift = $state(false)
	ctrl = $state(false)
	alt = $state(false)
	meta = $state(false)
	key = $state('')

	constructor(
		name: string,
		command: SyncBro.ShortcutCommand,
		keys: {
			shift?: boolean,
			ctrl?: boolean,
			alt?: boolean,
			meta?: boolean,
			key: string
		}
	) {
		this.name = name
		this.command = command

		this.ctrl = keys.ctrl ?? false
		this.shift = keys.shift ?? false
		this.alt = keys.alt ?? false
		this.meta = keys.meta ?? false
		this.key = keys.key

		window.addEventListener('keydown', e => {
			const target = e.target as HTMLElement
			if(target.tagName === 'BUTTON') {
				target.blur()
			}
			if (['INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(target.tagName)) {
				return
			}

			if (e.ctrlKey === this.ctrl && e.shiftKey === this.shift && e.altKey === this.alt && e.metaKey === this.meta && e.key === this.key) {
				Shortcuts.trigger(this.command)
			}
		})
	}
}

const list = $state([]) as Shortcut[]
const subscribers = $state(
	{} as Record<SyncBro.ShortcutCommand, (() => void)[]>
)

export class Shortcuts {
	static add(...shortcut: Shortcut[]) {
		list.push(...shortcut)
	}

	static [Symbol.iterator]() {
		return list[Symbol.iterator]()
	}

	static trigger(shortcut: SyncBro.ShortcutCommand) {
		subscribers[shortcut] ??= []
		for (const subscriber of subscribers[shortcut]) {
			try {
				subscriber()
			} catch (error) {
				console.error('An error occurred when shortcut was triggered:', error)
			}
		}
	}

	static subscribe(
		shortcut: SyncBro.ShortcutCommand,
		callback: () => void
	) {
		subscribers[shortcut] ??= []
		const array = subscribers[shortcut]
		array.push(callback)
		return () => {
			array.splice(array.indexOf(callback), 1)
		}
	}
}

Shortcuts.add(
	new Shortcut(
		'Play/Pause',
		'play_pause',
		{ key: ' ' }
	),
	new Shortcut(
		'Open file',
		'open_file',
		{ key: 'o' }
	),
	new Shortcut(
		'Toggle options',
		'toggle_menu_options',
		{ key: 'F2' }
	)
)

