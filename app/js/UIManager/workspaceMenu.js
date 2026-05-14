function workspaceMenu(sceneManager, viewport, UIManager) {
    this.sceneManager = sceneManager;
    this.viewport = viewport;
    this.UIManager = UIManager;
    this.element = document.getElementById('workspace-menu');
    this.treeElement = document.getElementById('workspace-tree');
    this.isHidden = true;
    this.workspaceRoot = '';
    
    var ref = this;
    
    this.init = function() {
        this.update();
    };

    this.show = function() {
        this.element.style.display = 'block';
        this.isHidden = false;
        this.update();
    };

    this.hide = function() {
        this.element.style.display = 'none';
        this.isHidden = true;
    };

    this.setWorkspaceRoot = function(dirPath) {
        this.workspaceRoot = dirPath;
        this.update();
    };

    this.update = function() {
        if (this.workspaceRoot) {
            this.renderTree(this.workspaceRoot, this.treeElement);
        } else {
            this.treeElement.innerHTML = '<div class="no-workspace">No folder opened</div>';
        }
    };

    this.renderTree = function(dirPath, parentElement) {
        parentElement.innerHTML = '';
        try {
            var files = fs.readdirSync(dirPath);
            var dirs = [];
            var regularFiles = [];

            files.forEach(file => {
                var fullPath = path.join(dirPath, file);
                var stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    dirs.push({ name: file, path: fullPath });
                } else {
                    regularFiles.push({ name: file, path: fullPath });
                }
            });

            dirs.sort((a, b) => a.name.localeCompare(b.name));
            regularFiles.sort((a, b) => a.name.localeCompare(b.name));

            dirs.forEach(dir => {
                var item = this.createDirItem(dir);
                parentElement.appendChild(item);
            });

            regularFiles.forEach(file => {
                var item = this.createFileItem(file);
                parentElement.appendChild(item);
            });
        } catch (e) {
            console.error("Failed to read directory", e);
        }
    };

    this.createDirItem = function(dir) {
        var div = document.createElement('div');
        div.className = 'tree-item directory collapsed';
        
        var head = document.createElement('div');
        head.className = 'tree-item-head';
        head.innerHTML = `<i class="bi bi-folder-fill icon"></i> <span class="name">${dir.name}</span>`;
        
        var content = document.createElement('div');
        content.className = 'tree-item-content';
        content.style.display = 'none';
        
        head.onclick = (e) => {
            e.stopPropagation();
            if (div.classList.contains('collapsed')) {
                div.classList.remove('collapsed');
                div.classList.add('expanded');
                content.style.display = 'block';
                head.querySelector('.icon').className = 'bi bi-folder2-open icon';
                this.renderTree(dir.path, content);
            } else {
                div.classList.remove('expanded');
                div.classList.add('collapsed');
                content.style.display = 'none';
                head.querySelector('.icon').className = 'bi bi-folder-fill icon';
            }
        };
        
        div.appendChild(head);
        div.appendChild(content);
        return div;
    };

    this.createFileItem = function(file) {
        var div = document.createElement('div');
        div.className = 'tree-item file';
        var ext = path.extname(file.name).toLowerCase();
        var iconClass = 'bi bi-file-earmark-text';
        
        if (ext === '.ab2e') iconClass = 'bi bi-file-earmark-play-fill';
        else if (ext === '.js') iconClass = 'bi bi-filetype-js';
        else if (ext === '.json') iconClass = 'bi bi-filetype-json';
        else if (ext === '.css') iconClass = 'bi bi-filetype-css';
        else if (ext === '.html') iconClass = 'bi bi-filetype-html';
        else if (['.png', '.jpg', '.jpeg', '.svg'].includes(ext)) iconClass = 'bi bi-file-earmark-image';
        
        div.innerHTML = `<i class="${iconClass} icon"></i> <span class="name">${file.name}</span>`;
        
        div.onclick = (e) => {
            e.stopPropagation();
            this.openFile(file.path);
        };
        
        return div;
    };

    this.openFile = function(filePath) {
        Editor.openFileInTab(filePath);
    };
}
