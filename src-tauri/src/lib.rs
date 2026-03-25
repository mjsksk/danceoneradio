#[cfg(desktop)]
use tauri::{AppHandle, Emitter, Manager, Runtime};
#[cfg(desktop)]
use tauri::{
  menu::{Menu, MenuItem},
  tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
  WindowEvent,
};
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
#[cfg(target_os = "windows")]
const WINDOWS_APP_USER_MODEL_ID: &str = "com.danceoneradio.desktop";

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
fn show_main_window<R: Runtime>(app: &AppHandle<R>) {
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
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
  if let Some(window) = app.get_webview_window(MAIN_WINDOW_LABEL) {
    let _ = window.hide();
  }
}

#[tauri::command]
fn hide_to_tray(app: tauri::AppHandle) {
  hide_main_window(&app);
}

#[tauri::command]
fn restore_from_tray(app: tauri::AppHandle) {
  show_main_window(&app);
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
    .invoke_handler(tauri::generate_handler![hide_to_tray, restore_from_tray])
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_process::init())
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
