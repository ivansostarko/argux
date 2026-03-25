// ARGUX — Tactical Intelligence & Surveillance Platform
// Tauri v2 Application Core
// Shared library for Desktop (Windows, Linux, macOS) and Mobile (iOS, Android)

use tauri::Manager;

/// Platform information passed to the frontend
#[derive(Clone, serde::Serialize)]
struct PlatformInfo {
    os: String,
    arch: String,
    platform: String,
    is_desktop: bool,
    is_mobile: bool,
    app_version: String,
}

/// Get platform information
#[tauri::command]
fn get_platform_info() -> PlatformInfo {
    PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        platform: if cfg!(target_os = "android") || cfg!(target_os = "ios") {
            "mobile".to_string()
        } else {
            "desktop".to_string()
        },
        is_desktop: cfg!(not(any(target_os = "android", target_os = "ios"))),
        is_mobile: cfg!(any(target_os = "android", target_os = "ios")),
        app_version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

/// Set window title dynamically
#[tauri::command]
fn set_window_title(window: tauri::Window, title: String) {
    let _ = window.set_title(&format!("{} — ARGUX", title));
}

/// Toggle fullscreen mode
#[tauri::command]
fn toggle_fullscreen(window: tauri::Window) {
    if let Ok(is_fullscreen) = window.is_fullscreen() {
        let _ = window.set_fullscreen(!is_fullscreen);
    }
}

/// Minimize to system tray (desktop only)
#[tauri::command]
fn minimize_to_tray(window: tauri::Window) {
    let _ = window.minimize();
}

/// Application setup and plugin registration
pub fn run() {
    let mut builder = tauri::Builder::default();

    // === Core Plugins (all platforms) ===
    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init());

    // === Desktop-only Plugins ===
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                // Focus existing window when user tries to open second instance
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                    let _ = window.unminimize();
                }
            }))
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_global_shortcut::Builder::new().build());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            get_platform_info,
            set_window_title,
            toggle_fullscreen,
            minimize_to_tray,
        ])
        .setup(|app| {
            // Log startup info
            let version = env!("CARGO_PKG_VERSION");
            let os = std::env::consts::OS;
            let arch = std::env::consts::ARCH;
            println!("╔══════════════════════════════════════════════╗");
            println!("║  ARGUX Tactical Intelligence Platform       ║");
            println!("║  Version: {:<35}║", version);
            println!("║  Platform: {:<34}║", format!("{} ({})", os, arch));
            println!("║  CLASSIFIED // NOFORN                       ║");
            println!("╚══════════════════════════════════════════════╝");

            // Set window properties on desktop
            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                if let Some(window) = app.get_webview_window("main") {
                    // Themed title bar on macOS
                    #[cfg(target_os = "macos")]
                    {
                        use tauri::TitleBarStyle;
                        let _ = window.set_title_bar_style(TitleBarStyle::Overlay);
                    }

                    // Set minimum window size
                    let _ = window.set_min_size(Some(tauri::LogicalSize::new(1024.0, 700.0)));
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running ARGUX application");
}
