declare global {
	namespace SyncBro {
		interface ShortcutCommandMap {}
		type ShortcutCommand = keyof ShortcutCommandMap
	}
}

export {}