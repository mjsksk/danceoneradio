const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Playback controls
  onTogglePlayback: (callback) => {
    ipcRenderer.on('toggle-playback', callback);
  },
  
  onNextTrack: (callback) => {
    ipcRenderer.on('next-track', callback);
  },
  
  onPreviousTrack: (callback) => {
    ipcRenderer.on('previous-track', callback);
  },
  
  // Update main process about playback state
  updatePlaybackState: (isPlaying) => {
    ipcRenderer.send('update-playback-state', isPlaying);
  },
  
  // Update track info in tray
  updateTrackInfo: (trackInfo) => {
    ipcRenderer.send('update-track-info', trackInfo);
  },
  
  // Show native notifications
  showNotification: (options) => {
    ipcRenderer.send('show-notification', options);
  },
  
  // Platform detection
  platform: process.platform,
  
  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Security: Remove node integration from renderer
delete window.require;
delete window.exports;
delete window.module;