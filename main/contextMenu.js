const { app, BrowserWindow, ipcMain, Menu, dialog, shell} = require('electron');
const { fs, path,} = {
    fs: require('fs'),
    path: require('path'),
};
const { exec } = require('child_process');
function buildContextMenuOf(window){
    // 监听右键菜单事件
    //目录的右键菜单
    ipcMain.on('openDirectory', (event, position, fileInfo) => {
        const menu = Menu.buildFromTemplate([
            {
                label: '查看目录',
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
    //->showDirectory.js
    ipcMain.on('openFile', (event, position, fileInfo) => {
        let menu;
        if(fileInfo.type === "txt-file") {
                menu = Menu.buildFromTemplate([
                    {
                        label: '打开文件',
                        submenu: [
                            {
                                label: '在编辑器打开',
                                click: () => {

                                    // 调用函数读取文件时使用
                                    readFileWithStream(fileInfo,(err, data) => {
                                        if (err) {
                                            console.error(`读取文件失败: ${err.message}`);
                                        } else {
                                            window.webContents.send(`txt-file`, fileInfo, data);// ->editFile.js
                                        }
                                    });
                                }
                            },
                            {
                                label: '以默认方式打开',
                                click: () => {
                                    shell.openPath(fileInfo.path);
                                }
                            },
                            {
                                label: '查看文件位置',
                                click: () => {
                                    shell.showItemInFolder(fileInfo.path);
                                }
                            }
                        ]

                    },
                    {type: 'separator'},
                    {
                        label: '删除文件',
                        click: () => {
                            console.log('删除');
                            fs.rm(fileInfo.path, {recursive: true, force: true}, (err) => {
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
        }else if (fileInfo.type === "hkx-file"){
            menu = Menu.buildFromTemplate([
                {
                    label: '打开文件',
                    submenu: [
                        {
                            label: '在编辑器打开',
                            click: () => {

                                let hkxName = fileInfo.name
                                let annoName = `${hkxName}.txt`
                                let txtPath = path.resolve(path.dirname(fileInfo.path), annoName);
                                let hkxPath = fileInfo.path;



                                hkx_to_txt(txtPath, hkxPath, callback = (error, stdout, stderr) => {
                                    let fileInfo = {
                                        name: hkxName,
                                        type: "hkx-file",
                                        path: txtPath,
                                        sourcePath: hkxPath,
                                    }
                                    if (stdout){
                                        readFileWithStream(fileInfo, (err, data)=>{
                                            if (data){
                                                console.log(data)
                                                window.webContents.send(`hkx-file`, fileInfo, data);// ->editFile.js
                                            }
                                        })
                                    }
                                })


                            }
                        },
                        {
                            label: '打开文件位置',
                            click: () => {
                                shell.showItemInFolder(fileInfo.path);
                            }
                        }
                    ]

                },
                {type: 'separator'},
                {
                    label: '删除文件',
                    click: () => {
                        console.log('删除');
                        fs.rm(fileInfo.path, {recursive: true, force: true}, (err) => {
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
        }

        // 在指定位置显示菜单
        menu.popup(window, { x: position.x, y: position.y });
    });
}

module.exports = {buildContextMenuOf}

//读取数据流函数
function readFileWithStream(fileInfo, callback) {
    const stream = fs.createReadStream(fileInfo.path, { encoding: 'utf8' });
    let data = '';

    stream.on('data', (chunk) => {
        data += chunk; // 累加读取的块
    });

    stream.on('end', () => {
        callback(null, data); // 读取结束时调用回调
    });

    stream.on('error', (err) => {
        callback(err, null); // 出错时调用回调
    });
}

function hkx_to_txt(txtPath, hkxPath, callback = () => {}) {
    const command = `hkanno64 dump -o "${txtPath}" "${hkxPath}"`;
    exec(command, { cwd: '../hkanno64' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`hkx执行错误: ${error.message}`);
            return callback(error, null, null); // 调用回调并传递错误
        }
        if (stderr) {
            console.error(`hkx标准错误: ${stderr}`);
            return callback(null, null, stderr); //调回调并传递标准错误
        }
        console.log(`hkx标准输出: ${stdout}`);
        callback(null, stdout, null); // 调用回调并传递标准输出
    });
}