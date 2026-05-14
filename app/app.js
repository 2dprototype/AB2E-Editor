const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const cmd = require('node-cmd');

const { ipcRenderer } = require("electron");
const CoffeeScript = require('coffeescript');
const JSZip = require('jszip');
const ini = require('ini');
const YAML = require('yaml');
const JSON5 = require('json5');
const JSONC = require('json-complete');
const CSON = require('cson')
const jsonpack = require('jsonpack/main')
const toXML = require("to-xml").toXML;
const fromXML = require("from-xml").fromXML;
const PSON = require("pson");

function to_buffer(data, type){
    if(type == '.pson') return new PSON.Encoder().encode(data).buffer;
	else return null
}

function from_buffer(buf, type){
    if(type == '.pson') return new PSON.Decoder().decode(buf);
	else return null
}

function stringify(data, type){
    if(type == '.json') return JSON.stringify(data, null, 4);
    else if(type == '.json5') return JSON5.stringify(data, null, 4);
    else if(type == '.jsonc') return JSONC.encode(data);
    else if(type == '.yml') return YAML.stringify(data, null, 4);
    else if(type == '.ini') return ini.stringify(data);
    else if(type == '.jsonpack') return jsonpack.pack(data);
    else if(type == '.cson') return CSON.stringify(data);
	else return ''
}

function parse(data, type){
    if(type == '.json') return JSON.parse(data);
    else if(type == '.json5') return JSON5.parse(data);
    else if(type == '.jsonc') return JSONC.decode(data);
    else if(type == '.yml') return YAML.parse(data);
    else if(type == '.ini') return ini.parse(data);
    else if(type == '.jsonpack') return jsonpack.unpack(data);
	else if(type == '.cson') return CSON.parse(data);
	else return null
}

var Project = function(app, sceneManager){
	this.app = app;
	this.sceneManager = sceneManager || new SceneManager();
	this.currentFile = {
		path : '',
		name : '',
		dir : '',
		nameonly : '',
		ext : ''
	}
	this.exportedFile = {
		path : '',
		name : '',
		dir : '',
		nameonly : '',
		ext : ''
	}
	this.id = Math.random().toString(36).substr(2, 9);
	this.lastSavedHash = '';
	this.isDirty = false;
}

var App = function(){
	var ref = this;
	
	this.projects = [];
	this.activeProjectIndex = -1;
	this.clipboard = null;

	this.custom_execute = '';
	this.terminal_mode = 'console';
	this.terminal = new terminal('terminal');
	this.terminal.setHeight("80vh");
	this.terminal.setWidth("80vw");
	this.terminal.blinkingCursor(true);
	this.terminal.setInputBackground("#ffffff08");
	this.terminal.hide();
	this.terminal.html.style.top = '10vh';
	this.terminal.html.style.left = '10vw';
	this.terminal.html.style.fontFamily = 'JetBrainsMono-Regular';
	this.terminal.html.style.fontSize = '12px';
	document.body.appendChild(this.terminal.html);
	
	this.canvas = document.getElementById("main-canvas");
	this.viewport = new Viewport(this.canvas, this.sceneManager);
	this.fileExporter = new fileExporter(this.sceneManager, this);
	this.UIManager = new UIManager(this.sceneManager, this.viewport, this.canvas, this.fileExporter);
	this.UIManager.init();
	this.gameView = null;
	this.init();

	// CLI handling
	var args = ipcRenderer.sendSync('get-args');
	this.handleCLIArgs(args);

	ipcRenderer.on('open-file', (event, args) => {
		ref.handleCLIArgs(args);
	});

	// Check for saved session
	if(fs.existsSync('session.json')){
		this.loadSession();
	} else {
		// Initialize with one project if no session
		this.newProject();
	}
}

App.prototype.newProject = function(sceneManager){
	var project = new Project(this, sceneManager);
	project.lastSavedHash = this.getSceneHash(project);
	project.isDirty = false;
	this.projects.push(project);
	this.switchProject(this.projects.length - 1);
	this.updateTabs();
}

