const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("deadpool", {
  appVersion: "0.1.0",
});
