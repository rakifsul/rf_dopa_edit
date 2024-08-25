import { app, Menu, MenuItem, clipboard, BrowserWindow } from "electron";

export default async function appContextMenu(webContents) {
    webContents.on(
        "context-menu",
        (event, props) => {
            event.preventDefault();
            let menu = new Menu();
            menu.append(
                new MenuItem({
                    id: "copyLink",
                    label: "Copy Lin&k",
                    enabled: props.linkURL.length > 0 && props.mediaType === "none",
                    click(menuItem) {
                        props.linkURL = menuItem.transform ? menuItem.transform(props.linkURL) : props.linkURL;
                        clipboard.write({
                            bookmark: props.linkText,
                            text: props.linkURL,
                        });
                    },
                })
            );
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(new MenuItem({ role: "undo" }));
            menu.append(new MenuItem({ role: "redo" }));
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(new MenuItem({ role: "cut" }));
            menu.append(new MenuItem({ role: "copy" }));
            menu.append(new MenuItem({ role: "paste" }));
            menu.append(new MenuItem({ role: "pasteandmatchstyle" }));
            menu.append(new MenuItem({ type: "separator" }));
            menu.append(new MenuItem({ role: "delete" }));
            menu.append(new MenuItem({ role: "selectall" }));
            menu.popup(webContents);
        },
        false
    );
}