App.prototype.switchProject = function(index){
	if(index >= 0 && index < this.projects.length){
		this.activeProjectIndex = index;
		var project = this.projects[index];
		this.sceneManager = project.sceneManager;
		this.currentFile = project.currentFile;
		this.exportedFile = project.exportedFile;
		
		if(this.viewport) {
			this.viewport.sceneManager = this.sceneManager;
			this.viewport.renderer.sceneManager = this.sceneManager;
		}
		if(this.UIManager) {
			this.UIManager.sceneManager = this.sceneManager;
			this.UIManager.propertiesMenu.sceneManager = this.sceneManager;
			this.UIManager.toolbar.sceneManager = this.sceneManager;
			this.UIManager.statusBar.sceneManager = this.sceneManager;
			this.UIManager.sceneInfo.sceneManager = this.sceneManager;
			this.UIManager.updateLayout();
			this.UIManager.propertiesMenu.updateSceneCollection();
			this.UIManager.propertiesMenu.updateSelectionProperty();
			this.UIManager.codeEditor.setValue(this.sceneManager.scripts[0] ? this.sceneManager.scripts[0].raw : '');
		}
		this.updateTitle();
		this.updateTabs();
	}
}

App.prototype.closeProject = function(index){
	var project = this.projects[index];
	if(project.isDirty){
		var name = project.currentFile.name || 'New Scene';
		var response = this.UIManager.getConfirmation(`Do you want to close "${name}"?`, "Unsaved changes will be lost.");
		if(response != 0) return; // 0 is usually 'Yes' or 'OK' in this app's implementation
	}

	if(this.projects.length > 1){
		this.projects.splice(index, 1);
		if(this.activeProjectIndex >= this.projects.length){
			this.activeProjectIndex = this.projects.length - 1;
		}
		this.switchProject(this.activeProjectIndex);
	} else {
		this.projects[0] = new Project(this);
		this.switchProject(0);
	}
	this.updateTabs();
}

App.prototype.updateTabs = function(){
	var tabContainer = document.getElementById('tab-container');
	tabContainer.innerHTML = '';
	var ref = this;
	this.projects.forEach((p, i) => {
		var tab = document.createElement('div');
		tab.className = 'tab' + (i === this.activeProjectIndex ? ' active' : '');
		if(p.isDirty) tab.classList.add('dirty');
		
		var name = p.currentFile.name || 'New Scene';
		var unsavedIndicator = p.isDirty ? '<span class="unsaved-dot">●</span>' : '';
		tab.innerHTML = `<span>${name}${unsavedIndicator}</span><i class="close-tab">×</i>`;
		tab.onclick = (e) => {
			if(e.target.className === 'close-tab'){
				ref.closeProject(i);
			} else {
				ref.switchProject(i);
			}
		};
		tabContainer.appendChild(tab);
	});
	
	// Add button
	var addTab = document.createElement('div');
	addTab.className = 'tab add-tab';
	addTab.innerHTML = '+';
	addTab.onclick = () => ref.newProject();
	tabContainer.appendChild(addTab);
}

App.prototype.handleCLIArgs = function(args){
	if(!args) return;
	for(var i = 0; i < args.length; i++){
		var arg = args[i];
		if(arg === '--export'){
			var input = args[i+1];
			var output = args[i+2];
			if(input && output){
				this.headlessExport(input, output);
				return;
			}
		}
		// Handle file paths (excluding Electron and script paths)
		if(arg.endsWith('.ab2e') || arg.endsWith('.json') || arg.endsWith('.json5') || arg.endsWith('.pson')){
			if(fs.existsSync(arg)){
				this.loadSceneFromFile(arg);
			}
		}
	}
}

App.prototype.loadSceneFromFile = function(filepath){
	var ref = this;
	if(fs.existsSync(filepath)){
		var ext = path.extname(filepath);
		var scene = null;
		if(ext == '.ab2e') scene = JSON.parse(fs.readFileSync(filepath, 'utf8'));
		else if(ext == '.pson') scene = from_buffer(fs.readFileSync(filepath), ext);
		else scene = parse(fs.readFileSync(filepath, 'utf8'), ext);

		if(scene != null){
			// Check if already open
			var existing = this.projects.findIndex(p => p.currentFile.path === filepath);
			if(existing !== -1){
				this.switchProject(existing);
				return;
			}
			
			this.newProject();
			var project = this.projects[this.activeProjectIndex];
			
			if(ext == '.ab2e') this.setCurrentFile(filepath);
			else this.resetCurrentFile();

			this.sceneManager.newScene();
			this.sceneManager.loadSceneData(scene);
			
			// Initialize saved hash
			project.lastSavedHash = this.getSceneHash(project);
			project.isDirty = false;

			this.load_config_file();
			this.UIManager.propertiesMenu.updateSceneCollection();
			this.UIManager.propertiesMenu.updateSelectionProperty();
			this.UIManager.toolbar.update_favourite_button();
			this.on_file_changed();
		}
	}
}

