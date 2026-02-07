const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

const setupAutoUpdates = () => {
  const updatesUrl = process.env.DEADPOOL_UPDATES_URL;
  if (!updatesUrl) {
    return;
  }

  autoUpdater.setFeedURL({ provider: "generic", url: updatesUrl });
  autoUpdater.autoDownload = true;
  autoUpdater.on("update-available", () => {
    console.log("Update available, downloading...");
  });
  autoUpdater.on("update-downloaded", () => {
    console.log("Update downloaded, will install on quit.");
  });
  autoUpdater.on("error", (error) => {
    console.error("Auto-update error:", error);
  });

  autoUpdater.checkForUpdatesAndNotify();
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#0a0b10",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));
};

app.whenReady().then(() => {
  createWindow();
  setupAutoUpdates();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
