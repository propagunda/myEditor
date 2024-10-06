const {electron, app, BrowserWindow, ipcMain, dialog, Menu, shell} = require('electron');
const constants = require("node:constants");
const { fs, path } = {
    fs: require('fs'),
    path: require('path')
};


module.exports = {ipcDetector}


function ipcDetector(window) {
    ipcMain.handle('getChildPath', async (directory) => {
        return 1;
})

    ipcMain.on(`saveFile`, async (event, fileInfo, data) => {
        function writeFileWithStream(fileInfo, data){
            const stream = fs.createWriteStream(fileInfo.path, { encoding: 'utf8' });

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

        writeFileWithStream(fileInfo, data);
    })

    ipcMain.on(`watchFile`, async (event, fileInfo)=>{
        // 监听文件变化
        let timeoutId;

        fs.watch(fileInfo.path, (watchEvent, filename) => {
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
    });
}
