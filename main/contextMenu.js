const { app, BrowserWindow, ipcMain, Menu, dialog, shell} = require('electron');
const { fs, path,} = {
    fs: require('fs'),
    path: require('path'),
};
function buildContextMenuOf(window){
    // 监听右键菜单事件
    //目录的右键菜单
    ipcMain.on('openDirectory', (event, position, fileInfo) => {
        const menu = Menu.buildFromTemplate([
            {
                label: '打开目录',
                click: () => {shell.openPath(fileInfo.path);}
            },
            { type: 'separator' },
            {
                label: '删除目录',
                click: () => {
                    console.log('删除');
                    fs.rm(fileInfo.path, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error(`Error deleting directory: ${err}`);
                        } else {
                            console.log('Directory and its contents deleted successfully');
                            window.webContents.send('refreshDirectory');
                        }
                    });

                }
            },
        ]);

        // 在指定位置显示菜单
        menu.popup(window, { x: position.x, y: position.y });
    });

    //文件的右键菜单
    ipcMain.on('openFile', (event, position, fileInfo) => {
        const menu = Menu.buildFromTemplate([
            {
                label: '打开文件',
                submenu: [
                    {label: '以编辑器打开',
                        click: () => {
                            function readFileWithStream (fileInfo, window){
                                const stream = fs.createReadStream(fileInfo.path, { encoding: 'utf8' });
                                let data = '';

                                stream.on('data', (chunk) => {
                                    data += chunk; // 累加读取的块
                                });

                                stream.on('end', () => {
                                    window.webContents.send(`txt-file`, fileInfo, data);// ->editFile.js
                                });

                                stream.on('error', (err) => {
                                    event.reply('read-file-response', { success: false, error: err.message });
                                });
                            };
                            // 调用函数读取文件时使用
                            readFileWithStream(fileInfo, window);
                    }
                },
                    {
                        label: '以默认方式打开',
                        click: () => {shell.openPath(fileInfo.path);}
                    },
                    {
                        label: '打开文件位置',
                        click: () => {
                            shell.showItemInFolder(fileInfo.path);
                        }
                    }
                ]

            },
            { type: 'separator' },
            {
                label: '删除文件',
                click: () => {
                    console.log('删除');
                    fs.rm(fileInfo.path, { recursive: true, force: true }, (err) => {
                        if (err) {
                            console.error(`Error deleting directory: ${err}`);
                        } else {
                            console.log('Directory and its contents deleted successfully');
                            window.webContents.send('refreshDirectory');
                        }
                    });

                }
            },
        ]);

        // 在指定位置显示菜单
        menu.popup(window, { x: position.x, y: position.y });
    });
}

module.exports = {buildContextMenuOf}
