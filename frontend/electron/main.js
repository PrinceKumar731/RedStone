const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const appIconPath = path.join(__dirname, '..', 'assets', 'Redstone_Dust_JE2_BE2.webp');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 680,
    icon: appIconPath,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  if (process.platform === 'win32') {
    win.setIcon(appIconPath);
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.redstone.app');
  }

  Menu.setApplicationMenu(null);
  createWindow();

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