App.prototype.headlessExport = function(input, output){
	var ref = this;
	if(fs.existsSync(input)){
		var ext = path.extname(input);
		var scene = null;
		try {
			if(ext == '.ab2e') scene = JSON.parse(fs.readFileSync(input, 'utf8'));
			else if(ext == '.pson') scene = from_buffer(fs.readFileSync(input), ext);
			else scene = parse(fs.readFileSync(input, 'utf8'), ext);
			
			if(scene){
				var sm = new SceneManager();
				sm.loadSceneData(scene);
				var exported = sm.exportWorld(false);
				fs.writeFileSync(output, JSON.stringify(exported, null, 4));
				console.log(`Exported ${input} to ${output}`);
				ipcRenderer.sendSync('alert-message', `Exported ${input} to ${output}`);
				window.close();
			}
		} catch(e) {
			ipcRenderer.sendSync('alert-message', `Export failed: ${e.message}`);
			window.close();
		}
	}
}



App.prototype.copySelection = function(){
	this.clipboard = this.sceneManager.getSelectionData();
}

App.prototype.paste = function(){
	this.sceneManager.pasteSelectionData(this.clipboard);
	this.UIManager.propertiesMenu.updateSceneCollection();
}

App.prototype.init = function(){
	var ref = this;
	nextln();
	function nextln(){
		ref.terminal.input('$:' + ref.terminal_mode, function (input) {
			if(input == '.clear' || input == '.clr') ref.terminal.clear();
			else if(input == '.console' || input == '.cs') ref.terminal_mode = 'console'
			else if(input == '.cmd') ref.terminal_mode = 'cmd'
			else if(input.length <= 0){}
			else if(ref.terminal_mode == 'cmd'){
				var n_cmd = cmd.runSync(input);
				if(n_cmd.data != null){
					ref.terminal.println(n_cmd.data);
				}
				if(n_cmd.err != null){
					ref.terminal.error(n_cmd.err);
				}
			}
			else if(ref.terminal_mode == 'console'){
				try {
					var e = eval(input);
					var str = JSON.stringify(e, null, 4);
					var h =  hljs.highlight(str, {language: 'json'});
					ref.terminal.println(`<code><pre>${h.value}</pre></code>`);
				}
				catch(err) {
					ref.terminal.error(err.message);
				}
			}
			nextln();
		});
	};
	
	
	// add event listeners to canvas
	var mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel";
	this.canvas.addEventListener(mousewheelevt, function(e){
		ref.viewport.onMouseWheel(e);
	});
	this.canvas.addEventListener("mousedown", function(e){
		e.preventDefault();
		ref.viewport.onMouseDown(e);
		ref.UIManager.onMouseDown(e);
	});
	this.canvas.addEventListener("mousemove", function(e){
		e.preventDefault();
		ref.viewport.onMouseMove(e);
		ref.UIManager.onMouseMove(e);
	});
	this.canvas.addEventListener("mouseup", function(e){
		ref.viewport.onMouseUp(e);
		ref.UIManager.onMouseUp(e);
	});
	this.canvas.addEventListener("mouseleave", function(e){
		ref.viewport.onMouseLeave(e);
	});
	
	var lastElementSelected;

	document.addEventListener("mousedown", function(e){
		lastElementSelected = e.target;
	});

	// key events
	var fired = false;
	
	window.addEventListener("keydown", function(e){
		if(!fired) {
			fired = true;
			if (lastElementSelected == ref.viewport.canvas){
				e.preventDefault(); 
				if(e.which == 32){
					ref.sceneManager.setScript(ref.UIManager.codeEditor.getValue())
					if (ref.gameView){
						ref.gameView = null;
						ref.viewport.getInputHandler().inGameMode = 0;
					}
					else {
						ref.gameView = new GameView(ref.canvas, ref.viewport.getNavigator());
						ref.gameView.setup(ref.sceneManager.exportWorld(false), ref.sceneManager.scripts);
						ref.viewport.getInputHandler().inGameMode = 1;
					}		
					ref.UIManager.toolbar.updateGameplayButtons(ref)
				}

			}
		}
		if(e.which == 116) ref.run_cmd();
		if (lastElementSelected == ref.viewport.canvas) ref.viewport.onKeyDown(e);
		ref.UIManager.onKeyDown(e);
	});
	window.addEventListener("keyup", function(e){
		fired = false;
		if (lastElementSelected == ref.viewport.canvas) ref.viewport.onKeyUp(e);
		ref.UIManager.onKeyUp(e);
	});
	window.addEventListener("resize", function(e){
		ref.UIManager.resizeLayout();
		ref.UIManager.updateLayout();
		ref.viewport.reset();
		ref.viewport.getRenderer().setStageWidthHeight(ref.canvas.width, ref.canvas.height);
	});
	window.addEventListener("load", function(e){
		ref.UIManager.resizeLayout();
		ref.UIManager.updateLayout();
		ref.viewport.reset();
		ref.viewport.getRenderer().setStageWidthHeight(ref.canvas.width, ref.canvas.height);
		ref.viewport.resetView();
		ref.UIManager.toolbar.updateCustomScripts();
		if(ref.UIManager.workspaceMenu) ref.UIManager.workspaceMenu.update();
	});
	window.onbeforeunload = function(){
		ref.saveSession();
		fs.writeFileSync('settings.json', stringify(ref.getSettings(), '.json'));
		ref.make_config_file();
	}
	
	//gameplay
	//start / stop
	this.UIManager.toolbar.gameplayButtons[0].addEventListener("click", function(){
		ref.sceneManager.setScript(ref.UIManager.codeEditor.getValue())
		if (ref.gameView){
			ref.gameView = null;
			ref.viewport.getInputHandler().inGameMode = 0;
		}
		else {
			ref.gameView = new GameView(ref.canvas, ref.viewport.getNavigator());
			ref.gameView.setup(ref.sceneManager.exportWorld(false),  ref.sceneManager.scripts);
			ref.viewport.getInputHandler().inGameMode = 1;
		}
		ref.UIManager.toolbar.updateGameplayButtons(ref)
	});
	//pause
	this.UIManager.toolbar.gameplayButtons[1].addEventListener("click", function(){
		if (ref.gameView != null) {
			ref.gameView.paused = !ref.gameView.paused;
		}
		ref.UIManager.toolbar.updateGameplayButtons(ref)
	});
	//step update
	this.UIManager.toolbar.gameplayButtons[2].addEventListener("click", function(){
		if (ref.gameView != null && ref.gameView.paused)
			ref.gameView.update();
	});
	//love2d
	this.UIManager.toolbar.gameplayButtons[3].onclick = function(){
		var options = {
			filters : [
				{
					name: 'Executable',
					extensions: ['*']
				}
			],
			title : 'Selecting a executable file'
		}
		var file = ref.UIManager.openFile(options);
		var filepath = file.filePaths[0];
		if(fs.existsSync(filepath)){
			ref.custom_execute = filepath;
			ref.run_cmd();
		}
	}
	//run
	this.UIManager.toolbar.gameplayButtons[4].onclick = function(){
		if(ref.terminal.hidden) ref.terminal.show();
		else ref.terminal.hide();
	}
	
	function render() {	
		ref.viewport.draw(ref.gameView);
	};
	
	window.setInterval(render, 1000.0 / 60.0);	
}

