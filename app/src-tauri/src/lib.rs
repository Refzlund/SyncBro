mod thumbnails;

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
	app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
		.setup(|app| {
			// app.on_menu_event(|h, ev| {
			// 	h.exit(0);
			// });

			Ok(())
		})
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
			exit_app,
			thumbnails::get_thumbnails
		])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
