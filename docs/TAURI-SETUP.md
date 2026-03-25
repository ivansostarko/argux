# ARGUX — Tauri Multi-Platform Build Guide

Build ARGUX as a native desktop and mobile application using Tauri v2.

## Supported Platforms

| Platform | Target | Output |
|---|---|---|
| **Windows** | `x86_64-pc-windows-msvc` | `.msi` + `.exe` (NSIS installer) |
| **Linux** | `x86_64-unknown-linux-gnu` | `.deb` + `.rpm` + `.AppImage` |
| **macOS (Intel)** | `x86_64-apple-darwin` | `.dmg` + `.app` bundle |
| **macOS (Apple Silicon)** | `aarch64-apple-darwin` | `.dmg` + `.app` bundle |
| **macOS (Universal)** | `universal-apple-darwin` | `.dmg` (Intel + Apple Silicon) |
| **Android** | ARM64 / ARMv7 / x86_64 | `.apk` + `.aab` |
| **iOS** | ARM64 | `.ipa` |

---

## Prerequisites (All Platforms)

```bash
# 1. Node.js 18+ and npm
node --version  # v18+

# 2. Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version  # 1.77+

# 3. Install Tauri CLI
npm install

# 4. Verify installation
npx tauri info
```

---

## Desktop Builds

### Windows

**Requirements:**
- Windows 10/11
- Visual Studio 2022 Build Tools with "Desktop development with C++"
- WebView2 (pre-installed on Windows 10 1803+)

```powershell
# Install Rust Windows target (if cross-compiling)
rustup target add x86_64-pc-windows-msvc

# Build
npm run tauri:build:windows

# Output: src-tauri/target/release/bundle/
#   ├── msi/ARGUX_0.24.2_x64_en-US.msi
#   └── nsis/ARGUX_0.24.2_x64-setup.exe
```

### Linux

