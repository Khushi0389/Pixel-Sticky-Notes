// main.js
const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store').default;


const store = new Store({ name: 'pixel-notes' });

ipcMain.handle('store-get-notes', () => {
  return store.get('notes', []);
});
ipcMain.handle('store-save-notes', (event, notes) => {
  store.set('notes', notes);
});

let mainWindow, tray;
const isMac = process.platform === 'darwin';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 300,
    height: 350,
    icon: path.join(__dirname, 'tray-icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });
  mainWindow.loadFile('index.html');
  mainWindow.removeMenu();
  mainWindow.on('close', e => {
    e.preventDefault();
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  createWindow();
  tray = new Tray(path.join(__dirname, 'tray-icon.ico'));
  const menu = Menu.buildFromTemplate([
    { label: 'Show Notes', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setToolTip('Pixel Sticky Notes');
  tray.setContextMenu(menu);
  app.setLoginItemSettings({ openAtLogin: true });
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow.show();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
