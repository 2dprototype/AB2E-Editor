function toolbar(sceneManager, viewport, UIManager, canvas){
	this.sceneManager = sceneManager;
	this.viewport = viewport;
	this.UIManager = UIManager;
	this.canvas = canvas;
    this.element = document.getElementById('toolbar');
	this.addButtons = {
		bodies    : [],
		shapes    : [],
		joints    : [],
		particles : []
	}
	this.editButtons = [];
	this.viewButtons = [];
	this.modeButtons = [];
	this.fileButtons = [];
	this.gameplayButtons = [];
	this.fileTools       = [];
	this.transformTools  = [];
	this.projectTools    = [];
}

toolbar.prototype.init = function(){
	var sceneManager = this.sceneManager;
	var UIManager = this.UIManager;
	var viewport = this.viewport;
	var ref = this;
	
	this.addButtons.bodies = document.getElementById('add_body').querySelectorAll("a");
	this.addButtons.shapes = document.getElementById('add_shape').querySelectorAll("a");
	this.addButtons.joints = document.getElementById('add_joint').querySelectorAll("a");
	this.addButtons.particles = document.getElementById('add_particle').querySelectorAll("a");
	
	this.gameplayButtons = document.getElementById('gameplay-tools').querySelectorAll("button");
	this.modeButtons = document.getElementById('mode-buttons').querySelectorAll("a");
	this.viewButtons = document.getElementById('viewButtons').querySelectorAll("a");
	this.fileTools = document.getElementById('file-tools').querySelectorAll("button");
	this.transformTools = document.getElementById('transform-tools').querySelectorAll("button");
	this.projectTools = document.getElementById('project-tools').querySelectorAll("button");
	
	
	//copy the file path
	this.fileTools[0].onclick = function(){
		ref.UIManager.saveScene();
	}
	//export as json
	this.fileTools[1].onclick = function(){
		var data = JSON.stringify(ref.sceneManager.exportWorld(false), null, 4);
		if(Editor.exportedFile.path == '' || Editor.exportedFile.ext != 'json') ref.UIManager.exportSceneAs(data, 'json');
		else fs.writeFileSync(Editor.exportedFile.path, data);
	}
	
	//export as xml
	this.fileTools[2].onclick = function(){
		var data = toXML(ref.sceneManager.exportWorld(false), null, 4);
		if(Editor.exportedFile.path == '' || Editor.exportedFile.ext != 'xml') ref.UIManager.exportSceneAs(data, 'xml');
		else fs.writeFileSync(Editor.exportedFile.path, data);
	}
	
	//fav
	this.projectTools[0].onclick = function(){
		ref.sceneManager.info.favourite = !ref.sceneManager.info.favourite;
		ref.update_favourite_button();
	}
	
	this.update_favourite_button = function(){
	    if(ref.sceneManager.info.favourite) ref.projectTools[0].style.color = '#f43662';
		else ref.projectTools[0].style.color = '#ffffff80';
	}
	
	//info
	this.projectTools[1].onclick = function(){
	    if(ref.UIManager.sceneInfo.isHidden){
			UIManager.sceneInfo.show();
			UIManager.sceneInfo.update();
		}
		else{
			UIManager.sceneInfo.hide();
			UIManager.sceneInfo.clear();
		}
	}
	
	//export json as blob
	this.fileTools[3].onclick = function(){
		var json = JSON.stringify(ref.sceneManager.exportWorld(), null, 4);
		var h_json = hljs.highlight(json, {language: 'json'}).value;
		var html = `
		<html>
		<head>
			<title></title>
			<link rel="stylesheet" href="default.min.css">
			<style>
pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#24292e;background:#fff}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:700}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:700}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}
			</style>
		</head>
		<body>
			<pre><code class="json">${h_json}</code></pre>
		</body>
		</html>
		`;
		var data = new Blob([html], {type: 'text/html'});
		var textFile = window.URL.createObjectURL(data);
		window.open(textFile);
	}
	
	//translate
	this.transformTools[0].onclick = function(){
		ref.viewport.inputHandler.activateTranslationTool();
		ref.updateModeButtons();
	}
	
	//rotate
	this.transformTools[1].onclick = function(){
		ref.viewport.inputHandler.activateRotationTool();
		ref.updateModeButtons();
	}

	//scale
	this.transformTools[2].onclick = function(){
		ref.viewport.inputHandler.activateScaleTool();
		ref.updateModeButtons();
	}
	
	//lock
	this.transformTools[3].onclick = function(){
		ref.viewport.inputHandler.activateLockMode();
		ref.updateModeButtons();
	}
	
	// view > buttons
	//display propertiesMenu
	this.viewButtons[0].onclick = function(){
		ref.UIManager.propertiesMenu.isHidden = !ref.UIManager.propertiesMenu.isHidden;
		ref.UIManager.updateLayout();
	}
	//display workspaceMenu
	this.viewButtons[1].onclick = function(){
		ref.UIManager.workspaceMenu.isHidden = !ref.UIManager.workspaceMenu.isHidden;
		ref.UIManager.updateLayout();
	}
	//display StatusBar
	this.viewButtons[2].onclick = function(){
		ref.UIManager.statusBar.isHidden = !ref.UIManager.statusBar.isHidden;
		ref.UIManager.updateLayout();
	}	
	//zoom in
	this.viewButtons[3].onclick = function(){
		ref.viewport.zoomIn();
	}
	//zoom out
	this.viewButtons[4].onclick = function(){
		ref.viewport.zoomOut();
	}
	//reset view
	this.viewButtons[5].onclick = function(){
		ref.viewport.resetView();
	}
	
	
	//edit > run-script
	this.editButtons = document.getElementById('edit-buttons').querySelectorAll(".button");
	
	//update Scripts
	this.editButtons[0].onclick = function(){
		ref.updateCustomScripts();
	}
	//duplicateSelection
	this.editButtons[1].onclick = function(){
		ref.sceneManager.duplicateSelection();
	}
	//delete
	this.editButtons[2].onclick = function(){
		ref.sceneManager.deleteSelectedObjects();
	}
	//mode buttons
	//local 
	this.modeButtons[0].onclick = function(){
		Editor.viewport.inputHandler.activateLocalPivotMode();
		ref.updateModeButtons();
	}
	//selection
	this.modeButtons[1].onclick = function(){
		Editor.viewport.inputHandler.activateSelectionPivotMode();
		ref.updateModeButtons();
	}
	//scale
	this.modeButtons[2].onclick = function(){
		Editor.viewport.inputHandler.activateScaleTool();
		ref.updateModeButtons();
	}
	//rotation
	this.modeButtons[3].onclick = function(){
		Editor.viewport.inputHandler.activateRotationTool();
		ref.updateModeButtons();
	}
	//translate
	this.modeButtons[4].onclick = function(){
		Editor.viewport.inputHandler.activateTranslationTool();
		ref.updateModeButtons();
	}

	//lock scale
	this.modeButtons[5].onclick = function(){
		ref.viewport.inputHandler.LOCK_SCALE_ENABLED = !ref.viewport.inputHandler.LOCK_SCALE_ENABLED;
		ref.updateModeButtons();
	}
	//snapping
	this.modeButtons[6].onclick = function(){
		ref.viewport.inputHandler.SNAPPING_ENABLED = !ref.viewport.inputHandler.SNAPPING_ENABLED;
		ref.updateModeButtons();
	}
	
	//J Key
	this.modeButtons[7].onclick = function(){
		ref.viewport.inputHandler.J_KEY_PRESSED = !ref.viewport.inputHandler.J_KEY_PRESSED;
	}
	//B Key
	this.modeButtons[8].onclick = function(){
		ref.viewport.inputHandler.B_KEY_PRESSED = !ref.viewport.inputHandler.B_KEY_PRESSED; 
	}
	//P Key
	this.modeButtons[9].onclick = function(){
		ref.viewport.inputHandler.P_KEY_PRESSED = !ref.viewport.inputHandler.P_KEY_PRESSED; 
	}

	var element = this.addButtons.bodies;
	for(i = 0; i < element.length; i++){
		element[i].onclick = function(){
			ref.sceneManager.createBody(parseInt(this.getAttribute('value')));
			ref.UIManager.propertiesMenu.updateSceneCollection();
		}
	}
	
	var element = this.addButtons.shapes;
	for(i = 0; i < element.length; i++){
		element[i].onclick = function(){
			ref.sceneManager.createShape(parseInt(this.getAttribute('value')));
			ref.UIManager.propertiesMenu.updateSceneCollection();
		}
	}
	var element = this.addButtons.joints;
	for(i = 0; i < element.length; i++){
		element[i].onclick = function(){
			ref.sceneManager.createJoint(parseInt(this.getAttribute('value')));
			ref.UIManager.propertiesMenu.updateSceneCollection();
		}
	}
	var element = this.addButtons.particles;
	for(i = 0; i < element.length; i++){
		element[i].onclick = function(){
			ref.sceneManager.createParticle(parseInt(this.getAttribute('value')));
			ref.UIManager.propertiesMenu.updateSceneCollection();
		}
	}
	
	//files
	this.fileButtons = document.getElementById('fileButtons').querySelectorAll("a");
	
	//new scene
	this.fileButtons[0].onclick = function(){
		ref.UIManager.newScene();
	}
	//load scene
	this.fileButtons[1].onclick = function(){
	    ref.UIManager.loadScene();
	}
	//open folder
	this.fileButtons[2].onclick = function(){
		ref.UIManager.openFolder();
	}
	//save
	this.fileButtons[3].onclick = function(){
		ref.UIManager.saveScene();
	}
	//save as
	this.fileButtons[4].onclick = function(){
		var data = ref.sceneManager.getSceneData();
		ref.UIManager.saveSceneAs(data);
	}
	//import
	this.fileButtons[5].onclick = function(){
		ref.UIManager.importScene();
	}
	//exprot
	this.fileButtons[6].onclick = function(){
		ref.UIManager.exportScene();
	}
	//exprot as json 
	this.fileButtons[7].onclick = function(){
		var data = JSON.stringify(ref.sceneManager.exportWorld(false), null, 4);
		ref.UIManager.exportSceneAs(data, 'json');
	}
	//exprot as xml
	this.fileButtons[8].onclick = function(){
		var data = toXML(ref.sceneManager.exportWorld(false), null, 4);
		ref.UIManager.exportSceneAs(data, 'xml');
	}
	//exprot as json & trim image
	this.fileButtons[9].onclick = function(){
		var data = JSON.stringify(ref.sceneManager.exportWorld(true), null, 4);
		ref.UIManager.exportSceneAs(data, 'json');
	}
	//exprot as ._ab2e
	this.fileButtons[10].onclick = function(){
		ref.UIManager.exportSceneWindow('_ab2e', function(filepath){
		    ref.UIManager.fileExporter.exportAs_ab2e(filepath);
		})
	}
	//exprot as .zip
	this.fileButtons[11].onclick = function(){
		ref.UIManager.exportSceneWindow('zip', function(filepath){
		    ref.UIManager.fileExporter.saveAsZip(filepath);
		})
	}
	//reload scene
	this.fileButtons[12].onclick = function(){
		var response = ref.UIManager.getConfirmation("Do you wants to reload scene?", 'Loading Scene');
		if(response == 0){
			if(Editor.currentFile.path != ''){
				var filepath = Editor.currentFile.path;
				if(filepath){
					var file = fs.readFileSync(filepath, 'utf8');
					var jsondata = JSON.parse(file);
					ref.sceneManager.newScene();
					ref.sceneManager.loadSceneData(jsondata);
				}
			}
			else{
				ref.UIManager.alert("Current scene isn't saved");
			}
		}
	}
}

