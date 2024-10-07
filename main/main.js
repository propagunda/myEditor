const {electron, app, BrowserWindow, dialog, Menu, webContents, ipcMain} = require('electron');
const {fs, path,} = {
    fs: require('fs'),
    path: require('path'),
};
const {exec} = require('child_process');
const {ipcDetector} = require(`./ipc.js`)
const {buildMenuOf} = require('./Menu.js');
const {buildContextMenuOf} = require('./ContextMenu.js');


app.on('ready', () => {

    mainWindow();

    // 应用即将退出事件
    app.on('before-quit', () => {
    });
    // 应用已退出事件
    app.on('will-quit', () => {
    });
})

function mainWindow() {
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

    let watchers = {};

    win.loadFile(path.resolve("../render/html/index.html"));

    win.on('ready-to-show', () => {
        ipcDetector(win,  watchers)
        buildContextMenuOf(win)
        Menu.setApplicationMenu(buildMenuOf(win));
        win.show();
        win.webContents.openDevTools();
    });

    win.on('close', async (event) => {
        event.preventDefault(); // 阻止窗口关闭
        win.webContents.send('closeAllTabs'); // 发送关闭信号

        // 等待 watchers 被清空
        console.log('Waiting for watchers to clear...')
        async function waitForWatchers() {
            while (Object.keys(watchers).length !== 0) {
                await new Promise(resolve => setTimeout(resolve, 100)); // 每 100ms 等待一次
            }
        }

        await waitForWatchers(); // 等待 watchers 清空
        console.log('All watchers cleared, closing window...')
        win.destroy(); // 关闭窗口
    });


    win.on('closed', () => {
    });
}




