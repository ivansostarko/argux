// ARGUX — Tactical Intelligence & Surveillance Platform
// Tauri v2 Application Core — 21 Plugins
// Desktop (Windows, Linux, macOS) + Mobile (iOS, Android)

use tauri::Manager;

#[derive(Clone, serde::Serialize)]
struct PlatformInfo {
    os: String,
    arch: String,
    platform: String,
    is_desktop: bool,
    is_mobile: bool,
    app_version: String,
}

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

#[tauri::command]
fn set_window_title(window: tauri::Window, title: String) {
    let _ = window.set_title(&format!("{} — ARGUX", title));
}

#[tauri::command]
fn toggle_fullscreen(window: tauri::Window) {
    if let Ok(is_fullscreen) = window.is_fullscreen() {
        let _ = window.set_fullscreen(!is_fullscreen);
    }
}

#[tauri::command]
fn minimize_to_tray(window: tauri::Window) {
    let _ = window.minimize();
}

pub fn run() {
    let mut builder = tauri::Builder::default();

    // ═══ Core Plugins (all platforms) ═══
    builder = builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_websocket::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_biometric::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir { file_name: Some("argux".into()) },
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .level(log::LevelFilter::Info)
                .build(),
        );

    // ═══ Desktop-only Plugins ═══
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        use tauri_plugin_autostart::MacosLauncher;

        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_focus();
                    let _ = window.unminimize();
                }
            }))
            .plugin(tauri_plugin_window_state::Builder::new().build())
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_global_shortcut::Builder::new().build())
            .plugin(tauri_plugin_positioner::init())
            .plugin(tauri_plugin_deep_link::init())
            .plugin(tauri_plugin_cli::init())
            .plugin(tauri_plugin_autostart::init(
                MacosLauncher::LaunchAgent,
                Some(vec!["--minimized"]),
            ));
    }

    builder
        .invoke_handler(tauri::generate_handler![
            get_platform_info,
            set_window_title,
            toggle_fullscreen,
            minimize_to_tray,
        ])
        .setup(|app| {
            let version = env!("CARGO_PKG_VERSION");
            let os = std::env::consts::OS;
            let arch = std::env::consts::ARCH;
            log::info!("╔══════════════════════════════════════════════╗");
            log::info!("║  ARGUX Tactical Intelligence Platform       ║");
            log::info!("║  Version: {:<35}║", version);
            log::info!("║  Platform: {:<34}║", format!("{} ({})", os, arch));
            log::info!("║  Plugins: 21 loaded                         ║");
            log::info!("║  CLASSIFIED // NOFORN                       ║");
            log::info!("╚══════════════════════════════════════════════╝");

            #[cfg(not(any(target_os = "android", target_os = "ios")))]
            {
                if let Some(window) = app.get_webview_window("main") {
                    #[cfg(target_os = "macos")]
                    {
                        use tauri::TitleBarStyle;
                        let _ = window.set_title_bar_style(TitleBarStyle::Overlay);
                    }
                    let _ = window.set_min_size(Some(tauri::LogicalSize::new(1024.0, 700.0)));
                }

                // Register deep link scheme
                #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
                {
                    use tauri_plugin_deep_link::DeepLinkExt;
                    let _ = app.deep_link().register("argux");
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error while running ARGUX application");
}
