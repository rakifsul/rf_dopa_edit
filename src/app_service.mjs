import { ipcMain, dialog, BaseWindow } from "electron";
import * as fs from "node:fs";
import prompt from "custom-electron-prompt";

// setup is a handler wrapper
export default async function appService(rfxw, rfx) {
    //
    ipcMain.handle("prompt-single-text", async (event, args) => {
        let ret = await prompt(
            {
                alwaysOnTop: true,
                title: args.title,
                label: args.label,
                value: args.value,
                inputAttrs: {
                    type: "text",
                },
                type: "input",
            },
            BaseWindow.getFocusedWindow()
        );
        return ret;
    });

    // for any types of dialog message box.
    ipcMain.handle("dialog-show-message-box", async (event, args) => {
        let ret = await dialog.showMessageBox(BaseWindow.getFocusedWindow(), args);
        return ret;
    });

    // for open dialog.
    ipcMain.handle("dialog-show-open-dialog", async (event, args) => {
        let ret = await dialog.showOpenDialog(BaseWindow.getFocusedWindow(), args);
        return ret;
    });

    // for save dialog.
    ipcMain.handle("dialog-show-save-dialog", async (event, args) => {
        let ret = await dialog.showSaveDialog(BaseWindow.getFocusedWindow(), args);
        return ret;
    });

    // for back button of the right view browser
    ipcMain.handle("browser-back", async (event, args) => {
        rfx.goBack();
    });

    // for forward button
    ipcMain.handle("browser-forward", async (event, args) => {
        rfx.goForward();
    });

    // for URL input navigation
    ipcMain.handle("browser-url", async (event, args) => {
        rfx.goTo(args.url);
    });

    //  for opening devtools
    ipcMain.handle("browser-devtools", async (event, args) => {
        rfx.w.openDevTools({ mode: "bottom" });
    });

    // for saving file
    ipcMain.handle("save-file", async (event, args) => {
        fs.writeFileSync(args.path, args.content, args.encoding);
    });

    // for opening file
    ipcMain.handle("open-file", async (event, args) => {
        return fs.readFileSync(args.path, args.encoding);
    });

    // for running script through eval in async mode
    ipcMain.handle("run-script", async (event, args) => {
        const scopedEval = (scope, script0, script1) => Function(`(async () => {${script0} ${script1}})(); `).bind(scope)();
        const ret = scopedEval({ rfxw, rfx }, `const rfxw = this.rfxw; const rfx = this.rfx;`, `${args.content}`);
        return ret;
    });
}