App.prototype.run_cmd = function(){
	if(this.custom_execute != ''){
		if(!fs.existsSync(this.custom_execute)){
			fs.writeFileSync(this.custom_execute, 'cd');
		}
		var ncmd = cmd.runSync(`"${this.custom_execute}"`);
		if(ncmd.data != null) this.terminal.println(ncmd.data, "#5cf43680");
		if(ncmd.err != null){
			this.terminal.error(ncmd.err);
			this.terminal.show();
		}	 
	}
	else{
	    this.terminal.error('No target found to execute.');
	    this.terminal.show();
	}
}

App.prototype.setCurrentFile = function(filepath){
	this.currentFile.path = filepath;
	this.currentFile.name = path.basename(filepath);
	this.currentFile.dir = path.dirname(filepath);
	this.currentFile.nameonly = path.parse(path.basename(filepath)).name;
	this.currentFile.ext = path.extname(filepath);
	
	var project = this.projects[this.activeProjectIndex];
	project.lastSavedHash = this.getSceneHash(project);
	project.isDirty = false;
	
	this.updateTitle();
	this.updateTabs();
	if(this.UIManager && this.UIManager.workspaceMenu) {
		this.UIManager.workspaceMenu.update();
	}
};

App.prototype.resetCurrentFile = function(){
	this.currentFile.name = '';
	this.currentFile.path = '';
	this.currentFile.dir = '';
	this.currentFile.nameonly = '';
	this.currentFile.ext = '';
	this.resetExportedFile();
	
	var project = this.projects[this.activeProjectIndex];
	project.lastSavedHash = ''; // Reset saved hash for new files
	project.isDirty = true; // New unsaved file is dirty by default
	
	this.updateTitle();
	this.updateTabs();
	if(this.UIManager && this.UIManager.workspaceMenu) {
		this.UIManager.workspaceMenu.update();
	}
};

