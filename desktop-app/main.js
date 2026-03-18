const { app, BrowserWindow, Menu, Tray, globalShortcut, ipcMain, shell, nativeImage } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const http = require('http');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let tray;
let isPlaying = false;
let updateStatus = 'idle';
let updateMessage = 'Updates are not configured yet.';
let staticServer;
let staticServerUrl;

function getAssetPath(filename) {
  return path.join(__dirname, 'assets', filename);
}

function getWindowIconPath() {
  return process.platform === 'win32' ? getAssetPath('icon.ico') : getAssetPath('icon.png');
}

function showMainWindow() {
  if (!mainWindow) return;
  mainWindow.show();
  mainWindow.focus();
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2'
  };

  return types[ext] || 'application/octet-stream';
}

function startStaticServer() {
  if (isDev) {
    return Promise.resolve('http://localhost:8080/desktop.html');
  }

  if (staticServerUrl) {
    return Promise.resolve(staticServerUrl);
  }

  const appDistPath = path.join(__dirname, 'app-dist');

  return new Promise((resolve, reject) => {
    staticServer = http.createServer((request, response) => {
      const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
      const relativePath = requestUrl.pathname === '/' ? '/desktop.html' : requestUrl.pathname;
      const safePath = path.normalize(relativePath).replace(/^(\.\.[\\/])+/, '').replace(/^[/\\]+/, '');
      const filePath = path.join(appDistPath, safePath);

      if (!filePath.startsWith(appDistPath)) {
        response.writeHead(403);
        response.end('Forbidden');
        return;
      }

      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(error.code === 'ENOENT' ? 404 : 500);
          response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
          return;
        }

        response.writeHead(200, {
          'Content-Type': getContentType(filePath),
          'Cache-Control': 'no-cache'
        });
        response.end(data);
      });
    });

    staticServer.on('error', reject);
    staticServer.listen(0, '127.0.0.1', () => {
      const address = staticServer.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to determine desktop app server address.'));
        return;
      }

      staticServerUrl = `http://127.0.0.1:${address.port}/desktop.html`;
      resolve(staticServerUrl);
    });
  });
}

function sendUpdateStatus(status, message) {
  updateStatus = status;
  updateMessage = message;

  if (mainWindow) {
    mainWindow.webContents.send('update-status', { status, message });
  }
}

async function createWindow() {
  const windowIconPath = getWindowIconPath();
  const startUrl = await startStaticServer();
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 860,
    minWidth: 980,
    minHeight: 680,
    autoHideMenuBar: true,
    backgroundColor: '#070b14',
    icon: windowIconPath,
    title: 'Dance One Radio',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    show: false
  });

  if (process.platform === 'win32') {
    mainWindow.setIcon(nativeImage.createFromPath(windowIconPath));
  }
  
  mainWindow.loadURL(startUrl);

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
    if (!app.isQuiting && tray) {
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
  const trayIconPath = getAssetPath('tray-icon.png');
  tray = new Tray(trayIconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dance One Radio',
      click: showMainWindow
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
    showMainWindow();
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
  app.setAppUserModelId('com.danceoneradio.app');
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  autoUpdater.autoDownload = false;
  createWindow().catch((error) => {
    console.error('Failed to create main window:', error);
    app.quit();
  });
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
  if (staticServer) {
    staticServer.close();
    staticServer = null;
    staticServerUrl = null;
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-update-status', () => {
  return { status: updateStatus, message: updateMessage };
});

ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    sendUpdateStatus('unavailable', 'Update checks are only available in installed builds.');
    return { status: updateStatus, message: updateMessage };
  }

  try {
    sendUpdateStatus('checking', 'Checking for updates...');
    await autoUpdater.checkForUpdates();
  } catch (error) {
    const message = error?.message?.includes('publish')
      ? 'Update feed is not configured yet.'
      : `Update check failed: ${error.message}`;
    sendUpdateStatus('error', message);
  }

  return { status: updateStatus, message: updateMessage };
});

ipcMain.handle('download-update', async () => {
  try {
    if (updateStatus !== 'available') {
      return { status: updateStatus, message: updateMessage };
    }

    sendUpdateStatus('downloading', 'Downloading update...');
    await autoUpdater.downloadUpdate();
  } catch (error) {
    sendUpdateStatus('error', `Update download failed: ${error.message}`);
  }

  return { status: updateStatus, message: updateMessage };
});

ipcMain.handle('install-update', async () => {
  autoUpdater.quitAndInstall();
  return true;
});

ipcMain.on('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('show-window', () => {
  showMainWindow();
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

autoUpdater.on('checking-for-update', () => {
  sendUpdateStatus('checking', 'Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  sendUpdateStatus('available', `Update ${info.version} is available. Click Download Update to install it here.`);
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    new Notification({
      title: 'Dance One Radio',
      body: `Update ${info.version} is available.`
    }).show();
  }
});

autoUpdater.on('update-not-available', () => {
  sendUpdateStatus('up-to-date', 'You are already on the latest version.');
});

autoUpdater.on('error', (error) => {
  const message = error?.message?.includes('publish')
    ? 'Update feed is not configured yet.'
    : `Update check failed: ${error.message}`;
  sendUpdateStatus('error', message);
});

autoUpdater.on('download-progress', (progress) => {
  sendUpdateStatus('downloading', `Downloading update... ${Math.round(progress.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  sendUpdateStatus('downloaded', `Update ${info.version} is ready. Click Install Update to restart and update in place.`);
  const { Notification } = require('electron');
  if (Notification.isSupported()) {
    new Notification({
      title: 'Dance One Radio',
      body: `Update ${info.version} is ready to install.`
    }).show();
  }
});

function updateTrayMenu() {
  if (!tray) return;
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Dance One Radio',
      click: showMainWindow
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
