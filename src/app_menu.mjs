// begin: import modules.
import { BaseWindow, dialog, shell, Menu } from "electron";
// end: import modules.

// main menu definition
function appMenuTemplate(leftView, rightView) {
    const mainMenuTemplate = [
        {
            label: "File",
            submenu: [
                {
                    role: "quit",
                },
            ],
        },
        {
            label: "Edit",
            submenu: [
                {
                    role: "cut",
                },
                {
                    role: "copy",
                },
                {
                    role: "paste",
                },
                {
                    role: "pasteandmatchstyle",
                },
                {
                    role: "selectall",
                },
            ],
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Reload Left",
                    click() {
                        leftView.webContents.reload();
                    },
                },
                {
                    label: "Reload Right",
                    click() {
                        rightView.webContents.reload();
                    },
                },
                {
                    label: "Toggle Left DevTools",
                    click() {
                        // toggle devtools on the left side view
                        if (leftView.webContents.isDevToolsOpened()) {
                            leftView.webContents.closeDevTools();
                        } else {
                            leftView.webContents.openDevTools();
                        }
                    },
                },
                {
                    label: "Toggle Right DevTools",
                    click() {
                        // toggle devtools on the right side view
                        if (rightView.webContents.isDevToolsOpened()) {
                            rightView.webContents.closeDevTools();
                        } else {
                            rightView.webContents.openDevTools();
                        }
                    },
                },
            ],
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "About",
                    click() {
                        // show message box containing about info
                        dialog.showMessageBox(BaseWindow.getFocusedWindow(), { title: "About", message: "RF Dopa Edit 2024" });
                    },
                },
                {
                    label: "GitHub Account",
                    click() {
                        shell.openExternal("https://github.com/rakifsul");
                    },
                },
            ],
        },
    ];

    return mainMenuTemplate;
}

// export menu
export default async function appMenu(leftView, rightView) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuTemplate(leftView, rightView)));
}
