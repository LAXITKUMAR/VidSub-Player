const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const fs = require('fs');

let mainWindow = null;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        height: 612,
        width: 1024
    });
    //mainWindow.webContents.openDevTools();  //Open only in developement
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    let template = [
        {
            label: 'Open',
            accelerators: "CommandOrControl+O",
            click: function () {
                openFolderDialog();
            }
        },
        {
            label: "Subtitles",
            submenu: [{
                label: 'Select VTT file',
                accelerators: "CommandOrControl+S",
                click: function () {
                    addSubtitles();
                }
            },
            {
                label: 'Turn off subtitles',
                accelerators: "CommandOrControl+Z",
                click: function () {
                    removeSubtitles();
                }
            }
            ]

        },
        {
            label: "Help",
            submenu: [{
                label: 'About Author',
                click: function () {
                    mainWindow.webContents.send('open-about-developer');
                }
            }
            ]

        }

    ];

    let Menu = electron.Menu;
    let menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    function openFolderDialog() {
        dialog.showOpenDialog(mainWindow, {
            properties: ['opnFile']
        }, function (filePath) {
            if (filePath && filePath.length) { //Check if any file selectde
                mainWindow.webContents.send('video-file-selected', filePath[0]);
            }
        })
    };
    function addSubtitles() {
        dialog.showOpenDialog(mainWindow, {
            title: "Select video file",
            filters: [
                { name: 'vtt', extensions: ['vtt'] }
            ],
            properties: ['opnFile']
        }, function (filePath) {
            if (filePath && filePath.length) { //Check if any file selectde
                mainWindow.webContents.send('subtitles-file-selected', filePath[0]);
            }
        })
    }

    function removeSubtitles() {
        mainWindow.webContents.send('remove-subtitles');
    }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});