**Requirements (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libgtk-3-dev
```

**Requirements (Fedora):**
```bash
sudo dnf install -y \
  webkit2gtk4.1-devel \
  openssl-devel \
  gtk3-devel \
  libappindicator-gtk3-devel \
  librsvg2-devel
```

```bash
# Build
npm run tauri:build:linux

# Output: src-tauri/target/release/bundle/
#   ├── deb/argux_0.24.2_amd64.deb
#   ├── rpm/argux-0.24.2-1.x86_64.rpm
#   └── appimage/argux_0.24.2_amd64.AppImage
```

### macOS

**Requirements:**
- macOS 10.15+ (Catalina)
- Xcode Command Line Tools: `xcode-select --install`
- Xcode (for signing/notarization)

```bash
# Apple Silicon (M1/M2/M3)
npm run tauri:build:macos-arm

# Intel Mac
npm run tauri:build:macos-intel

# Universal Binary (both architectures)
rustup target add x86_64-apple-darwin aarch64-apple-darwin
npm run tauri:build:macos

# Output: src-tauri/target/release/bundle/
#   ├── dmg/ARGUX_0.24.2_universal.dmg
#   └── macos/ARGUX.app
```

---

## Mobile Builds

### Android

**Requirements:**
- Android Studio (latest)
- Android SDK (API 24+, target API 34)
- Android NDK (r25+)
- JDK 17

```bash
# Set environment variables
export JAVA_HOME=/path/to/jdk17
export ANDROID_HOME=$HOME/Android/Sdk
export NDK_HOME=$ANDROID_HOME/ndk/25.2.9519653

# Add Rust Android targets
rustup target add \
  aarch64-linux-android \
  armv7-linux-androideabi \
  x86_64-linux-android \
  i686-linux-android

# Initialize Android project (first time only)
npm run tauri:android:init

# Development (with emulator or connected device)
npm run tauri:android:dev

# Production build
npm run tauri:android:build

# Output: src-tauri/gen/android/app/build/outputs/
#   ├── apk/universal/release/app-universal-release.apk
#   └── bundle/universalRelease/app-universal-release.aab
```

### iOS

**Requirements:**
- macOS only
- Xcode 15+ with iOS SDK
- Apple Developer account (for device testing/distribution)
- CocoaPods: `sudo gem install cocoapods`

```bash
# Add Rust iOS targets
rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios

# Initialize iOS project (first time only)
npm run tauri:ios:init

# Development (simulator)
npm run tauri:ios:dev

# Production build
npm run tauri:ios:build

# Output: src-tauri/gen/apple/build/
#   └── Build/Products/Release-iphoneos/ARGUX.app
```

---

## Development Mode

### Desktop Development
```bash
# Runs Laravel dev server + Vite + Tauri window
npm run tauri:dev
```

### Mobile Development
```bash
# Android (requires emulator or device)
npm run tauri:android:dev

# iOS (requires simulator — macOS only)
npm run tauri:ios:dev
```

### Web-only Development (no Tauri)
```bash
# Standard Laravel + Vite development (browser)
npm run dev
# Visit http://localhost:8000
```

---

## App Icons

Generate platform-specific icons from a source PNG (1024x1024 recommended):

```bash
# Generate all icon sizes from a source image
npx tauri icon path/to/app-icon-1024x1024.png

# Icons will be generated in src-tauri/icons/
#   32x32.png, 128x128.png, 128x128@2x.png
#   icon.icns (macOS), icon.ico (Windows)
#   icon.png (Linux), Square* (Windows Store)
#   AppIcon.appiconset/ (iOS)
#   mipmap-*/ (Android — after android init)
```

---

## Architecture

```
argux/
├── src-tauri/                  # Tauri native layer
│   ├── tauri.conf.json         # App config, window, CSP, bundle targets
│   ├── Cargo.toml              # Rust dependencies
│   ├── capabilities/           # Permission declarations
│   │   ├── default.json        # All-platform permissions
│   │   └── desktop.json        # Desktop-only permissions
│   ├── src/
│   │   ├── main.rs             # Desktop entry point
│   │   └── lib.rs              # Shared app logic + Tauri commands
│   ├── icons/                  # Platform icons
│   └── gen/                    # Generated mobile projects (gitignored)
│       ├── android/            # Generated by `tauri android init`
│       └── apple/              # Generated by `tauri ios init`
│
├── resources/js/
│   ├── lib/tauri.ts            # Frontend Tauri bridge (platform detection, commands)
│   └── types/tauri.d.ts        # TypeScript declarations for Tauri env
│
├── vite.config.ts              # Tauri-aware Vite configuration
├── package.json                # Tauri CLI + plugin dependencies
└── TAURI-SETUP.md              # This file
```

### Frontend Bridge (`resources/js/lib/tauri.ts`)

```typescript
import { isTauri, platform, sendNotification, copyToClipboard } from '@/lib/tauri';

// Platform detection
if (platform.isDesktop) { /* desktop-specific UI */ }
if (platform.isMobile)  { /* mobile-specific UI */ }
if (platform.isBrowser) { /* web fallback */ }

// Native notifications (falls back to Web Notification API in browser)
await sendNotification('Alert', 'Zone breach detected');

// Clipboard (falls back to navigator.clipboard in browser)
await copyToClipboard('Coordinates: 45.8150, 15.9819');

// External links (opens system browser in Tauri, new tab in browser)
await openExternal('https://docs.argux.cloud');
```

All functions gracefully fall back to browser APIs when not running in Tauri.

---

## Tauri Commands (Rust → Frontend)

| Command | Description | Platform |
|---|---|---|
| `get_platform_info` | Returns OS, arch, version, desktop/mobile flag | All |
| `set_window_title` | Dynamically update window title bar | Desktop |
| `toggle_fullscreen` | Toggle fullscreen mode | Desktop |
| `minimize_to_tray` | Minimize window | Desktop |

---

## Plugins Included

| Plugin | All | Desktop | Description |
|---|---|---|---|
| `shell` | ✅ | | Open URLs in system browser |
| `notification` | ✅ | | Native OS notifications |
| `clipboard-manager` | ✅ | | Read/write system clipboard |
| `dialog` | ✅ | | Native file open/save/confirm dialogs |
| `process` | ✅ | | Exit/restart application |
| `os` | ✅ | | OS info (version, arch, locale) |
| `http` | ✅ | | HTTP client (bypasses CORS) |
| `opener` | ✅ | | Open files with default app |
| `single-instance` | | ✅ | Prevent multiple app instances |
| `window-state` | | ✅ | Remember window size/position |
| `updater` | | ✅ | Auto-update from server |
| `global-shortcut` | | ✅ | System-wide keyboard shortcuts |

---

## CI/CD Quick Reference

### GitHub Actions example targets:
```yaml
# Windows
- { os: windows-latest, target: x86_64-pc-windows-msvc }
# Linux
- { os: ubuntu-22.04, target: x86_64-unknown-linux-gnu }
# macOS Intel
- { os: macos-13, target: x86_64-apple-darwin }
# macOS ARM
- { os: macos-14, target: aarch64-apple-darwin }
# Android
- { os: ubuntu-22.04, mobile: android }
# iOS
- { os: macos-14, mobile: ios }
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `error: failed to load manifest` | Run from project root, not `src-tauri/` |
| WebView2 missing (Windows) | Install from https://developer.microsoft.com/en-us/microsoft-edge/webview2/ |
| `webkit2gtk not found` (Linux) | Install `libwebkit2gtk-4.1-dev` |
| Android NDK not found | Set `$NDK_HOME` environment variable |
| iOS simulator not found | Open Xcode → Settings → Platforms → install iOS simulator |
| `CORS error` in Tauri | Use `tauriFetch()` from `@/lib/tauri` instead of `fetch()` |
