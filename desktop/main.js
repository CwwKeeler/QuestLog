const path = require("path");
const { app, BrowserWindow, dialog } = require("electron");
const { startQuestLogServer } = require("../server");

const APP_ROOT = path.resolve(__dirname, "..");
const APP_ICON = path.join(APP_ROOT, "assets", "brand", "questlog_q_icon_transparent.png");
const SMOKE_TEST_MODE = process.env.QUESTLOG_DESKTOP_SMOKE_TEST === "1";
const DESKTOP_PORT = Number(process.env.QUESTLOG_DESKTOP_PORT) || 35647;

let mainWindow = null;
let serverHandle = null;

async function createMainWindow() {
  if (!serverHandle) {
    serverHandle = await startQuestLogServer({
      host: "127.0.0.1",
      port: DESKTOP_PORT,
      rootDir: APP_ROOT,
      openBrowserOnStart: false
    });
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1100,
    minHeight: 760,
    backgroundColor: "#0b1220",
    autoHideMenuBar: true,
    icon: APP_ICON,
    title: "QuestLog Desktop",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  await mainWindow.loadURL(serverHandle.appUrl);
  console.log(`QuestLog desktop window loaded at ${serverHandle.appUrl}`);

  if (SMOKE_TEST_MODE) {
    setTimeout(() => {
      app.quit();
    }, 1500);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function shutdownServer() {
  if (!serverHandle?.server) {
    return;
  }

  await new Promise((resolve) => {
    serverHandle.server.close(() => resolve());
  });

  serverHandle = null;
}

app.whenReady().then(async () => {
  try {
    await createMainWindow();
  } catch (error) {
    console.error("Could not start QuestLog desktop.", error);
    dialog.showErrorBox(
      "QuestLog Desktop",
      `The desktop app could not start.\n\n${error.message || error}`
    );
    await shutdownServer();
    app.quit();
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", async () => {
  if (process.platform !== "darwin") {
    await shutdownServer();
    app.quit();
  }
});

app.on("before-quit", async () => {
  await shutdownServer();
});