toolbar.prototype.updateGameplayButtons = function(_Editor){
	if (_Editor.gameView == null) {
		this.gameplayButtons[0].style.color = "#d7dae0"
		this.gameplayButtons[1].style.color = "#d7dae0"
	} 
	else {
		if(_Editor.gameView.paused) {
			this.gameplayButtons[0].style.color = "#d7dae0"
			this.gameplayButtons[1].style.color = "#2196f3"
		} 
		else {
			this.gameplayButtons[0].style.color = "#2196f3"
			this.gameplayButtons[1].style.color = "#d7dae0"
		}
	}
}


toolbar.prototype.hide = function(){
	this.element.style.display = 'none';
}

toolbar.prototype.show = function(){
	this.element.style.display = 'block';
}

toolbar.prototype.updateCustomScripts = function(){
	if(!fs.existsSync('scripts/')) fs.mkdirSync('scripts/');
	fs.readdir('scripts/', function(err, files){
		var element = document.getElementById('run-script');
		element.innerHTML = '';
		files.forEach(function(file){
			var ext = path.extname(file).toLowerCase();
			if(ext == '.js' || ext == '.coffee'){
				var a = document.createElement('a');
				a.innerText = file;
				a.setAttribute('class', 'option');
				a.value = file;
				a.onclick = function(){
					Editor.runScript('scripts/' + this.value, ext);
				}
				element.appendChild(a);
			}
		});
	});
}

toolbar.prototype.updateModeButtons = function(){
	var inputHandler = this.viewport.inputHandler;
	for(i = 0; i < 5; i++){
		var cond1 = inputHandler.pivotMode == parseInt(this.modeButtons[i].getAttribute('data'));
		var cond2 = inputHandler.transformTool == parseInt(this.modeButtons[i].getAttribute('data'));
		if(cond1 || cond2){
			this.modeButtons[i].style.color = '#00f';
		}
		else{
			this.modeButtons[i].style.color = '#000';
		}
	}
	
	for (var i = 0; i < this.transformTools.length; i++){
	    if(inputHandler.transformTool == this.transformTools[i].getAttribute('data')){
		    this.transformTools[i].style.color = '#2196f3';
		}
		else{
		    this.transformTools[i].style.color = '#ffffff80';
		}
	}
	
	if(inputHandler.SNAPPING_ENABLED) this.modeButtons[6].style.color = '#00f';
	else this.modeButtons[6].style.color = '#000';
	
	if(inputHandler.LOCK_SCALE_ENABLED) this.modeButtons[5].style.color = '#00f';
	else this.modeButtons[5].style.color = '#000';
}
