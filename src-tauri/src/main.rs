// ARGUX — Desktop Entry Point (Windows, Linux, macOS)
// Prevents console window on Windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    argux_lib::run();
}
