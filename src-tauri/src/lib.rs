#[cfg(desktop)]
use std::sync::Mutex;
#[cfg(desktop)]
use std::time::{Duration, Instant};
#[cfg(desktop)]
use serde::Serialize;
#[cfg(desktop)]
use tauri::{AppHandle, Emitter, Manager, Runtime, WebviewWindowBuilder};
#[cfg(desktop)]
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
  WindowEvent,
};
#[cfg(desktop)]
use tauri_plugin_updater::UpdaterExt;
#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::Shell::SetCurrentProcessExplicitAppUserModelID;

#[cfg(desktop)]
const MAIN_WINDOW_LABEL: &str = "main";
#[cfg(desktop)]
const TRAY_ID: &str = "main-tray";
#[cfg(desktop)]
const TRAY_SHOW_ID: &str = "tray-show";
#[cfg(desktop)]
const TRAY_TOGGLE_PLAYBACK_ID: &str = "tray-toggle-playback";
#[cfg(desktop)]
const TRAY_HIDE_ID: &str = "tray-hide";
#[cfg(desktop)]
const TRAY_QUIT_ID: &str = "tray-quit";
#[cfg(desktop)]
const TOGGLE_PLAYBACK_EVENT: &str = "desktop-toggle-playback";
#[cfg(desktop)]
const UPDATE_PROGRESS_EVENT: &str = "desktop-update-event";
#[cfg(desktop)]
const RELOAD_AFTER_HIDDEN_FOR: Duration = Duration::from_secs(60 * 10);
#[cfg(desktop)]
const RENDERER_STALE_AFTER: Duration = Duration::from_secs(90);
#[cfg(target_os = "windows")]
const WINDOWS_APP_USER_MODEL_ID: &str = "com.danceoneradio.desktop";

#[cfg(target_os = "macos")]
const UPDATE_SURFACE_NAME: &str = "menu bar";
#[cfg(not(target_os = "macos"))]
const UPDATE_SURFACE_NAME: &str = "tray";

#[cfg(target_os = "macos")]
const UPDATE_PLATFORM_NAME: &str = "macOS";
#[cfg(target_os = "windows")]
const UPDATE_PLATFORM_NAME: &str = "Windows";
#[cfg(not(any(target_os = "macos", target_os = "windows")))]
const UPDATE_PLATFORM_NAME: &str = "The app";

#[cfg(desktop)]
#[derive(Clone, Serialize)]
struct DesktopUpdateInfo {
  version: String,
  notes: Option<String>,
  date: Option<String>,
}

#[cfg(desktop)]
#[derive(Clone, Serialize)]
#[serde(tag = "event", content = "data")]
enum DesktopUpdateEvent {
  Started {
    #[serde(rename = "contentLength")]
    content_length: Option<u64>,
  },
  Progress {
    #[serde(rename = "chunkLength")]
    chunk_length: u64,
    #[serde(rename = "contentLength")]
    content_length: Option<u64>,
  },
  Finished,
}

#[cfg(desktop)]
#[derive(Default)]
struct WindowHideState {
  hidden_at: Mutex<Option<Instant>>,
}

#[cfg(desktop)]
#[derive(Default)]
struct PlaybackState {
  is_playing: Mutex<bool>,
}

#[cfg(desktop)]
#[derive(Default)]
struct RendererState {
  last_seen: Mutex<Option<Instant>>,
  pending_toggle_playback: Mutex<bool>,
}

#[cfg(target_os = "windows")]
fn set_windows_app_user_model_id() {
  let app_id: Vec<u16> = WINDOWS_APP_USER_MODEL_ID
    .encode_utf16()
    .chain(std::iter::once(0))
    .collect();

  unsafe {
    let _ = SetCurrentProcessExplicitAppUserModelID(app_id.as_ptr());
  }
}

#[cfg(desktop)]
fn take_hidden_duration<R: Runtime>(app: &AppHandle<R>) -> Option<Duration> {
  let state = app.try_state::<WindowHideState>()?;
  let mut hidden_at = state.hidden_at.lock().ok()?;
  let duration = hidden_at.map(|instant| instant.elapsed());
  *hidden_at = None;
  duration
}

