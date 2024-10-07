const {electron, app, BrowserWindow, ipcMain, dialog, Menu, shell} = require('electron');
const constants = require("node:constants");
const {exec} = require("child_process");
const {fs, path} = {
    fs: require('fs'),
    path: require('path')
};


module.exports = {ipcDetector}


function ipcDetector(window, watchers) {


    ipcMain.on('refreshDirectory', () => {
        window.webContents.send('refreshDirectory');
    });

    ipcMain.on('saveFile', async (event, fileInfo, data) => {
        await writeFileWithStream(fileInfo, data);
    });

    ipcMain.on('closeFile', async (event, fileInfo, data) => {
            await writeFileWithStream(fileInfo, data);
            if (fileInfo.type === "hkx-file") {
                await handleHkxFile(fileInfo);
            }
    });

    ipcMain.on('closeAllFiles', async (event, fileInfo, data) => {
        await writeFileWithStream(fileInfo, data);
        if (fileInfo.type === "hkx-file") {
            await handleHkxFile(fileInfo);
        }
        stopWatching(fileInfo, watchers);
    });

    ipcMain.on('watchFile', async (event, fileInfo, status) => {
        if (status) {
            if (watchers[fileInfo.path]) return; // 确保只有一个监听器用于每个文件

            const watcher = fs.watch(fileInfo.path, (watchEvent) => {
                if (watchEvent === 'change') {
                    handleFileChange(fileInfo, window); // 传入窗口对象
                }
            });

            // 保存 watcher 对象
            watchers[fileInfo.path] = watcher;
        } else {
            // 如果状态为 false，清除对该文件的监视
            stopWatching(fileInfo, watchers);
        }
    });
}

async function writeFileWithStream(fileInfo, data) {
    try {
        await fs.writeFile(fileInfo.path, data, 'utf8',()=>{});
        console.log('Finished writing the file.');
    } catch (error) {
        console.error('Error writing file:', error);
        throw error; // Re-throw the error after logging it
    }
}

async function handleHkxFile(fileInfo) {
    const { path: txtPath, sourcePath: hkxPath } = fileInfo;
    await txt_to_hkx(txtPath, hkxPath);
    await fs.promises.rm(txtPath, { recursive: true, force: true });
    console.log(`Successfully deleted ${txtPath}`);
}

function stopWatching(fileInfo, watchers) {
    if (watchers[fileInfo.path]) {
        watchers[fileInfo.path].close(); // 关闭监视器
        delete watchers[fileInfo.path]; // 从 watchers 中移除
        console.log(`Stopped watching file: ${fileInfo.path}`);
    }
}

function handleFileChange(fileInfo, window) {

    setTimeout(() => {
        fs.readFile(fileInfo.path, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
            window.webContents.send('refreshEV', fileInfo, data);
        });
    }, 300); // 300毫秒的延迟
}

function txt_to_hkx(txtPath, hkxPath) {
    return new Promise((resolve, reject) => {
        const command = `hkanno64 update -i "${txtPath}" "${hkxPath}"`;
        exec(command, { cwd: '../hkanno64' }, (error, stdout, stderr) => {
            if (error) {
                console.error(`txt2hkx error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`txt2hkx standard error: ${stderr}`);
                return resolve(stderr);
            }
            console.log(`txt2hkx standard output: ${stdout}`);
            resolve(stdout);
        });
    });
}