const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;
let isPlaying = false;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the desktop-optimized build
  const startUrl = isDev 
    ? 'http://localhost:8080/#/desktop' 
    : `file://${path.join(__dirname, 'dist/index.html')}#/desktop`;
  
  console.log('Loading URL:', startUrl);
  console.log('__dirname:', __dirname);
  
  mainWindow.loadURL(startUrl);

  // Open DevTools to debug (remove after testing)
  if (!isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
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
    if (!app.isQuiting) {
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
  // Skip tray icon for now to avoid build issues
  // const trayIconPath = path.join(__dirname, 'assets/tray-icon.png');
  // tray = new Tray(trayIconPath);
  return; // Temporarily disable tray
  
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