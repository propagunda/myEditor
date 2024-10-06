let dirPaths;

ipcRenderer.on('DirectoryPath', async (event, result) => {
    dirPaths = result;
    await processDirectories(dirPaths)
});

ipcRenderer.on('refreshDirectory', async (event, result)=>{

    await processDirectories(dirPaths)
    console.log("已刷新")
})

async function processDirectories(dirPaths) {
    for (const element of dirPaths) {
        try {
            const pathTree = await getChildDirectories(element);
            showPathTree(pathTree, document.querySelector("#Dir"));

        } catch (error) {
            console.error(`Error processing directory ${element}:`, error);
        }
    }
}



// 显示树结构的函数
function showPathTree(pathTree, parentElement) {
    const existingPathTree = document.querySelector("#Dir").querySelector(".pathTree")
    if (existingPathTree) existingPathTree.remove();

    const treeContainer = document.createElement('div');
    treeContainer.classList.add('pathTree');
    buildPathTree(pathTree, treeContainer);
    parentElement.append(treeContainer);
}

// 递归创建树状结构
function buildPathTree(pathTree, parentElement) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = pathTree.thisObject; // 当前目录名
    summary.dataset.type = pathTree.fileType;
    summary.dataset.path = pathTree.thisObjectPath;

    const fileName = pathTree.thisObject;
    const fileType = pathTree.fileType;
    const filePath = pathTree.thisObjectPath;
    const fileInfo = { name: fileName, type: fileType, path: filePath };

    const handleContextMenu = (event) => {
        event.preventDefault(); // 阻止默认的右键菜单
        const position = { x: event.x, y: event.y }; // 获取右键点击位置
        // 根据文件类型发送不同的请求
        if (fileType === "directory") {
            ipcRenderer.send('openDirectory', position, fileInfo); // 发送请求打开目录
        } else if (fileType === "txt-file") {
            ipcRenderer.send('openFile', position, fileInfo); // 发送请求打开文件
        }
    };

    summary.addEventListener('contextmenu', handleContextMenu);

    details.append(summary);

    pathTree.childObjectTree.forEach(child => {
        if (child) {
            buildPathTree(child, details); // 递归调用
        }
    });

    parentElement.append(details);
}

// 获取子目录的主函数
async function getChildDirectories(directoryPath) {
    try {
        // 定义对象内容
        const childDirectories = await fs.promises.readdir(directoryPath, { withFileTypes: true });

        const thisObject = path.basename(directoryPath);
        const thisObjectPath = directoryPath;
        const childObject = [];
        const childObjectPath = [];
        const rootObject = path.basename(path.dirname(directoryPath));
        const childObjectTree = await Promise.all(childDirectories.map(async (Dirent) => {

            const thisPath = path.join(directoryPath, Dirent.name);

            // 处理目录或文件
            if (Dirent.isDirectory()) {
                childObject.push(Dirent.name);
                childObjectPath.push(thisPath);
                return await getChildDirectories(thisPath); // 递归获取子目录
            } else if (Dirent.isFile()) {
                childObject.push(Dirent.name);
                childObjectPath.push(thisPath);
                return createPathTreeEntry(Dirent.name, thisPath, [], [], "", [], getFileType(thisPath)); // 处理文件
            }
        }));
        const fileType = getFileType(thisObjectPath);

        // 根据对象内容创建路径树对象
        return createPathTreeEntry(thisObject, thisObjectPath, childObject, childObjectPath, rootObject, childObjectTree, fileType);
    } catch (error) {
        throw new Error(`Error reading directory ${directoryPath}: ${error.message}`);
    }
}

// 创建路径树对象
function createPathTreeEntry(thisObject, thisObjectPath, childObject = [], childObjectPath = [], rootObject = "", childObjectTree = [], fileType) {
    return {
        thisObject,
        thisObjectPath,
        childObject,
        childObjectPath,
        rootObject,
        childObjectTree,
        fileType
    };
}

// 检查文件类型
function getFileType(filePath) {
    try {
        const stats = fs.lstatSync(filePath); // 使用同步方法

        // 判断是否为目录
        if (stats.isDirectory()) {
            return 'directory';
        } else {
            // 判断文件扩展名
            const extname = path.extname(filePath);
            if (extname === '.txt') {
                return 'txt-file';
            } else if (extname === '.hkx') {
                return 'hkx-file';
            } else if(extname === '.ico'){
                return 'ico-file';
            } else if(extname === '.svg'){
                return 'svg-file';
            } else if(extname === '.png'){
                return 'png-file';
            } else if(extname === '.jpg'){
                return 'jpg-file';
            } else {
                return undefined; // 其他文件类型没有特定class
            }
        }
    } catch (err) {
        console.error('错误:', err);
        return null; // 处理错误，返回 null
    }
}
