const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("preload", {
    nodeVersion: () => process.versions.node,
    chromeVersion: () => process.versions.chrome,
    electronVersion: () => process.versions.electron,
    browserBack: async () => {
        let result = await ipcRenderer.invoke("browser-back");
        return result;
    },
    browserForward: async () => {
        let result = await ipcRenderer.invoke("browser-forward");
        return result;
    },
    browserURL: async (args) => {
        let result = await ipcRenderer.invoke("browser-url", args);
        return result;
    },
    browserDevTools: async () => {
        let result = await ipcRenderer.invoke("browser-devtools");
        return result;
    },
    promptSingleText: async (args) => {
        let result = await ipcRenderer.invoke("prompt-single-text", {
            title: args.title,
            label: args.label,
            value: args.value,
        });

        return result;
    },
    messageBoxQuestion: async (message) => {
        let result = await ipcRenderer.invoke("dialog-show-message-box", {
            message: message,
            buttons: ["OK", "Cancel"],
        });

        return result;
    },
    messageBoxError: async (message) => {
        let result = await ipcRenderer.invoke("dialog-show-message-box", {
            message: message,
            type: "error",
        });

        return result;
    },
    openFolderDialog: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            title: "Open Download Folder",
            properties: ["openDirectory"],
        });

        return result;
    },
    openFileDialogJS: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            properties: ["openFile"],
            filters: [
                {
                    name: "JS File",
                    extensions: ["js"],
                },
            ],
        });

        return result;
    },
    openFileDialogJSON: async () => {
        let result = await ipcRenderer.invoke("dialog-show-open-dialog", {
            properties: ["openFile"],
            filters: [
                {
                    name: "JSON File",
                    extensions: ["json"],
                },
            ],
        });

        return result;
    },
    openSaveDialogJS: async () => {
        let result = await ipcRenderer.invoke("dialog-show-save-dialog", {
            filters: [
                {
                    name: "JS File",
                    extensions: ["js"],
                },
            ],
        });

        return result;
    },
    openSaveDialogJSON: async () => {
        let result = await ipcRenderer.invoke("dialog-show-save-dialog", {
            filters: [
                {
                    name: "JSON File",
                    extensions: ["json"],
                },
            ],
        });

        return result;
    },
    saveFile: async (path, content) => {
        let result = await ipcRenderer.invoke("save-file", {
            path: path,
            content: content,
            encoding: "utf8",
        });

        return result;
    },
    openFile: async (path) => {
        let result = await ipcRenderer.invoke("open-file", {
            path: path,
            encoding: "utf8",
        });

        return result;
    },
    runScript: async (content) => {
        let result = await ipcRenderer.invoke("run-script", {
            content: content,
        });

        return result;
    },
    handleOnMainClose: (callback) => ipcRenderer.on("on-main-close", callback),
    handleDidStartNavigation: (callback) => ipcRenderer.on("on-did-start-navigation", callback),
});
