function settingsMenu(app) {
    this.app = app;
    this.element = document.getElementById('settings-dialog');
    this.isHidden = true;

    this.init = function() {
        var ref = this;
        document.getElementById('close-settings').onclick = function() {
            ref.hide();
        };
        document.getElementById('save-settings').onclick = function() {
            ref.save();
            ref.hide();
        };
        document.getElementById('reset-settings').onclick = function() {
            ref.reset();
        };
        
        // Populate settings
        this.loadCurrentSettings();
    };

    this.show = function() {
        this.element.style.display = 'block';
        this.isHidden = false;
        this.loadCurrentSettings();
    };

    this.hide = function() {
        this.element.style.display = 'none';
        this.isHidden = true;
    };

    this.loadCurrentSettings = function() {
        var editor = this.app.UIManager.codeEditor;
        document.getElementById('setting-theme').value = editor.getOption('theme');
        document.getElementById('setting-fontsize').value = parseInt(editor.getWrapperElement().style.fontSize) || 12;
        document.getElementById('setting-linenumbers').checked = editor.getOption('lineNumbers');
        document.getElementById('setting-wrapping').checked = editor.getOption('lineWrapping');
    };

    this.save = function() {
        var theme = document.getElementById('setting-theme').value;
        var fontSize = document.getElementById('setting-fontsize').value;
        var lineNumbers = document.getElementById('setting-linenumbers').checked;
        var wrapping = document.getElementById('setting-wrapping').checked;

        var editor = this.app.UIManager.codeEditor;
        editor.setOption('theme', theme);
        editor.setOption('lineNumbers', lineNumbers);
        editor.setOption('lineWrapping', wrapping);
        editor.getWrapperElement().style.fontSize = fontSize + 'px';
        editor.refresh();
        
        // Save to app settings for persistence
        var settings = this.app.getSettings();
        settings.codeEditor = {
            theme: theme,
            fontSize: fontSize,
            lineNumbers: lineNumbers,
            lineWrapping: wrapping
        };
        fs.writeFileSync('settings.json', JSON.stringify(settings, null, 4));
    };

    this.reset = function() {
        document.getElementById('setting-theme').value = 'one-dark';
        document.getElementById('setting-fontsize').value = 12;
        document.getElementById('setting-linenumbers').checked = true;
        document.getElementById('setting-wrapping').checked = true;
    };
}