App.prototype.setExportedFile = function(filepath, ext = ''){
	this.exportedFile.path = filepath;
	this.exportedFile.name = path.basename(filepath);
	this.exportedFile.dir = path.dirname(filepath);
	this.exportedFile.nameonly = path.parse(path.basename(filepath)).name;
	if(ext != '') this.exportedFile.ext = ext.toLowerCase();
};

App.prototype.resetExportedFile = function(){
	this.exportedFile.name = '';
	this.exportedFile.path = '';
	this.exportedFile.dir = '';
	this.exportedFile.nameonly = '';
	this.exportedFile.ext = '';
};


App.prototype.alert = function(text){
	this.UIManager.alert(text);
}
	
App.prototype.version = "1.0.0"

App.prototype.get_config_data = function(){
	var sceneManager = this.sceneManager;
	var viewport = this.viewport;
	var inputHandler = viewport.inputHandler;
	
	var obj = {
		Editor : {
			version : this.version
		},
		viewport : {
			inputHandler : {
				transformTool : inputHandler.transformTool,
				pivotMode : inputHandler.pivotMode,
				SNAPPING_ENABLED : inputHandler.SNAPPING_ENABLED,
				LOCK_SCALE_ENABLED : inputHandler.LOCK_SCALE_ENABLED
			}
		},
		lastUpdated : new Date().getTime()
	}
	
	return obj
}

App.prototype.make_config_file = function(){
	if(this.currentFile.dir != ''){
		var filename = this.currentFile.nameonly + '.config.ini';
		var filepath = path.join(this.currentFile.dir, filename);
		var data = ini.stringify(this.get_config_data());
		fs.writeFileSync(filepath, data);
	}
}

App.prototype.load_config_file = function(){
	var filename = this.currentFile.nameonly + '.config.ini';
	var filepath = path.join(this.currentFile.dir, filename);
	if(fs.existsSync(filepath)){
		var data = fs.readFileSync(filepath, 'utf8');
		var obj = ini.parse(data);
		this.set_config(obj);
	}
}

App.prototype.set_config = function(obj){
	var sceneManager = this.sceneManager;
	var viewport = this.viewport;
	var inputHandler = viewport.inputHandler;
	var UIManager = this.UIManager;
	
	inputHandler.transformTool = obj.viewport.inputHandler.transformTool;
	inputHandler.pivotMode = obj.viewport.inputHandler.pivotMode;
	inputHandler.SNAPPING_ENABLED = obj.viewport.inputHandler.SNAPPING_ENABLED;
	inputHandler.LOCK_SCALE_ENABLED = obj.viewport.inputHandler.LOCK_SCALE_ENABLED;
	UIManager.toolbar.updateModeButtons();
}

App.prototype.runScript = function(filepath, type = ".js"){
	var ref = this;
	var data;
	
	var file_data = fs.readFileSync(filepath, 'utf8');
	
	if(type == '.js') data = file_data;
	else if(type == '.coffee') data = CoffeeScript.compile(file_data);
	
	try {
	    eval(data);
	}
	catch(err) {
		var err_msg = err.toString();
		ref.terminal.error(filepath);
		ref.terminal.error(err_msg);
		ref.terminal.show();
	}
};
App.prototype.stableStringify = function(obj){
	var allKeys = [];
	JSON.stringify(obj, function(key, value) {
		allKeys.push(key);
		return value;
	});
	allKeys.sort();
	return JSON.stringify(obj, allKeys);
}