#[cfg(desktop)]
fn peek_hidden_duration<R: Runtime>(app: &AppHandle<R>) -> Option<Duration> {
  let state = app.try_state::<WindowHideState>()?;
  let hidden_at = state.hidden_at.lock().ok()?;
  hidden_at.map(|instant| instant.elapsed())
}

#[cfg(desktop)]
fn mark_window_hidden<R: Runtime>(app: &AppHandle<R>) {
  if let Some(state) = app.try_state::<WindowHideState>() {
    if let Ok(mut hidden_at) = state.hidden_at.lock() {
      *hidden_at = Some(Instant::now());
    }
  }
}

#[cfg(desktop)]
fn is_renderer_stale<R: Runtime>(app: &AppHandle<R>) -> bool {
  app
    .try_state::<RendererState>()
    .and_then(|state| state.last_seen.lock().ok().and_then(|last_seen| *last_seen))
    .map(|last_seen| last_seen.elapsed() >= RENDERER_STALE_AFTER)
    .unwrap_or(true)
}

#[cfg(desktop)]
fn create_main_window<R: Runtime>(app: &AppHandle<R>, should_show: bool) -> tauri::Result<()> {
  let Some(config) = app
    .config()
    .app
    .windows
    .iter()
    .find(|window| window.label == MAIN_WINDOW_LABEL)
    .or_else(|| app.config().app.windows.first())
  else {
    return Ok(());
  };

  let mut builder = WebviewWindowBuilder::from_config(app, config)?;
  if !should_show {
    builder = builder.visible(false);
  }

  let window = builder.build()?;

  if let Some(icon) = app.default_window_icon().cloned() {
    let _ = window.set_icon(icon);
  }

  if should_show {
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
  } else {
    mark_window_hidden(app);
    let _ = window.hide();
  }

  Ok(())
}

#[cfg(desktop)]
fn recover_main_window<R: Runtime>(app: &AppHandle<R>, should_show: bool) -> tauri::Result<()> {
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    if let Some(icon) = app.default_window_icon().cloned() {
      let _ = window.set_icon(icon);
    }

    let _ = window.unminimize();
    let _ = window.reload();

    if should_show {
      let _ = window.show();
      let _ = window.set_focus();
    } else {
      mark_window_hidden(app);
      let _ = window.hide();
    }

    return Ok(());
  }

  create_main_window(app, should_show)
}

#[cfg(desktop)]
fn queue_toggle_playback_for_renderer<R: Runtime>(app: &AppHandle<R>) {
  if let Some(state) = app.try_state::<RendererState>() {
    if let Ok(mut pending_toggle) = state.pending_toggle_playback.lock() {
      *pending_toggle = true;
    }
  }
}

#[cfg(desktop)]
fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
  let is_playing = app
    .try_state::<PlaybackState>()
    .and_then(|state| state.is_playing.lock().ok().map(|guard| *guard))
    .unwrap_or(false);
  let hidden_duration = take_hidden_duration(app);
  let renderer_stale = is_renderer_stale(app);
  let should_recreate = hidden_duration
    .map(|duration| duration >= RELOAD_AFTER_HIDDEN_FOR && !is_playing && renderer_stale)
    .unwrap_or(false);

  if should_recreate {
    if recover_main_window(app, true).is_ok() {
      return;
    }
  }

  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let should_reload = hidden_duration
      .map(|duration| duration >= RELOAD_AFTER_HIDDEN_FOR && !is_playing)
      .unwrap_or(false);

    if should_reload {
      let _ = window.reload();
    }

    if let Some(icon) = app.default_window_icon().cloned() {
      let _ = window.set_icon(icon);
    }
    let _ = window.unminimize();
    let _ = window.show();
    let _ = window.set_focus();
  }
}

