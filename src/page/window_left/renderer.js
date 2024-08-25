// local current setting for this renderer process
let currentSettings;

// kvp for code editor for each tab content
let kvpEditor = [];

$(document).ready(() => {
    // load settings
    loadSettings();

    // load scripts
    loadScripts();

    // when save settings button clicked
    $("#btn-settings-save").click(async () => {
        saveSettings();
        loadSettings();
    });

    // when reset settings button clicked
    $("#btn-settings-reset").click(async () => {
        resetSettings();
        loadSettings();
    });

    // when back button clicked
    $("#btn-back").click(async () => {
        await preload.browserBack();
    });

    // when forward button clicked
    $("#btn-forward").click(async () => {
        await preload.browserForward();
    });

    // when home button clicked
    $("#btn-home").click(async () => {
        try {
            await preload.browserURL({ url: currentSettings.homePage });
        } catch (err) {
            console.log(err);
        }
    });

    // when enter key pressed at URL input box.
    $("#tx-input-url").keypress(function (e) {
        const key = e.which;
        if (key == 13) {
            $("#btn-input-url").click();
            return false;
        }
    });

    // when go button clicked
    $("#btn-input-url").click(async () => {
        try {
            let inputURL = $("#tx-input-url").val();
            await preload.browserURL({ url: inputURL });
        } catch (err) {
            console.log(err);
        }
    });

    // when DTR button clicked
    $("#btn-open-devtools").click(async () => {
        await preload.browserDevTools();
    });

    // when new button clicked
    $("#btn-script-new").click(async () => {
        let scriptName = await askScriptName();
        if (scriptName === null) {
            return;
        }

        $("#tab-header-script-list").append(`
            <button 
            class="nav-item nav-link" 
            id="tab-header-script-${scriptName}" 
            data-bs-toggle="pill" 
            data-bs-target="#tab-content-script-${scriptName}" 
            type="button" 
            role="tab" 
            aria-controls="v-pills-profile" 
            aria-selected="false">
            ${scriptName}
            </button>
            `);

        $("#tab-content-script-list").append(`
            <div class="code-editor-container tab-pane fade" id="tab-content-script-${scriptName}" role="tabpanel" aria-labelledby="v-pills-home-tab">
                <div id="code-editor-${scriptName}"></div>
            </div>
            `);

        let editor = monaco.editor.create(document.getElementById(`code-editor-${scriptName}`), {
            value: "",
            automaticLayout: true,
            language: "javascript",
            theme: currentSettings.editorTheme,
        });

        kvpEditor[scriptName] = editor;

        $(`#tab-header-script-${scriptName}`)[0].click();
    });

    $("#btn-script-save").click(async () => {
        saveScripts();
    });

    // when rename button clicked
    $("#btn-script-rename").click(async () => {
        let oldScriptName;
        $("#tab-header-script-list button.active").each(function (index) {
            oldScriptName = $(this).attr("id");
        });
        oldScriptName = oldScriptName.replace("tab-header-script-", "");
        // console.log(oldScriptName);

        let scriptName = await askScriptName(oldScriptName);
        if (scriptName === null) {
            return;
        }
        // console.log(scriptName);

        $(`#tab-header-script-${oldScriptName}`).attr("data-bs-target", `#tab-content-script-${scriptName}`);
        $(`#tab-header-script-${oldScriptName}`).text(`${scriptName}`);

        $(`#tab-content-script-${oldScriptName}`).attr("id", `tab-content-script-${scriptName}`);
        $(`#tab-header-script-${oldScriptName}`).attr("id", `tab-header-script-${scriptName}`);

        let oldEditor = kvpEditor[oldScriptName];
        const oldValue = oldEditor.getValue();
        kvpEditor[oldScriptName].dispose();
        delete kvpEditor[oldScriptName];
        // console.log(kvpEditor);

        $(`#code-editor-${oldScriptName}`).attr("id", `code-editor-${scriptName}`);
        let newEditor = monaco.editor.create(document.getElementById(`code-editor-${scriptName}`), {
            value: "",
            automaticLayout: true,
            language: "javascript",
            theme: currentSettings.editorTheme,
        });

        newEditor.setValue(oldValue);
        kvpEditor[scriptName] = newEditor;
    });

    // when open button clicked
    $("#btn-script-delete").click(async () => {
        let idToRemove;
        let indexToRemove;
        let childCount = $("#tab-header-script-list button").length;
        if (childCount <= 0) {
            // console.log("empty");
            return;
        }

        $("#tab-header-script-list button").each(function (index) {
            if ($(this).hasClass("active")) {
                indexToRemove = index;
                idToRemove = $(this).attr("id");
            }
        });

        const oldScriptName = idToRemove.replace("tab-header-script-", "");

        $(`#${idToRemove}`).remove();
        $(`#tab-content-script-${oldScriptName}`).remove();

        kvpEditor[oldScriptName].dispose();
        delete kvpEditor[oldScriptName];
        // console.log(kvpEditor);

        if (childCount >= 1) {
            const inp = indexToRemove - 1 >= 0 ? indexToRemove - 1 : 0;
            // console.log(inp);
            // console.log(childCount);

            if ($("#tab-header-script-list button")[inp]) {
                $("#tab-header-script-list button")[inp].click();
            }
        }
    });

    // export scripts
    $("#btn-script-export").click(async () => {
        let result = await preload.openSaveDialogJSON();

        if (result.filePath === undefined) {
            return;
        }

        if (result.filePath) {
            const content = localStorage.getItem("scripts");
            await preload.saveFile(result.filePath, content, "utf8");
        }
    });

    // import scripts
    $("#btn-script-import").click(async () => {
        let result = await preload.openFileDialogJSON();

        if (result.filePaths[0]) {
            const content = await preload.openFile(result.filePaths[0]);
            // console.log(content);

            localStorage.setItem("scripts", content);
            loadScripts();
        }
    });

    // when run async button clicked.
    $("#btn-script-run-async").click(() => {
        let activeScriptName;
        $("#tab-header-script-list button.active").each(function (index) {
            activeScriptName = $(this).attr("id");
        });
        activeScriptName = activeScriptName.replace("tab-header-script-", "");
        preload.runScript(kvpEditor[activeScriptName].getValue());
    });

    // when stop button clicked.
    $("#btn-script-stop").click(() => {
        saveScripts();
        location.reload();
    });

    // on close handler, sent from main process
    preload.handleOnMainClose((event, value) => {
        saveScripts();
    });

    //
    preload.handleDidStartNavigation((event, value) => {
        // console.log(value);
        $("#tx-input-url").val(value);
    });

    // initial url on url input box
    $("#tx-input-url").val(currentSettings.homePage);
});

