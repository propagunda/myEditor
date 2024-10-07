import {Tab} from './tab.js';

let tabFrameEdit = new Tab(`#tabFrameEdit`);

//->contextMenu.js
ipcRenderer.on('txt-file', (event, fileInfo, data) => {
    tabFrameEdit.pushTab(fileInfo, data)
    console.log(processString(data))
})

//->contextMenu.js
ipcRenderer.on('hkx-file', (event, fileInfo, data) => {
    tabFrameEdit.pushTab(fileInfo, data)
    console.log('hkx-file')
})

//->ipc.js
ipcRenderer.on('refreshEV', (event, fileInfo, data) => {
    tabFrameEdit.pushTab(fileInfo, data)
    console.log('refreshEV')
})

//->main.js
ipcRenderer.on('closeAllTabs', () => {
    console.log('closeAllTabs')
    tabFrameEdit.removeAllTabs()
    ipcRenderer.send('refreshDir_onclose')//->ipc.js
})


function processString(inputString) {
    // 正则表达式匹配 animmotion 数据
    const animRegex = /^(\d+\.\d+)\s+(animmotion)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)/;

    const result = {
        meta: [],
        anim: [],
        remaining: []
    };

    const lines = inputString.split('\n');

    lines.forEach(line => {
        const animMatch = animRegex.exec(line);

        if (line.startsWith('#')) {
            // 存储元数据
            result.meta.push(line);
        } else if (animMatch) {
            // 将匹配的 animmotion 数据存入数组
            const timePoint = animMatch[1];
            const name = animMatch[2];
            const x = animMatch[3];
            const y = animMatch[4];
            const z = animMatch[5];

            result.anim.push({ timePoint, name, x, y, z });
        } else if (line.trim() !== '') {
            // 其余未处理的数据
            result.remaining.push(line);
        }
    });

    return result;
}