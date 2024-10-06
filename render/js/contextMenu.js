
const HTML = document.querySelector('HTML'); // 替换为你的元素选择器

HTML.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // 阻止默认的右键菜单
    // 获取右键点击位置
    const position = { x: event.x, y: event.y };

    // 发送 IPC 消息以显示上下文菜单
    ipcRenderer.send('show-context-menu', position);
});