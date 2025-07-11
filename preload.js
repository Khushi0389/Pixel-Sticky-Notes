// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('store', {
  getNotes:    () => ipcRenderer.invoke('store-get-notes'),
  saveNotes:   notes => ipcRenderer.invoke('store-save-notes', notes)
});
