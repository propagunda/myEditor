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
        editArea.value = data;
        editArea.addEventListener(`input`, (event)=>{
            let value = event.target.value;
            ipcRenderer.send(`saveFile`, fileInfo, value);//-> ipc.js
        })

        let viewArea = document.createElement(`textarea`)
        viewArea.classList.add(`viewArea`);
        viewArea.value = data;
        viewArea.setAttribute('readonly', true)

        edit_view.insertAdjacentElement(`beforeend`, editArea);
        edit_view.insertAdjacentElement(`beforeend`, viewArea);
        this.tabContent.insertAdjacentElement(`beforeend`, edit_view);
        ipcRenderer.send(`watchFile`, fileInfo);//-> ipc.js
        this.initialise();
        li.click()
    }

    removeTab(event) {
        event.stopPropagation();
        let index = event.currentTarget.parentNode.index;
        let fileInfo = {
            name: this.lists[index].dataset.name,
            type: this.lists[index].dataset.type,
            path: this.lists[index].dataset.path,
            sourcePath: this.lists[index].dataset.sourcePath ?? null
        }

        let value = this.edit_views[index].querySelector('.editArea').value;

        this.edit_views[index].remove();
        this.lists[index].remove();

        ipcRenderer.send(`closeFile`, fileInfo, value);//-> ipc.js
        //关闭标签页时保存

        if (this.lists[index]?.classList.contains("tabSelected")) {
            this.lists[index--]?.click();
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
}