App.prototype.getSceneHash = function(project){
	var sceneData = project.sceneManager.saveScene();
	return create_hash_sha1(this.stableStringify(sceneData));
}

App.prototype.updateTitle = function(){
	var project = this.projects[this.activeProjectIndex];
	if(!project) return;
	
	var title = '';
	if(project.currentFile.path != ''){
		title = project.currentFile.path;
	}
	else{
		title = `New Scene - AB2E Editor ${this.version}`;
	}
	
	if(project.isDirty){
		title += '*';
	}
	
	document.title = title;
}

App.prototype.is_current_file_saved = function(){
	var project = this.projects[this.activeProjectIndex];
	if(project.currentFile.path != '' && fs.existsSync(project.currentFile.path)){
		var currentHash = this.getSceneHash(project);
		if(project.lastSavedHash == currentHash) return true
		else return false	    
	}
	else{
	    return false
	}
}

App.prototype.on_file_changed = function(){
	var project = this.projects[this.activeProjectIndex];
	if(!project) return;
	
	var currentHash = this.getSceneHash(project);
	if(project.currentFile.path != '' && project.lastSavedHash == currentHash){
		project.isDirty = false;
	}
	else{
		project.isDirty = true;
	}
	
	this.updateTitle();
	this.updateTabs();
	
	if(this.UIManager && this.UIManager.toolbar){
		this.UIManager.toolbar.fileTools[0].style.color = project.isDirty ? '#ffffff' : '#ffffff80';
	}
}

App.prototype.saveSession = function(){
	var session = {
		activeProjectIndex: this.activeProjectIndex,
		projects: []
	};
	
	if(!fs.existsSync('temp')) fs.mkdirSync('temp');
	
	this.projects.forEach((p, i) => {
		var pData = {
			path: p.currentFile.path,
			isDirty: p.isDirty,
			id: p.id
		};
		
		// Always save the data to temp to be safe
		var tempData = p.sceneManager.getSceneData();
		fs.writeFileSync(path.join('temp', `project_${p.id}.json`), JSON.stringify(tempData, null, 4));
		
		session.projects.push(pData);
	});
	
	fs.writeFileSync('session.json', JSON.stringify(session, null, 4));
}

App.prototype.loadSession = function(){
	try {
		if(!fs.existsSync('session.json')) return;
		var session = JSON.parse(fs.readFileSync('session.json', 'utf8'));
		this.projects = [];
		
		var activeTempFiles = [];
		
		session.projects.forEach((pData, i) => {
			var sm = new SceneManager();
			var tempPath = path.join('temp', `project_${pData.id}.json`);
			activeTempFiles.push(`project_${pData.id}.json`);
			
			if(fs.existsSync(tempPath)){
				var data = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
				sm.loadSceneData(data);
			} else if(pData.path && fs.existsSync(pData.path)){
				var data = JSON.parse(fs.readFileSync(pData.path, 'utf8'));
				sm.loadSceneData(data);
			}
			
			var project = new Project(this, sm);
			project.id = pData.id;
			project.currentFile.path = pData.path;
			if(pData.path){
				project.currentFile.name = path.basename(pData.path);
				project.currentFile.dir = path.dirname(pData.path);
				project.currentFile.nameonly = path.parse(path.basename(pData.path)).name;
				project.currentFile.ext = path.extname(pData.path);
			}
			
			this.projects.push(project);
			
			// Recalculate hash after loading
			project.lastSavedHash = this.getSceneHash(project);
			project.isDirty = pData.isDirty;
		});
		
		// Cleanup old temp files
		if(fs.existsSync('temp')){
			var files = fs.readdirSync('temp');
			files.forEach(file => {
				if(!activeTempFiles.includes(file)){
					try { fs.unlinkSync(path.join('temp', file)); } catch(e){}
				}
			});
		}
		
		this.switchProject(session.activeProjectIndex || 0);
	} catch(e) {
		console.error("Failed to load session", e);
		this.newProject();
	}
}


