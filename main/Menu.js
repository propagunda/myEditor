const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron');

function buildMenuOf(window){
const T_mainMenu = [
    {
        label: "文件",
        submenu: [
            {label: "选择目录",
                click(){
                    dialog.showOpenDialog({
                        properties: ['openDirectory', "createDirectory", "multiSelections"],
                        filters: [
                            { name: 'All Files', extensions: ['*'] }
                        ]
                    }).then(result => {
                        window.webContents.send('DirectoryPath', result.filePaths);//->showDirectory.js
                    })

                }
            },
            {label: "选择文件",
                click(){
                    dialog.showOpenDialog({
                        properties: ['openFile', "createDirectory","multiSelections"],
                        filters: [
                            { name: 'All Files', extensions: ['*'] },
                            { name: 'hkx', extensions: ['hkx'] }
                        ]
                    }).then(result => {
                        window.webContents.send(`DirectoryPath`, result)})

                }
            }
        ]
    },
    {
        label: "控制台",
        role:'toggleDevTools'

    },
    {
        label: "刷新",
        click(){
            window.webContents.send('refreshDirectory');
        }

    }
    ]

return Menu.buildFromTemplate(T_mainMenu)

}



module.exports = {buildMenuOf}