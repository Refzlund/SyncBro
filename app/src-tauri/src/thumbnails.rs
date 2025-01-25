use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::path::BaseDirectory;
use tauri::Manager;
// use tempfile::tempdir; // TODO: Allow options for thumbnails to be generated anew

#[tauri::command]
pub async fn get_thumbnails(
    handle: tauri::AppHandle,
    video_path: PathBuf,
    count: usize,
    width: u32,
    height: u32,
) -> Result<Vec<String>, String> {
    let file_name = video_path.file_name().unwrap().to_str().unwrap();
    let file_created = std::fs::metadata(&video_path)
        .unwrap()
        .created()
        .unwrap()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis();
    let cache_name = &format!("{}-{}", file_name, file_created);

    let output_dir = handle
        .path()
        .resolve(
            &format!(".syncbro/.cache/thumbnails/{}", cache_name),
            BaseDirectory::Home,
        )
        .unwrap();

    // Ensure .syncbro/.cache/thumbnails exists
    std::fs::create_dir_all(&output_dir).unwrap();

    if std::fs::read_dir(&output_dir).unwrap().count() == 0 {
        generate_thumbnails(&output_dir, &video_path, count, width, height).await?;
    };

    let mut thumbnails = Vec::new();
    for entry in std::fs::read_dir(&output_dir).unwrap() {
        let entry = entry.unwrap();
        thumbnails.push(entry.path().to_string_lossy().to_string());
    }

    return Ok(thumbnails);
}

async fn generate_thumbnails(
    output_dir: &PathBuf,
    video_path: &PathBuf,
    count: usize,
    width: u32,
    height: u32,
) -> Result<(), String> {
    // Get video duration
    let duration = get_duration(&video_path)?;

    let resize = &format!("{}x{}", width, height);
    let vf_fps = &format!("fps=1/{}", duration / (count as f64));
    let cuda_scale = &format!("scale_cuda={}:{}", width, height);
    let frame_count = &count.to_string();

    let input_args = vec![
        "-hwaccel",
        "cuvid",
        "-hwaccel_output_format",
        "cuda",
        "-c:v",
        "hevc_cuvid",
        "-resize",
        &resize,
    ];

    let vfilter = vec![
        &vf_fps,
        "thumbnail_cuda=2",
        &cuda_scale,
        "hwdownload",
        "format=nv12",
    ]
    .join(",");

    let output_args = vec![
        "-vframes",
        &frame_count,
        "-q:v",
        "2",
        "-vf",
        &vfilter,
        "-f",
        "image2",
    ];

    let output = Command::new("ffmpeg")
        .args(input_args)
        .args(["-i", video_path.to_str().unwrap()]) // Input file
        .args(output_args)
        .arg(&format!("{}/thumb_%02d.jpg", output_dir.to_str().unwrap())) // Output files
        // .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

fn get_duration(video_path: &Path) -> Result<f64, String> {
    let output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            video_path.to_str().unwrap(),
        ])
        .output()
        .map_err(|e| e.to_string())?;

    String::from_utf8_lossy(&output.stdout)
        .trim()
        .parse::<f64>()
        .map_err(|e| e.to_string())
}
