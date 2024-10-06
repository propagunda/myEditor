const {electron, app, ipcRenderer, contextBridge} = require('electron');

const { path, require} = {
    path: require(`path`),
    require: require(`require`),
};

const root = path.dirname(__dirname);

contextBridge.exposeInMainWorld('mainAPI', {
    ipcRenderer:
        {
            on: (channel, listener) => ipcRenderer.on(channel, listener),//监听 channel, 当新消息到达，将通过 listener(event, args...) 调用 listener

            off: (channel, listener) => ipcRenderer.off(channel, listener),//为特定的 channel 从监听队列中删除特定的 listener

            once: (channel, listener) => ipcRenderer.once(channel, listener),//添加一次性 listener 函数。 这个 listener 只会在 channel下一次收到消息的时候被调用，之后这个listener会被移除。

            addListener: (channel, listener) => ipcRenderer.addListener(channel, listener),//别名on

            removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),//别名off

            removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),//移除所有的监听器，当指定 channel 时只移除与其相关的所有监听器。

            send: (channel, ...args) => ipcRenderer.send(channel, ...args),//通过channel向主进程发送异步消息，可以发送任意参数。

            invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),//通过 channel 向主过程发送消息，并异步等待结果。

            sendSync: (channel, ...args) => ipcRenderer.sendSync(channel, ...args),//通过 channel 向主过程发送消息，并同步等待结果。

            postMessage: (channel, message, [transfer]) => ipcRenderer.postMessage(channel, message, [transfer]),//发送消息到主进程，同时可以选择性发送零到多个 MessagePort 对象从渲染进程发送到主进程的MessagePort对象可作为MessagePortMain对象访问触发事件的ports端口属性。

            sendToHost: (channel, ...args) => ipcRenderer.sendToHost(channel, ...args),//就像 ipcRenderer.send，不同的是消息会被发送到 host 页面上的 <webview> 元素，而不是主进程。
        },

    contextBridge,

    app,

    root,

})