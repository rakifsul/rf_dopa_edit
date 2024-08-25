import { app, BaseWindow, WebContentsView, ipcMain, Menu, clipboard, protocol, net } from "electron";
import * as path from "node:path";
import * as url from "node:url";
import isDev from "electron-is-dev";
import Store from "electron-store";
import appMenu from "./app_menu.mjs";
import appContextMenu from "./app_context_menu.mjs";
import appService from "./app_service.mjs";
import rfxAPI from "./api/rfx.mjs";
import rfxwAPI from "./api/rfxw.mjs";

export default async function theApp() {
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // init user data
    const exeDir = isDev ? path.join(__dirname, ".." + path.sep) : path.dirname(app.getPath("exe"));
    app.setPath("userData", path.join(exeDir, "data"));
    console.log(app.getPath("userData"));
    const store = new Store();

    // declare global vars
    let mainWindow;
    let leftView;
    let rightView;

    // create base window
    const createWindow = async () => {
        mainWindow = new BaseWindow({
            title: `RF Dopa Edit - ${isDev ? "Development" : "Production"}`,
            width: 1280,
            height: 800,
            show: false,
        });

        // restore base window
        restoreBaseWindow();

        // don't change the title if updated, keep it same as base window parameter
        mainWindow.on("page-title-updated", function (e) {
            e.preventDefault();
        });

        // register dopa:// as protocol. must be written before loadURL or loadFile.
        protocol.handle("dopa", (request) => {
            const fakeHTTP = request.url.replace("dopa://", "http://");

            const parsedFakeHTTP = url.parse(fakeHTTP);

            const plainURL = (parsedFakeHTTP.protocol + "//" + parsedFakeHTTP.host + parsedFakeHTTP.pathname).replace("http://", "dopa://");
            // console.log(plainURL);

            const plainHash = parsedFakeHTTP.hash;
            // console.log(plainHash);

            const filePath = plainURL.slice("dopa://".length);
            // console.log(filePath);

            let toFetch = url.pathToFileURL(path.join(__dirname, "page" + path.sep + "window_right" + path.sep + filePath)).toString();

            if (plainHash && plainHash.length > 0) {
                toFetch += plainHash;
            }

            return net.fetch(toFetch);
        });

        // map server to webcontentview left
        const leftServer = path.join(__dirname, "page" + path.sep + "window_left" + path.sep + "renderer.html");
        leftView = new WebContentsView({
            webPreferences: {
                zoomFactor: 0.85,
                preload: path.join(__dirname, "page" + path.sep + "window_left" + path.sep + "preload.js"),
            },
        });

        console.log("connecting to code server....");
        leftView.webContents.loadURL(leftServer);
        if (isDev) {
            leftView.webContents.openDevTools({ mode: "bottom" });
        }

        mainWindow.contentView.addChildView(leftView);

        // map server to webcontentview right
        const rightServer = "dopa://core/index.html";
        // const rightServer = "https://duckduckgo.com";
        // const rightServer = "page/window_right/core/index.html";
        // const rightServer = path.join(__dirname, "page/window_right/core/index.html");
        rightView = new WebContentsView({
            webPreferences: {
                zoomFactor: 0.85,
                preload: path.join(__dirname, "page" + path.sep + "window_right" + path.sep + "preload.js"),
            },
        });

        console.log("connecting to preview server....");
        let countDown = 3;
        rightView.webContents.loadURL(rightServer);
        rightView.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
            if (countDown <= 0) {
                rightView.webContents.loadURL(`dopa://core/error.html?error-code=${errorCode}&error-text=${errorDescription}`);
                return;
            }
            console.log("server not ready. trying to reload....");
            setTimeout(() => {
                rightView.webContents.loadURL(rightView.webContents.getURL());
                --countDown;
            }, 1500);
        });

        rightView.webContents.setWindowOpenHandler(({ url }) => {
            rightView.webContents.loadURL(url);
            return { action: "deny" };
        });

        rightView.webContents.on("did-start-navigation", (details) => {
            // console.log(details.url);
            leftView.webContents.send("on-did-start-navigation", details.url);
        });

        mainWindow.contentView.addChildView(rightView);

        leftView.webContents.once("did-finish-load", () => {
            mainWindow.show();
        });

        // recalculate bounds on resize
        recalculateWinSize();

        mainWindow.on("resized", () => {
            recalculateWinSize();
        });

        mainWindow.on("maximize", () => {
            recalculateWinSize();
        });

        mainWindow.on("unmaximize", () => {
            recalculateWinSize();
        });

        mainWindow.on("restore", () => {
            recalculateWinSize();
        });

        // set system menu
        await appMenu(leftView, rightView);

        // set context menu
        await appContextMenu(leftView.webContents);
        await appContextMenu(rightView.webContents);

        // init all services
        const rfx = await rfxAPI(rightView.webContents);
        const rfxw = await rfxwAPI();
        await appService(rfxw, rfx);
    };

    // for restoring window to the previous state
    const restoreBaseWindow = () => {
        //
        const isInit = store.get("isMaximized") === undefined || null;
        if (isInit) {
            store.set("bounds", mainWindow.getBounds());
            store.set("isMaximized", mainWindow.isMaximized());
        }

        //
        const maxed = store.get("isMaximized");
        if (maxed) {
            mainWindow.maximize();
        }
        mainWindow.setBounds(store.get("bounds"));
        mainWindow.on("close", () => {
            store.set("bounds", mainWindow.getBounds());
            store.set("isMaximized", mainWindow.isMaximized());

            leftView.webContents.send("on-main-close");
        });
    };

    // restoring the WebContentsViews sizes
    const recalculateWinSize = () => {
        const bounds = mainWindow.getBounds();
        leftView.setBounds({
            x: 0,
            y: 0,
            width: bounds.width / 2,
            height: bounds.height - 66,
        });

        rightView.setBounds({
            x: bounds.width / 2,
            y: 0,
            width: bounds.width / 2 - 20,
            height: bounds.height - 66,
        });
    };

    app.whenReady().then(() => {
        createWindow();

        app.on("activate", () => {
            if (BaseWindow.getAllWindows().length === 0) {
                // createWindow();
            }
        });
    });

    // on all window closed, quit app unless it's running on Mac
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") {
            app.quit();
        }
    });
}