#[cfg(desktop)]
fn apply_main_window_icon<R: Runtime>(app: &AppHandle<R>) {
  if let (Some(window), Some(icon)) = (
    app.get_webview_window(MAIN_WINDOW_LABEL),
    app.default_window_icon().cloned(),
  ) {
    let _ = window.set_icon(icon);
  }
}

#[cfg(desktop)]
fn hide_main_window<R: Runtime>(app: &AppHandle<R>) {
  mark_window_hidden(app);
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let _ = window.hide();
  }
}

#[cfg(desktop)]
fn format_update_error_message(raw: impl Into<String>) -> String {
  let message = raw.into();
  let normalized = message.to_lowercase();

  if normalized.contains("shell execute") || normalized.contains("could not run") {
    return format!(
      "{UPDATE_PLATFORM_NAME} could not launch the installer. Close Dance One Radio from the {UPDATE_SURFACE_NAME} and try again."
    );
  }

  if normalized.contains("signature") || normalized.contains("verification") {
    return "The downloaded update could not be verified. Please try again after the release files finish syncing.".into();
  }

  if normalized.contains("404") || normalized.contains("not found") || normalized.contains("network") {
    return "The update package is not reachable right now. Please try again in a few minutes.".into();
  }

  if normalized.contains("no update") || normalized.contains("already up to date") {
    return "You are already on the latest version.".into();
  }

  if normalized.contains("installer") || normalized.contains("msi") || normalized.contains("nsis") {
    return format!(
      "{UPDATE_PLATFORM_NAME} could not finish the installer handoff. Close Dance One Radio from the {UPDATE_SURFACE_NAME} and try again."
    );
  }

  message
}

#[tauri::command]
fn hide_to_tray(app: tauri::AppHandle) {
  hide_main_window(&app);
}

#[tauri::command]
fn restore_from_tray(app: tauri::AppHandle) {
  show_main_window(&app);
}

#[tauri::command]
fn update_playback_state(app: tauri::AppHandle, is_playing: bool) {
  if let Some(state) = app.try_state::<PlaybackState>() {
    if let Ok(mut playback_state) = state.is_playing.lock() {
      *playback_state = is_playing;
    }
  }
}

#[tauri::command]
fn renderer_ping(app: tauri::AppHandle) {
  if let Some(state) = app.try_state::<RendererState>() {
    if let Ok(mut last_seen) = state.last_seen.lock() {
      *last_seen = Some(Instant::now());
    }

    let should_emit_toggle = state
      .pending_toggle_playback
      .lock()
      .ok()
      .map(|mut pending_toggle| {
        let should_emit = *pending_toggle;
        *pending_toggle = false;
        should_emit
      })
      .unwrap_or(false);

    if should_emit_toggle {
      let _ = app.emit(TOGGLE_PLAYBACK_EVENT, ());
    }
  }
}

#[cfg(desktop)]
#[tauri::command]
async fn check_for_updates(app: tauri::AppHandle) -> Result<Option<DesktopUpdateInfo>, String> {
  let updater = app
    .updater_builder()
    .build()
    .map_err(|error| format_update_error_message(error.to_string()))?;

  let update = updater
    .check()
    .await
    .map_err(|error| format_update_error_message(error.to_string()))?;

  Ok(update.map(|update| DesktopUpdateInfo {
    version: update.version,
    notes: update.body,
    date: update.date.map(|date| date.to_string()),
  }))
}

#[cfg(desktop)]
#[tauri::command]
async fn install_update(app: tauri::AppHandle) -> Result<(), String> {
  let updater = app
    .updater_builder()
    .build()
    .map_err(|error| format_update_error_message(error.to_string()))?;

  let update = updater
    .check()
    .await
    .map_err(|error| format_update_error_message(error.to_string()))?
    .ok_or_else(|| "No update is currently available.".to_string())?;

  let progress_app = app.clone();
  let finished_app = app.clone();
  let _ = progress_app.emit(
    UPDATE_PROGRESS_EVENT,
    DesktopUpdateEvent::Started {
      content_length: None,
    },
  );

  update
    .download_and_install(
      move |chunk_length, content_length| {
        let _ = progress_app.emit(
          UPDATE_PROGRESS_EVENT,
          DesktopUpdateEvent::Progress {
            chunk_length: chunk_length as u64,
            content_length,
          },
        );
      },
      move || {
        let _ = finished_app.emit(UPDATE_PROGRESS_EVENT, DesktopUpdateEvent::Finished);
      },
    )
    .await
    .map_err(|error| format_update_error_message(error.to_string()))
}

