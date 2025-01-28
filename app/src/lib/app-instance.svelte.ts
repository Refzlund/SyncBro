

/**
 * Multiple instances are allowed with the app.
 * 
 * Each has an "App", a "Tray"-icon and views content independentantly.
*/
class AppInstance {
	colorScheme = 123
}


class ColorSchema {
	
	primary = $state({
		400: 'hsl(333, 85%, 65%)'
	})
	accent = $state({
		300: 'hsl(290, 95%, 35%)'
	})
	neutral = $state({
		900: 'hsl(222, 15%, 5%)',
		800: 'hsl(222, 15%, 15%)',
		700: 'hsl(222, 15%, 17%)',
		600: 'hsl(222, 15%, 20%)',
		550: 'hsl(222, 15%, 25%)',
		500: 'hsl(222, 15%, 40%)',
		400: 'hsl(222, 15%, 60%)',
		300: 'hsl(222, 15%, 75%)',
		200: 'hsl(222, 25%, 85%)',
		100: 'hsl(222, 25%, 95%)',
	})
	alert = $state({
		500: 'hsl(10, 80%, 50%)'
	})
}


