const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Hệ thống Quản lý Đối tượng",
    autoHideMenuBar: true, // Ẩn thanh menu mặc định cho đẹp
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // Tải file index.html sau khi phần mềm được build
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});