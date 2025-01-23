
// Add these imports at the top
use std::path::{Path, PathBuf};
use std::process::Command;
use tempfile::tempdir;
use base64::Engine; // For base64 encoding

#[tauri::command]
async fn generate_thumbnails(
    path: PathBuf,
    count: usize,
    width: u32,
    height: u32
) -> Result<Vec<String>, String> {
    let output_dir = tempdir().map_err(|e| e.to_string())?;
    
    // Get video duration
    let duration = get_duration(&path)?;
    
    // Using ffmpeg CLI
    let output = Command::new("ffmpeg")
        .args([
            "-i", path.to_str().unwrap(),
            "-vf", &format!("fps=1/{}", duration / (count as f64)),
            "-s", &format!("{}x{}", width, height),
            "-q:v", "2",
            "-vframes", &count.to_string(),
            &format!("{}/thumb%02d.jpg", output_dir.path().to_str().unwrap())
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let mut thumbnails = Vec::new();
    for entry in std::fs::read_dir(output_dir.path())
        .map_err(|e| e.to_string())? 
    {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let data = std::fs::read(&path).map_err(|e| e.to_string())?;
        thumbnails.push(base64::engine::general_purpose::STANDARD.encode(data));
    }
    
    Ok(thumbnails)
}

fn get_duration(path: &Path) -> Result<f64, String> {
    let output = Command::new("ffprobe")
        .args([
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            path.to_str().unwrap()
        ])
        .output()
        .map_err(|e| e.to_string())?;

    String::from_utf8_lossy(&output.stdout)
        .trim()
       	.parse::<f64>()
		.map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![generate_thumbnails])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}