#[cfg(desktop)]
fn build_tray<R: Runtime>(app: &AppHandle<R>) -> tauri::Result<()> {
  let show_item = MenuItem::with_id(app, TRAY_SHOW_ID, "Open Dance One Radio", true, None::<&str>)?;
  let toggle_playback_item = MenuItem::with_id(app, TRAY_TOGGLE_PLAYBACK_ID, "Play / Pause Stream", true, None::<&str>)?;
  let hide_item = MenuItem::with_id(app, TRAY_HIDE_ID, "Hide Window", true, None::<&str>)?;
  let quit_item = MenuItem::with_id(app, TRAY_QUIT_ID, "Quit", true, None::<&str>)?;
  let menu = Menu::with_items(app, &[&show_item, &toggle_playback_item, &hide_item, &quit_item])?;

  let show_id = show_item.id().clone();
  let toggle_playback_id = toggle_playback_item.id().clone();
  let hide_id = hide_item.id().clone();
  let quit_id = quit_item.id().clone();

  let mut tray_builder = TrayIconBuilder::with_id(TRAY_ID)
    .menu(&menu)
    .tooltip("Dance One Radio")
    .show_menu_on_left_click(false)
    .on_menu_event(move |app, event| {
      if event.id() == &show_id {
        show_main_window(app);
      } else if event.id() == &toggle_playback_id {
        let is_playing = app
          .try_state::<PlaybackState>()
          .and_then(|state| state.is_playing.lock().ok().map(|guard| *guard))
          .unwrap_or(false);
        let hidden_for_long = peek_hidden_duration(app)
          .map(|duration| duration >= RELOAD_AFTER_HIDDEN_FOR)
          .unwrap_or(false);

        if !is_playing && hidden_for_long && is_renderer_stale(app) {
          queue_toggle_playback_for_renderer(app);
          let _ = recover_main_window(app, false);
          return;
        }

        let _ = app.emit(TOGGLE_PLAYBACK_EVENT, ());
      } else if event.id() == &hide_id {
        hide_main_window(app);
      } else if event.id() == &quit_id {
        app.exit(0);
      }
    })
    .on_tray_icon_event(|tray, event| match event {
      TrayIconEvent::Click {
        button: MouseButton::Left,
        ..
      }
      | TrayIconEvent::DoubleClick {
        button: MouseButton::Left,
        ..
      } => show_main_window(tray.app_handle()),
      _ => {}
    });

  if let Some(icon) = app.default_window_icon().cloned() {
    tray_builder = tray_builder.icon(icon);
  }

  tray_builder.build(app)?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(WindowHideState::default())
    .manage(PlaybackState::default())
    .manage(RendererState::default())
    .invoke_handler(tauri::generate_handler![
      hide_to_tray,
      restore_from_tray,
      update_playback_state,
      renderer_ping,
      check_for_updates,
      install_update
    ])
    .plugin(tauri_plugin_autostart::Builder::new().build())
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_process::init())
    .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
      show_main_window(app);
    }))
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      #[cfg(target_os = "windows")]
      set_windows_app_user_model_id();
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      #[cfg(desktop)]
      apply_main_window_icon(app.handle());
      #[cfg(desktop)]
      build_tray(app.handle())?;
      Ok(())
    })
    .on_window_event(|window, event| {
      #[cfg(desktop)]
      if window.label() == MAIN_WINDOW_LABEL {
        if let WindowEvent::CloseRequested { api, .. } = event {
          api.prevent_close();
          hide_main_window(window.app_handle());
        }
      }
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
