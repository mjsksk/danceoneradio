const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;
let isPlaying = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080/desktop.html');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'app', 'desktop.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Log any load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent window from closing, minimize to tray instead
  mainWindow.on('close', (event) => {
    if (tray && !app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function createTray() {
  const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');

  if (!fs.existsSync(trayIconPath)) {
    console.warn('Tray icon not found, continuing without tray support.');
    tray = null;
    return;
  }

  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dance One Radio',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: isPlaying ? 'Pause' : 'Play',
      click: () => {
        mainWindow.webContents.send('toggle-playback');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('Dance One Radio');
  
  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
}

function registerGlobalShortcuts() {
  // Media key shortcuts
  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('toggle-playback');
  });

  globalShortcut.register('MediaNextTrack', () => {
    mainWindow.webContents.send('next-track');
  });

  globalShortcut.register('MediaPreviousTrack', () => {
    mainWindow.webContents.send('previous-track');
  });

  // Custom shortcuts
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    mainWindow.webContents.send('toggle-playback');
  });

  globalShortcut.register('CommandOrControl+M', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// App event listeners
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.on('update-playback-state', (event, playing) => {
  isPlaying = playing;
  updateTrayMenu();
});

ipcMain.on('update-track-info', (event, trackInfo) => {
  if (tray) {
    tray.setToolTip(`Dance One Radio - ${trackInfo.title || 'Live Stream'}`);
  }
});

ipcMain.on('show-notification', (event, options) => {
  const { Notification } = require('electron');
  
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: options.title || 'Dance One Radio',
      body: options.body
    });
    
    notification.show();
  }
});

function updateTrayMenu() {
  if (!tray) return;
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dance One Radio',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    {
      label: isPlaying ? 'Pause' : 'Play',
      click: () => {
        mainWindow.webContents.send('toggle-playback');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}
