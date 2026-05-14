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

var App = function(){
	var ref = this;
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
	this.sceneManager = new SceneManager();
	this.viewport = new Viewport(this.canvas, this.sceneManager);
	this.fileExporter = new fileExporter(this.sceneManager, this);
	this.UIManager = new UIManager(this.sceneManager, this.viewport, this.canvas, this.fileExporter);
	this.UIManager.init();
	this.gameView = null;
	this.init();

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
	});
	window.onbeforeunload = function(){
		fs.writeFileSync('unsaved_scene.json', stringify(ref.sceneManager.getSceneData(), '.json'));
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
	document.title = this.currentFile.path;
};

App.prototype.resetCurrentFile = function(){
	this.currentFile.name = '';
	this.currentFile.path = '';
	this.currentFile.dir = '';
	this.currentFile.nameonly = '';
	this.currentFile.ext = '';
	this.resetExportedFile();
	document.title =  `AB2E Editor ${this.version}`;
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


App.prototype.is_current_file_saved = function(){
	if(this.currentFile.path != '' && fs.existsSync(this.currentFile.path)){
		var old_file = JSON.stringify(JSON.parse(fs.readFileSync(this.currentFile.path, 'utf8')).scene);
		var new_file = JSON.stringify(this.sceneManager.saveScene());
		var old_hash = create_hash_sha1(old_file);
		var new_hash = create_hash_sha1(new_file);
		if(old_hash == new_hash) return true
		else return false	    
	}
	else{
	    return false
	}
}

App.prototype.on_file_changed = function(){
	this.sceneManager.recordHistory();
	if(this.currentFile.path != ''){
		if(this.is_current_file_saved()){
			document.title = this.currentFile.path;
			this.UIManager.toolbar.fileTools[0].style.color = '#ffffff80';
		}
		else{
			document.title =  `${this.currentFile.path}*`;
			this.UIManager.toolbar.fileTools[0].style.color = '#ffffff';
		}	    
	}
	else{
	    this.UIManager.toolbar.fileTools[0].style.color = '#ffffff';
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



