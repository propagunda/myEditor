import {Tab} from './tab.js';

let tabFrameEdit = new Tab(`#tabFrameEdit`);

ipcRenderer.on('txt-file', (event, fileInfo, data) => {
    console.log(fileInfo)
    console.log(data)
    tabFrameEdit.pushTab(fileInfo, data)
})