App.prototype.setSettings = function(obj){
	this.UIManager.propertiesMenu.isHidden = obj.UIManager.propertiesMenu.isHidden;
	this.UIManager.statusBar.isHidden = obj.UIManager.statusBar.isHidden;
	this.viewport.isHidden = obj.viewport.isHidden;
	this.viewport.renderer.bodyCenter = obj.viewport.renderer.bodyCenter;
	this.viewport.renderer.backgroundColor = obj.viewport.renderer.backgroundColor;
	this.viewport.renderer.gridColor = obj.viewport.renderer.gridColor;
	this.viewport.renderer.showGrid = obj.viewport.renderer.showGrid;
	this.viewport.renderer.DEBUG = obj.viewport.renderer.DEBUG;
	
	this.viewport.navigator.cell_size = obj.viewport.navigator.cell_size;
	this.viewport.navigator.range = obj.viewport.navigator.range;
	this.custom_execute = obj.custom_execute;
}

App.prototype.getSettings = function(){
	var obj = {
		version : this.version,
		recentFilePath : this.currentFile.path,
		lastModified : new Date().getTime(),
		UIManager : {
			propertiesMenu : {
				isHidden : this.UIManager.propertiesMenu.isHidden
			},
			statusBar : {
				isHidden : this.UIManager.statusBar.isHidden
			}
		},
		viewport : {
			isHidden : this.viewport.isHidden,
			renderer : {
				bodyCenter: this.viewport.renderer.bodyCenter,
				backgroundColor: this.viewport.renderer.backgroundColor,
				gridColor: this.viewport.renderer.gridColor,
				showGrid: this.viewport.renderer.showGrid,
				DEBUG: this.viewport.renderer.DEBUG
			},
			navigator : {
				cell_size : this.viewport.navigator.cell_size,
				range : this.viewport.navigator.range,
			}
		},
		custom_execute : this.custom_execute
	}
	return obj
};


var Editor = new App();


(function(){
	document.querySelector('body').style.display = 'block';
	
	if(fs.existsSync('settings.json')){
		try {   
			var data = parse(fs.readFileSync('settings.json', 'utf8'), '.json');
			Editor.setSettings(data);
			Editor.UIManager.updateLayout();
			if(fs.existsSync(data.recentFilePath)){
				var lastModified = getTimeDiffAndPrettyText(data.lastModified).friendlyNiceText;
				var response = Editor.UIManager.getConfirmation(`Do you want to load last modified scene?`, `Last modified ${lastModified}`);
				if(response == 0){
					var file = fs.readFileSync(data.recentFilePath, 'utf8');
					var obj = parse(file, '.json')
					Editor.setCurrentFile(data.recentFilePath);
					Editor.sceneManager.newScene();
					Editor.sceneManager.loadSceneData(obj);
					Editor.load_config_file();
					Editor.UIManager.propertiesMenu.updateSceneCollection();
					Editor.UIManager.propertiesMenu.updateSelectionProperty();
					Editor.UIManager.toolbar.update_favourite_button();
				}
				else{
					Editor.sceneManager.newScene();
					Editor.UIManager.toolbar.update_favourite_button();
					console.log('opretion cancelled!');
				}
			}
			else if(fs.existsSync('unsaved_scene.json')){
				var response = Editor.UIManager.getConfirmation("Do you want to load last unsaved scene?", 'Opening Unsaved Scene');
				if(response == 0){
					var file = fs.readFileSync('unsaved_scene.json', 'utf8');
					var obj = parse(file, '.json');
					Editor.sceneManager.newScene();
					Editor.sceneManager.loadSceneData(obj);
					Editor.UIManager.propertiesMenu.updateSceneCollection();
					Editor.UIManager.propertiesMenu.updateSelectionProperty();
					Editor.UIManager.toolbar.update_favourite_button();
				}
				else{
					Editor.sceneManager.newScene();
					console.log('opretion cancelled!');
				}

			}
			else{
				Editor.sceneManager.newScene();
				console.log('file not found :(');
			}
		}
		catch(err) {
		   console.warn(err);
		}
	}
	else{
		Editor.sceneManager.newScene();
	}
	Editor.UIManager.propertiesMenu.updateSettingsProperties();
})();


// var lastCalledTime;
// var fps;

// function requestAnimFrame() {

  // if(!lastCalledTime) {
     // lastCalledTime = Date.now();
     // fps = 0;
     // return;
  // }
  // delta = (Date.now() - lastCalledTime)/1000;
  // lastCalledTime = Date.now();
  // fps = 1/delta;
// } 



