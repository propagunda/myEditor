export class Tab {
    constructor(id) {
        this.main = document.querySelector(id);
        this.ul = this.main.querySelector('ul');
        this.tabContent = this.main.querySelector('.tabContent');
        this.tabPush = this.main.querySelector('#tabPush');

        this.tabPush.addEventListener('click', () => this.pushTab_old());
        this.initialise();
    }

    updateNodes() {
        this.lists = this.main.querySelectorAll('li');
        this.edit_views = this.main.querySelectorAll('.edit_view');
        this.removeTabs = this.main.querySelectorAll('.removeTab');
        this.spans = this.main.querySelectorAll('.tabContainer>ul>li>span:first-child');
    }


    initialise() {
        this.updateNodes();
        for (let i = 0; i < this.lists.length; i++) {
            this.lists[i].index = i;
            this.lists[i].removeEventListener("click", this.toggleTab.bind(this));
            this.lists[i].addEventListener("click", this.toggleTab.bind(this));
            this.removeTabs[i].removeEventListener("click", this.removeTab.bind(this));
            this.removeTabs[i].addEventListener("click", this.removeTab.bind(this));
            this.spans[i].ondblclick = this.editTab
        }
    }

    toggleTab(event) {
        event.stopPropagation();
        for (let li of this.lists) {
            if (li.classList.contains("tabSelected")) {
                li.classList.remove("tabSelected");
            }
        }

        event.currentTarget.classList.add("tabSelected");

        const index = event.currentTarget.index;
        for (let edit_view of this.edit_views) {
            edit_view.classList.remove("tabSelected");
        }
        this.edit_views[index].classList.add("tabSelected");
    }

    pushTab_old() {
        let li = `<li><span>new Tab</span><i class="removeTab"></i></li>`;
        this.ul.insertAdjacentHTML(`beforeend`, li);
        let edit_view = `<div class="edit_view">new Content</div>`;
        this.tabContent.insertAdjacentHTML(`beforeend`, edit_view);
        this.initialise();
    }

    pushTab(fileInfo, data) {

        let existingTabs = this.ul.children;
        for (let li of existingTabs) {
            if (li.dataset.path === fileInfo.path) {
                let index = li.index;
                this.edit_views[index].remove();
                this.lists[index].remove();
                if (this.lists[index]?.classList.contains("tabSelected")) {
                    this.lists[index--]?.click();
                }
            }
        }
//检查标签对应文件是否重复

        let li = document.createElement('li');

        li.dataset.name = fileInfo.name;
        li.dataset.type = fileInfo.type;
        li.dataset.path = fileInfo.path;
        if (fileInfo.sourcePath){
            li.dataset.sourcePath = fileInfo.sourcePath;
        }


        let span = document.createElement('span');
        span.textContent = fileInfo.name;

        let icon = document.createElement('i');
        icon.classList.add('removeTab');

        li.insertAdjacentElement(`beforeend`, span);
        li.insertAdjacentElement(`beforeend`, icon);
        this.ul.insertAdjacentElement('beforeend', li);


        let edit_view = document.createElement(`div`)
        edit_view.classList.add(`edit_view`);

        let editArea = document.createElement(`textarea`)
        editArea.classList.add(`editArea`);
        editArea.setAttribute('spellcheck', false)
        editArea.value = data;
        editArea.addEventListener(`input`, (event)=>{
            let value = event.target.value;
            ipcRenderer.send(`saveFile`, fileInfo, value);//-> ipc.js
        })

        let viewArea = document.createElement(`textarea`)
        viewArea.classList.add(`viewArea`);
        viewArea.value = data;
        viewArea.setAttribute('spellcheck', false)
        viewArea.setAttribute('readonly', true)

        edit_view.insertAdjacentElement(`beforeend`, editArea);
        edit_view.insertAdjacentElement(`beforeend`, viewArea);
        this.tabContent.insertAdjacentElement(`beforeend`, edit_view);
        ipcRenderer.send(`watchFile`, fileInfo, true);//-> ipc.js
        this.initialise();
        li.click()
        editArea.focus()
    }

    removeTab(event) {
        event.stopPropagation();
        let li = event.currentTarget.parentNode;
        this.closeFile(li, 'closeFile');

        // 处理标签页选中状态
        if (li.classList.contains("tabSelected")) {
            this.lists[li.index - 1]?.click();
        }
    }

    removeAllTabs() {
        for (let li of this.lists) {
            this.closeFile(li, 'closeAllFiles');
        }
    }

    editTab(event) {
        let target = event.currentTarget;

        // 记录原始内容
        const originalContent = target.innerHTML.trim();
        target.innerHTML = `<input type="text" value="${originalContent}" size="${originalContent.length}">`;

        let input = target.querySelector('input');

        // 选中输入框的内容
        input.select();

        // 调整输入框大小
        input.oninput = function() {
            this.size = this.value.length || 1; // 设定输入框的大小
        };

        input.onblur = function() {
            target.innerHTML = this.value || originalContent; // 失去焦点时保存
        };

        input.onkeyup = function(event) {
            if (event.key === 'Enter') {
                target.innerHTML = this.value || originalContent; // 按 Enter 键保存
            } else if (event.key === 'Escape') {
                target.innerHTML = originalContent; // 按 ESC 键取消编辑
            }
        };

        // 让输入框具有焦点
        input.focus();
    }


    closeFile(li, channel) {
        let index = li.index;
        let fileInfo = {
            name: this.lists[index].dataset.name,
            type: this.lists[index].dataset.type,
            path: this.lists[index].dataset.path,
            sourcePath: this.lists[index].dataset.sourcePath ?? null
        };

        let value = this.edit_views[index].querySelector('.editArea').value;

        // 移除视图和标签
        this.edit_views[index].remove();
        this.lists[index].remove();

        // 发送 IPC 消息
        ipcRenderer.send(channel, fileInfo, value);

        // 仅在关闭单个文件时发送 watchFile
        if (channel === 'closeFile') {
            ipcRenderer.send('watchFile', fileInfo, false);
        }
    }
}