// function for loading scripts from local storage
async function loadScripts() {
    const jsonAll = localStorage.getItem("scripts");
    if (!jsonAll) {
        return;
    }

    const toLoad = JSON.parse(jsonAll);
    // console.log(toLoad);

    let scriptName;

    await Object.keys(toLoad).forEach((key) => {
        // console.log(key + " : " + kvpEditor[key].getValue());
        $("#tab-header-script-list").append(`
            <button 
            class="nav-item nav-link" 
            id="tab-header-script-${key}" 
            data-bs-toggle="pill" 
            data-bs-target="#tab-content-script-${key}" 
            type="button" 
            role="tab" 
            aria-controls="v-pills-profile" 
            aria-selected="false">
            ${key}
            </button>
            `);

        $("#tab-content-script-list").append(`
            <div class="code-editor-container tab-pane fade" id="tab-content-script-${key}" role="tabpanel" aria-labelledby="v-pills-home-tab">
                <div id="code-editor-${key}"></div>
            </div>
            `);

        let editor = monaco.editor.create(document.getElementById(`code-editor-${key}`), {
            value: "",
            automaticLayout: true,
            language: "javascript",
            theme: currentSettings.editorTheme,
        });

        editor.setValue(toLoad[key]);

        kvpEditor[key] = editor;

        scriptName = key;
    });

    if ($(localStorage.getItem("lastID"))[0]) {
        $(localStorage.getItem("lastID"))[0].click();
    } else if ($("#tab-header-script-list button")[0]) {
        $("#tab-header-script-list button")[0].click();
    } else {
        // do nothing
    }
}

// function for saving scripts to local storage
async function saveScripts() {
    let toSave = {};

    await Object.keys(kvpEditor).forEach((key) => {
        toSave[key] = kvpEditor[key].getValue();
    });

    localStorage.setItem("scripts", JSON.stringify(toSave));

    let activeScriptID;
    $("#tab-header-script-list button.active").each(function (index) {
        activeScriptID = $(this).attr("id");
    });
    localStorage.setItem("lastID", `#${activeScriptID}`);
}

// function for loading settings from localStorage
async function loadSettings() {
    const initialSettings = localStorage.getItem("settings");
    if (!initialSettings) {
        resetSettings();
    }

    currentSettings = JSON.parse(localStorage.getItem("settings"));

    // put to the DOM
    $("#tx-home-page").val(currentSettings.homePage);
    $("#tx-user-agent").val(currentSettings.userAgent);
    $("#chk-show-devtools-on-run").prop("checked", currentSettings.showDevToolsOnRun);
    $("#select-ui-theme").val(currentSettings.uiTheme);
    $("#select-editor-theme").val(currentSettings.editorTheme);

    $(document.querySelector("html")).attr("data-bs-theme", currentSettings.uiTheme);
    monaco.editor.setTheme(currentSettings.editorTheme);
}

// function for saving settings to localStorage
async function saveSettings() {
    let homePage = $("#tx-home-page").val();
    let userAgent = $("#tx-user-agent").val();
    let showDevToolsOnRun = $("#chk-show-devtools-on-run").is(":checked");
    let uiTheme = $("#select-ui-theme").val();
    let editorTheme = $("#select-editor-theme").val();
    // alert(uiTheme);

    let settingsToSave = {
        homePage: homePage,
        userAgent: userAgent,
        showDevToolsOnRun: showDevToolsOnRun,
        uiTheme: uiTheme,
        editorTheme: editorTheme,
    };

    localStorage.setItem("settings", JSON.stringify(settingsToSave));

    $(document.querySelector("html")).attr("data-bs-theme", uiTheme);
    monaco.editor.setTheme(editorTheme);
}

// function for resetting settings to the default values
async function resetSettings() {
    // todo: change to static page.
    let homePage = "dopa://core/index.html";
    let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36";
    let showDevToolsOnRun = true;
    let uiTheme = "light";
    let editorTheme = "vs-light";

    let settingsToSave = {
        homePage: homePage,
        userAgent: userAgent,
        showDevToolsOnRun: showDevToolsOnRun,
        uiTheme: uiTheme,
        editorTheme: editorTheme,
    };

    localStorage.setItem("settings", JSON.stringify(settingsToSave));
}

// function for showing prompt asking for a script name
async function askScriptName(defaultValue = `S-${Math.floor(Date.now() / 1000)}`) {
    let scriptName = await preload.promptSingleText({
        title: "Please enter a script name",
        label: "Script Name",
        value: defaultValue,
    });
    // console.log(scriptName);

    return scriptName;
}
