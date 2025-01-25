export const generalSettings = $state({
	app: {
		/**
		 * Automatically update when available.
		 * Will only auto-update minor and patch updates.
		*/
		autoUpdate: true,
		/**
		 * Whether the app should check for updates
		*/
		checkForUpdates: true,
		onStart: {
			/**
			 * Whether to open the app with the most recent video
			 * that was watched.
			*/
			openLastVideo: true,
		}
	},
	video: {
		onLoad: {
			/**
			 * Whether to start a video from where it was ended last.
			*/
			cachedTimePosition: true,
			/**
			 * Play video immediately when loaded
			*/
			play: false
		}
	}
})

export const generalCache = $state({
	currentVideo: '',
	recentVideo: 'C:/Users/Arthur/Videos/Chilling.mp4',
	recentTime: 0,

	volume: 1,
	enableVolume: true
})

if (generalSettings.app.onStart.openLastVideo) {
	generalCache.currentVideo = generalCache.recentVideo
}