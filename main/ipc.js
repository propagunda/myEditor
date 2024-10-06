const {electron, app, BrowserWindow, ipcMain, dialog, Menu, shell} = require('electron');
const constants = require("node:constants");
const {exec} = require("child_process");
const {fs, path} = {
    fs: require('fs'),
    path: require('path')
};


module.exports = {ipcDetector}


function ipcDetector(window) {
    ipcMain.handle('getChildPath', async (directory) => {
        return 1;
    })

    let watchers = {}; // 用于存储文件监视器

    ipcMain.on('saveFile', async (event, fileInfo, data) => {
        // 写入文件
        writeFileWithStream(fileInfo, data);
    });

    ipcMain.on('closeFile', async (event, fileInfo, data) => {
        // 写入文件
        writeFileWithStream(fileInfo, data);

        // 停止对文件的监视
        if (watchers[fileInfo.path]) {
            watchers[fileInfo.path].close(); // 关闭监视器
            delete watchers[fileInfo.path]; // 从 watchers 中移除
            console.log(`Stopped watching file: ${fileInfo.path}`);
        }

        if (fileInfo.type === "hkx-file") {
            let hkxName = fileInfo.name
            let annoName = `${hkxName}.txt`
            let txtPath = fileInfo.path;
            let hkxPath = fileInfo.sourcePath

            //向.hkx写入数据
            txt_to_hkx(txtPath, hkxPath, (error, stdout, stderr)=>{
                if (stdout){
                    fs.rm(txtPath, {recursive: true, force: true}, (err) => {
                        if (err) {
                            console.error(`Error deleting directory: ${err}`);
                        }
                    });
                }
            })

        }
    });

    ipcMain.on('watchFile', async (event, fileInfo) => {
        // 监听文件变化
        let timeoutId;

        // 确保只有一个监听器用于每个文件
        if (watchers[fileInfo.path]) {
            return;
        }

        const watcher = fs.watch(fileInfo.path, (watchEvent, filename) => {
            if (watchEvent === 'change') {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    // 读取文件内容
                    fs.readFile(fileInfo.path, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }
                        window.webContents.send('txt-file', fileInfo, data);
                    });
                }, 300); // 300毫秒的延迟，可根据需要调整
            }
        });

        // 保存 watcher 对象
        watchers[fileInfo.path] = watcher;
    });
}

function writeFileWithStream(fileInfo, data) {
    const stream = fs.createWriteStream(fileInfo.path, {encoding: 'utf8'});
    stream.on('error', (error) => {
        console.error(error);
    });
    // 写入数据的块
    stream.write(data);
    // 结束流
    stream.end(() => {
        console.log('Finished writing the file.');
    });
};

function txt_to_hkx(txtPath, hkxPath, callback = () => {}) {
    const command = `hkanno64 update -i "${txtPath}" "${hkxPath}"`;
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