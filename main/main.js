const {electron, app, BrowserWindow, dialog, Menu, webContents} = require('electron');
const { fs, path,} = {
    fs: require('fs'),
    path: require('path'),
};
const { exec } = require('child_process');
const {ipcDetector} = require(`./ipc.js`)
const {buildMenuOf} = require('./Menu.js');
const {buildContextMenuOf} = require('./ContextMenu.js');


app.on('ready', () => {
    mainWindow();
})

function mainWindow ()  {
    const win = new BrowserWindow({
        show: false,
        frame: true,
        width: 1000,
        height: 800,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            sandbox: false,
        },
    })


    win.on('ready-to-show', () => {
        ipcDetector(win)
        buildContextMenuOf(win)
        Menu.setApplicationMenu(buildMenuOf(win));
        win.show();
        win.webContents.openDevTools();
    });

    win.loadFile(path.resolve("../render/html/index.html"));


}




