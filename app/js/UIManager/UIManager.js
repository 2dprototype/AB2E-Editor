function UIManager(sceneManager, viewport, canvas, fileExporter){
	this.propertiesMenu = new propertiesMenu(sceneManager, viewport, this);
	this.statusBar = new statusBar(sceneManager, viewport);
	this.toolbar = new toolbar(sceneManager, viewport, this, canvas);
	this.sceneInfo = new SceneInfo(sceneManager);
	this.sceneManager = sceneManager;
	this.viewport = viewport;
	this.fileExporter = fileExporter;
	this._codeEditor = document.getElementById("code-editor")
	this.codeEditor = CodeMirror.fromTextArea(this._codeEditor, {
		mode: 'javascript',
		theme: 'one-dark',
		lineNumbers: true,
		lineWrapping: true,
		extraKeys: { "Ctrl-Space": "autocomplete" },
		hintOptions: { hint: javascriptHint }
	})
	this.codeEditor.setSize("100%", "100%")
	this.codeEditorBG = document.getElementById("code-editor-bg")
	this.canvas = canvas;
	
	this.CTRL_PRESSED = 0;
	this.SHIFT_PRESSED = 0;
	this.ALT_PRESSED = 0;
	this.SPACE_PRESSED = 0;
}


UIManager.prototype.showCodeEditor = function(){
	this.codeEditorBG.style.display = "block"
	this.propertiesMenu.gameviewProperties[6].setAttribute("isDone", "true")
	this.propertiesMenu.gameviewProperties[6].value = "Done"
}

UIManager.prototype.hideCodeEditor = function(){
	this.codeEditorBG.style.display = "none"
	this.propertiesMenu.gameviewProperties[6].setAttribute("isDone", "false")
	this.propertiesMenu.gameviewProperties[6].value = "Edit"
}


UIManager.prototype.onMouseMove = function(e){
	this.propertiesMenu.updateSelectionProperty();
	this.statusBar.update();
}

UIManager.prototype.create_option_menu = function(e){
	var sceneManager = this.sceneManager;
	var viewport = this.viewport;
	
	if(e.which == 3 && Editor.viewport.inputHandler.CTRL_PRESSED){
		viewport.inputHandler.mouseStatus[1] = 0;
		var wx = viewport.inputHandler.pointerWorldPos[2];
		var wy = viewport.inputHandler.pointerWorldPos[3];
		viewport.inputHandler.lastRightMouseClickPos = [wx, wy];
		var arr = [
			{ name : 'Select All', childs : null, onclick : function(){sceneManager.selectAll()} },
			{ name : 'Copy', childs : null, onclick : function(){} },
			{ name : 'Delete', childs : null, onclick : function(){sceneManager.deleteSelectedObjects()} },
			{ name : 'Paste', childs : null, onclick : function(){} },
			// { name : 'Clone Selection', childs : null, onclick : function(){sceneManager.duplicateSelection()} },
			{
				name : "Add Body",
				hidden : !(sceneManager.state == sceneManager.STATE_DEFAULT_MODE || sceneManager.currentState == sceneManager.STATE_DEFAULT_MODE),
				childs : [
					{ onclick : function(){sceneManager.createBody(0, [wx, wy])}, name : "Box" },
					{ onclick : function(){sceneManager.createBody(1, [wx, wy])}, name : "Circle" },
					{ onclick : function(){sceneManager.createBody(2, [wx, wy])}, name : "Polygon" },
					{ onclick : function(){sceneManager.createBody(3, [wx, wy])}, name : "Chain" },
					{ onclick : function(){sceneManager.createBody(5, [wx, wy])}, name : "Edge" }
				]
			},	
			{
				name : "Add Shape",
				hidden : !(sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE || sceneManager.currentState == sceneManager.STATE_BODY_EDIT_MODE),
				childs : [
					{ onclick : function(){sceneManager.createShape(0, [wx, wy])}, name : "Box" },
					{ onclick : function(){sceneManager.createShape(1, [wx, wy])}, name : "Circle" },
					{ onclick : function(){sceneManager.createShape(2, [wx, wy])}, name : "Polygon" },
					{ onclick : function(){sceneManager.createShape(3, [wx, wy])}, name : "Chain" },
					{ onclick : function(){sceneManager.createShape(5, [wx, wy])}, name : "Edge" }
				]
			},
			{
				name : "Add Joint", 
				hidden : !((sceneManager.selectedBodies.length > 0) && (sceneManager.state == sceneManager.STATE_DEFAULT_MODE)),
				childs : [
					{ onclick : function(){sceneManager.createJoint(2)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Revolute" },
					{ onclick : function(){sceneManager.createJoint(6)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Prismatic" },
					{ onclick : function(){sceneManager.createJoint(0)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Distance" },
					{ onclick : function(){sceneManager.createJoint(4)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Pulley" },
					{ onclick : function(){sceneManager.createJoint(5)}, hidden: !(sceneManager.selectedBodies.length > 1), name : "Gear" },
					{ onclick : function(){sceneManager.createJoint(3)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Wheel" },
					{ onclick : function(){sceneManager.createJoint(1)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Weld" },
					{ onclick : function(){sceneManager.createJoint(9)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Friction" },
					{ onclick : function(){sceneManager.createJoint(7)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Rope" },
					{ onclick : function(){sceneManager.createJoint(8)}, hidden: !(sceneManager.selectedBodies.length > 2), name : "Area" },
					{ onclick : function(){sceneManager.createJoint(11)}, hidden: !(sceneManager.selectedBodies.length == 2), name : "Motor" },
					{ onclick : function(){sceneManager.createJoint(10)}, hidden: !(sceneManager.selectedBodies.length == 1), name : "Mouse" },
				]
			},
			{
				name : "Add Particle", 
				hidden : !(sceneManager.state == sceneManager.STATE_DEFAULT_MODE || sceneManager.currentState == sceneManager.STATE_DEFAULT_MODE),
				childs : [
					{ onclick : function(){sceneManager.createParticle(1, [wx, wy])}, name : "Box" },
					{ onclick : function(){sceneManager.createParticle(0, [wx, wy])}, name : "Circle" },
					{ onclick : function(){sceneManager.createParticle(2, [wx, wy])}, name : "Polygon" }
				]
			},
		]
		// this.alert(`${wx}, ${wy}`)
		var elm = document.getElementById('right-mouse-menu');
		if(elm != null){
			sceneManager.clearSelection();
			sceneManager.state = sceneManager.currentState;
			elm.remove();
		}
		var body = document.querySelector('body');
		var main = document.createElement('div');
		main.setAttribute("id", "right-mouse-menu");
		main.setAttribute("class", "right-click-menu-options");
		main.style.display = "block";
		main.style.left = e.offsetX;
		main.style.top = e.offsetY;
		main.onclick = function(){
			sceneManager.clearSelection();
			sceneManager.state = sceneManager.currentState;
			this.remove();
		}
		for(i = 0; i < arr.length; i++){
			var obj = arr[i];
			if(!obj.hidden){
				if(obj.childs == null){
					var a = document.createElement('a');
					a.setAttribute('href', '#');
					a.setAttribute('class', 'option');
					a.innerText = obj.name;
					if(obj.onclick != null){
					    a.onclick = obj.onclick;
					}
					main.appendChild(a);
				}
				else{
					var div = document.createElement('div');
					div.setAttribute('class', 'right-click-menu');
					{
						var div_0 = document.createElement('div');
						div_0.setAttribute('class', 'option');
						div_0.innerText = obj.name;
						if(obj.onclick != null){
							div_0.onclick = obj.onclick;
						}
						div.appendChild(div_0);
					}
					{
						var div_1 = document.createElement('div');
						div_1.setAttribute('class', 'right-click-menu-options side-menu-options');
						for (var j = 0; j < obj.childs.length; j++){
							var child = obj.childs[j];
							if(!child.hidden){
								var a = document.createElement('a');
								a.setAttribute('class', 'option');
								a.setAttribute('href', '#');
								a.innerText = child.name;
								if(child.onclick != null){
									a.onclick = child.onclick;
								}
								div_1.appendChild(a);							    
							}
							
						}
						div.appendChild(div_1);
					}
					main.appendChild(div);
				} 
			}
		}
		body.appendChild(main);
		sceneManager.currentState = sceneManager.state;
		sceneManager.state = sceneManager.STATE_LOCK_MODE;
		
	}
	else{
		var elm = document.getElementById('right-mouse-menu');
		if(elm != null){
			sceneManager.clearSelection();
			sceneManager.state = sceneManager.currentState;
			elm.remove();
		}
	}
}

UIManager.prototype.onMouseDown = function(e){
	this.propertiesMenu.updateCollisionFilter();
	this.propertiesMenu.updategameviewProperties();
	this.propertiesMenu.updateSceneCollection();
	this.propertiesMenu.updateSelectionProperty();
	this.create_option_menu(e);
}
UIManager.prototype.onMouseUp = function(e){
	this.propertiesMenu.updateCollisionFilter();
	this.propertiesMenu.updategameviewProperties();
	this.propertiesMenu.updateSceneCollection();
	this.propertiesMenu.updateSelectionProperty();
	this.statusBar.update();
}
UIManager.prototype.onKeyDown = function(e){
	var ref = this;
	var keycode = e.which;
	//ctrl, alt, shift, space
	{
		if (e.which == 17) ref.CTRL_PRESSED = 1;
		else if (e.which == 16) ref.SHIFT_PRESSED = 1;
		else if (e.which == 18) ref.ALT_PRESSED = 1;
		else if (e.which == 32) ref.SPACE_PRESSED = 1;
	}
	
	if(ref.CTRL_PRESSED && e.which == 78) ref.newScene();
	else if(ref.CTRL_PRESSED && e.which == 79) ref.loadScene();
	else if(ref.CTRL_PRESSED && ref.SHIFT_PRESSED && e.which == 83) console.log(null);
	else if(ref.CTRL_PRESSED && e.which == 83) ref.saveScene();
	else if(ref.CTRL_PRESSED && e.which == 88) ref.exportScene();
	
	if(ref.SHIFT_PRESSED && ref.ALT_PRESSED && keycode == 86){ //v
		ref.viewport.isHidden = !ref.viewport.isHidden;
		ref.updateLayout();
	}
	else if(ref.SHIFT_PRESSED && ref.ALT_PRESSED && keycode == 66){ //b
		ref.propertiesMenu.isHidden = !ref.propertiesMenu.isHidden;
		ref.updateLayout();
	}
	else if(ref.SHIFT_PRESSED && ref.ALT_PRESSED && keycode == 78){ //n
		ref.statusBar.isHidden = !ref.statusBar.isHidden;
		ref.updateLayout();
	}
	
	this.propertiesMenu.updateSceneCollection();
	this.toolbar.updateModeButtons();	
}
UIManager.prototype.onKeyUp = function(e){
	var ref = this;
	
	//ctrl, alt, shift, space
	{
		if (e.which == 17) ref.CTRL_PRESSED = 0;
		else if (e.which == 16) ref.SHIFT_PRESSED = 0;
		else if (e.which == 18) ref.ALT_PRESSED = 0;
		else if (e.which == 32) ref.SPACE_PRESSED = 0;
	}
	
	this.propertiesMenu.updateSceneCollection();
	this.toolbar.updateModeButtons();
}



UIManager.prototype.updateLayout = function(){
	var toolbar = this.toolbar.element;
	var statusBar = this.statusBar.element;
	var propertiesMenu = this.propertiesMenu.element;
	var canvas = this.canvas;
	var viewport = this.viewport;
	
	if(this.statusBar.isHidden){
		this.statusBar.hide();
		this.toolbar.viewButtons[2].style.color = '#000';
		canvas.height = window.innerHeight - (toolbar.offsetHeight + statusBar.offsetHeight);
		viewport.resetPanning();
		viewport.getRenderer().setStageWidthHeight(canvas.width, canvas.height);
	}
	else{
		this.statusBar.show();
		this.toolbar.viewButtons[2].style.color = '#00f';
		canvas.height = window.innerHeight - (toolbar.offsetHeight + statusBar.offsetHeight);
		viewport.resetPanning();
		viewport.getRenderer().setStageWidthHeight(canvas.width, canvas.height);
	}
	
	if(this.propertiesMenu.isHidden){
		this.propertiesMenu.hide();
		this.toolbar.viewButtons[1].style.color = '#000';
		canvas.width = window.innerWidth;
		viewport.resetPanning();
		viewport.getRenderer().setStageWidthHeight(canvas.width, canvas.height);
	}
	else{
		this.propertiesMenu.show();
		this.toolbar.viewButtons[1].style.color = '#00f';
		canvas.width = window.innerWidth - propertiesMenu.offsetWidth;
		viewport.resetPanning();
		viewport.getRenderer().setStageWidthHeight(canvas.width, canvas.height);
	}
	
	if(viewport.isHidden){
		viewport.hide();
		this.toolbar.viewButtons[0].style.color = '#000';
	    propertiesMenu.style.width = window.innerWidth;
	    // propertiesMenu.style.height = window.innerHeight - (toolbar.offsetHeight + statusBar.offsetHeight);
	    statusBar.style.width = window.innerWidth;
		this.hideCodeEditor()
	}
	else{
		viewport.show();
		this.toolbar.viewButtons[0].style.color = '#00f';
	    propertiesMenu.style.width = '32%';
	    // propertiesMenu.style.height = window.innerHeight - toolbar.offsetHeight;
		canvas.width = window.innerWidth - propertiesMenu.offsetWidth;
		viewport.resetPanning();
		viewport.getRenderer().setStageWidthHeight(canvas.width, canvas.height);
		statusBar.style.width = window.innerWidth - propertiesMenu.offsetWidth;
		// this.showCodeEditor()
	}
	
	this.codeEditorBG.style.height = canvas.height
	this.codeEditorBG.style.width = canvas.width
	this.codeEditorBG.style.top = canvas.offsetTop
	
}

UIManager.prototype.resizeLayout = function(){
	var toolbar = this.toolbar.element;
	var statusBar = this.statusBar.element;
	var propertiesMenu = this.propertiesMenu.element;
	var canvas = this.canvas;
	
	propertiesMenu.style.height = window.innerHeight - toolbar.offsetHeight;
	propertiesMenu.style.top = toolbar.offsetHeight;
	this.propertiesMenu.resizeLayout();
	
	canvas.width = window.innerWidth - propertiesMenu.offsetWidth;
	canvas.height = window.innerHeight - (toolbar.offsetHeight + statusBar.offsetHeight);
	
	statusBar.style.width = window.innerWidth - propertiesMenu.offsetWidth;
}



UIManager.prototype.exportScene = function(){
	var ref = this;
	var sceneManager = this.sceneManager;
	var data = '';
	
	if(Editor.exportedFile.ext == 'json') data = JSON.stringify(sceneManager.exportWorld(false), null, 4);
	else if(Editor.exportedFile.ext == 'xml') data =  toXML(sceneManager.exportWorld(false), null, 4);
	
	if(Editor.exportedFile.path == ''){
		data = JSON.stringify(sceneManager.exportWorld(false), null, 4);
		ref.exportSceneAs(data, 'json');
	}
	else fs.writeFileSync(Editor.exportedFile.path, data);
}


UIManager.prototype.exportSceneAs_ab2e = function(data){
	var ref = this;
	var options = {
		filters : [
			{
				name: 'Exported Scene',
				extensions: [filetype]
			}
		],
		title : 'Exporting AB2E Project File',
		defaultPath: Editor.currentFile.nameonly
	}
	var dialog =  ref.getFilePath(options);
	if(!dialog.canceled){
		var filepath = dialog.filePath;
		if(filepath != Editor.currentFile.path){
			console.log(filepath)
			// fs.writeFileSync(filepath, data);
		}
		else{
			ref.alert("You can't export scene in current open file");
		}
	}
}

UIManager.prototype.exportSceneWindow = function(filetype, callback = function(){}){
	var ref = this;
	var options = {
		filters : [
			{
				name: 'Exported Scene',
				extensions: [filetype]
			}
		],
		title : 'AB2E Project File',
		defaultPath: Editor.currentFile.nameonly
	}
	var dialog =  ref.getFilePath(options);
	if(!dialog.canceled){
		var filepath = dialog.filePath;
		if(filepath != Editor.currentFile.path){
			callback(filepath);
		}
		else{
			ref.alert("You can't export scene in current open file");
		}
	}
}

UIManager.prototype.exportSceneAs = function(data, filetype){
	var ref = this;
	var options = {
		filters : [
			{
				name: 'Exported Scene',
				extensions: [filetype]
			}
		],
		title : 'Exporting AB2E Project File',
		defaultPath: Editor.currentFile.nameonly
	}
	var dialog =  ref.getFilePath(options);
	if(!dialog.canceled){
		var filepath = dialog.filePath;
		if(filepath != Editor.currentFile.path){
			console.log(filepath)
			fs.writeFileSync(filepath, data);
			//cloning images
			var __dir = path.dirname(filepath);
			ref.sceneManager.cloneImages(__dir, Editor.currentFile.dir);
			Editor.setExportedFile(filepath, filetype);
		}
		else{
			ref.alert("You can't export scene in current open file");
		}
	}
}


UIManager.prototype.newScene = function(){
	var ref = this;
	var sceneManager = this.sceneManager;
	var response = ref.getConfirmation("Do you want to create new scene?", 'Creating New Scene');
	if(response == 0){
		sceneManager.newScene();
		// ref.sceneInfo.show();
		// ref.sceneInfo.update();
		ref.propertiesMenu.updateSceneCollection();
		ref.propertiesMenu.updateSelectionProperty();
		Editor.resetCurrentFile();
		ref.toolbar.update_favourite_button();
	}
	else if(response == 1){
		console.warn('"Creating New Scene" canceled')
	}
}


UIManager.prototype.saveScene = function(){
	var ref = this;
	var data = ref.sceneManager.getSceneData();
	if(Editor.currentFile.path == '') ref.saveSceneAs(data);
	else fs.writeFileSync(Editor.currentFile.path, JSON.stringify(data, null, 4));
	Editor.on_file_changed();
}



UIManager.prototype.loadScene = function(){
	var ref = this;
	var sceneManager = this.sceneManager;
	var response = ref.getConfirmation("Do you want to load scene?", 'Loading Scene');
	if(response == 0){
		var options = {
			filters : [
				{
					name: 'All Fromats',
					extensions: ['ab2e', 'jsonc', 'json', 'json5', 'yml', 'jsonpack', 'pson', 'cson']
				},
				{ name: 'AB2E Project File', extensions: ['ab2e'] },
				{ name: 'JavaScript Object Notation', extensions: ['json'] },
				{ name: 'JSON5 – JSON for Humans', extensions: ['json5'] },
				{ name: 'JSON Complete', extensions: ['jsonc'] },
				{ name: 'A Compression Algorithm for JSON', extensions: ['jsonpack'] },
				{ name: 'CoffeeScript Object Notation', extensions: ['cson'] },
				{ name: "YAML ain't markup language", extensions: ['yml'] },
				{ name: "Binary Serialization Format for JSON", extensions: ['pson'] }
			],
			title : 'Loading AB2E Project File'
		}
		var file = ref.openFile(options);
		var filepath = file.filePaths[0];
		if(filepath != null){
			var ext = path.extname(filepath);
			if(fs.existsSync(filepath)){
				var scene = null;
				if(ext == '.ab2e') scene = JSON.parse(fs.readFileSync(filepath, 'utf8'));
				else if(ext == '.pson') scene = from_buffer(fs.readFileSync(filepath), ext);
				else scene = parse(fs.readFileSync(filepath, 'utf8'), ext);
				if(scene != null){
					if(ext == '.ab2e') Editor.setCurrentFile(filepath);
					else{
						Editor.resetCurrentFile();
					} 
					sceneManager.newScene();
					sceneManager.loadSceneData(scene);
					Editor.load_config_file();
				}
				ref.propertiesMenu.updateSceneCollection();
				ref.propertiesMenu.updateSelectionProperty();
				ref.toolbar.update_favourite_button();	
				Editor.on_file_changed();
			}
		}
	}
	else if(response == 1){
		console.warn('"Loading Scene" canceled');
	}
	
}

UIManager.prototype.importScene = function(){
	var ref = this;
	var sceneManager = this.sceneManager;
	var response = ref.getConfirmation("Do you want to import scene?", 'Loading Scene');
	if(response == 0){
		var options = {
			filters : [{ name: 'Compressed Archive', extensions: ['zip'] }],
			title : 'Importing AB2E Project File'
		}
		var file = ref.openFile(options);
		var filepath = file.filePaths[0];
		if(fs.existsSync(filepath)){
			ref.fileExporter.importAsZip(filepath);
			ref.propertiesMenu.updateSceneCollection();
			ref.propertiesMenu.updateSelectionProperty();
			ref.toolbar.update_favourite_button();	
		}
	}
	else if(response == 1){
		console.warn('"Loading Scene" canceled');
	}
	
}

UIManager.prototype.saveSceneAs = function(data){
	var ref = this;
	var options = {
		filters : [
			{ name: 'AB2E Project File', extensions: ['ab2e'] },
			{ name: 'JavaScript Object Notation', extensions: ['json'] },
			{ name: 'JSON5 – JSON for Humans', extensions: ['json5'] },
			{ name: 'JSON Complete', extensions: ['jsonc'] },
			{ name: 'A Compression Algorithm for JSON', extensions: ['jsonpack'] },
			{ name: 'CoffeeScript Object Notation', extensions: ['cson'] },
			{ name: "YAML ain't markup language", extensions: ['yml'] },
			{ name: "Binary Serialization Format for JSON", extensions: ['pson'] }
		],
		title : 'Saving AB2E Project File',
		defaultPath: Editor.currentFile.nameonly
	}
	var dialog =  ref.getFilePath(options);
	if(!dialog.canceled){
		var filepath = dialog.filePath;
		var ext = path.extname(filepath);
		if(ext == '.ab2e'){
			fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
		}
		else if(ext == '.pson'){
			fs.writeFileSync(filepath, to_buffer(data, ext));
		}
		else{
			fs.writeFileSync(filepath, stringify(data, ext));
		}
		var olddir = Editor.currentFile.dir;
		if(ext == '.ab2e') Editor.setCurrentFile(filepath);
		else Editor.resetCurrentFile();
		ref.sceneManager.cloneImages(Editor.currentFile.dir, olddir);
		
	}
	Editor.on_file_changed();
}


UIManager.prototype.init = function(){
	var sceneManager = this.sceneManager;
	var ref = this;
	this.propertiesMenu.init();
	this.toolbar.init();
	
	this.resizeLayout();
	this.viewport.resetPanning();
	this.viewport.getRenderer().setStageWidthHeight(this.canvas.width, this.canvas.height);
	this.viewport.resetView();
	this.toolbar.updateModeButtons();
	
	//canvas
	this.canvas.ondragover = function(e){
		e.preventDefault();
		var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
		var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
		
		var inputHandler = ref.viewport.inputHandler;
		inputHandler.mouseStatus[0] = 1;
		
		inputHandler.pointerWorldPos[2] = ref.viewport.navigator.screenPointToWorld(eoffsetX, eoffsetY)[0];
		inputHandler.pointerWorldPos[3] = ref.viewport.navigator.screenPointToWorld(eoffsetX, eoffsetY)[1];
		
		ref.statusBar.update();
	}
	
	function isImageFile(ext){
		if(ext.toLocaleLowerCase() == '.png') return true
		else if(ext.toLocaleLowerCase() == '.jpg') return true
		else if(ext.toLocaleLowerCase() == '.jpeg') return true
		else if(ext.toLocaleLowerCase() == '.bmp') return true
		else if(ext.toLocaleLowerCase() == '.svg') return true
		// else if(ext.toLocaleLowerCase() == '.ico') return true
		else if(ext.toLocaleLowerCase() == '.gif') return true
		else return false
	}
	
	//drag n drop
	this.canvas.ondrop = function(e){
		var dir = Editor.currentFile.dir;
		var x = parseInt(ref.viewport.inputHandler.pointerWorldPos[2]);
		var y = parseInt(ref.viewport.inputHandler.pointerWorldPos[3]);
		
		
		if(e.dataTransfer.getData('send-body-index')){
			var index = parseInt(e.dataTransfer.getData('send-body-index'));
			var body = sceneManager.bodies[index].clone();
			body.setPosition(x, y);
			sceneManager.addBody(body)
		}
		else if(e.dataTransfer.getData('send-particle-index')){
			var index = parseInt(e.dataTransfer.getData('send-particle-index'));
			var p = sceneManager.particles[index].clone();
			p.setPosition(x, y);
			sceneManager.addParticle(p);
		}
		else if(dir != ''){
			if(e.dataTransfer && e.dataTransfer.files.length != 0){
				var files = e.dataTransfer.files;
				for(i = 0; i < files.length; i++){
					var ext = path.parse(path.basename(files[i].path)).ext;
					if((isImageFile(ext))){
						var src = '';
						if(path.dirname(files[i].path) == dir){
							src = path.basename(files[i].path);
							sceneManager.dropSprite(x, y, src, dir);
						}
						else if(fs.existsSync(dir + '\\' + path.basename(files[i].path))){
							src = path.parse(files[i].path).name + '_' + randomString(5) + path.parse(files[i].path).ext;
							fs.copyFileSync(files[i].path, dir + '\\' + src);
							sceneManager.dropSprite(x, y, src, dir);
						}
						else{
							src = path.basename(files[i].path);
							fs.copyFileSync(files[i].path, dir + '\\' + src);
							sceneManager.dropSprite(x, y, src, dir);
						}
					}
					else{
						ref.alert(`This file(${ext}) isn't an image file.`);
					}
				}
			}
			else{
				ref.alert(`Doesn't support drag and drop.`);
			}
		}
		else{
			ref.alert(`Save current scene first.`);
		}
		
		ref.propertiesMenu.updateSceneCollection();
		ref.propertiesMenu.updateSelectionProperty();
		sceneManager.clearSelection();
	}
	
	
	
	//section_property -> head buttons
	{
		var _buttons = document.getElementById('section-property-head').querySelectorAll(".key");
		var _elms = [];
		_elms.push(document.getElementById('object-property'));
		_elms.push(document.getElementById('collision-filter'));
		_elms.push(document.getElementById('world-property'));
		_elms.push(document.getElementById('objects-list'));
		_elms.push(document.getElementById('settings-property'));
		var f = [0, 1, 2, 3, 4];
		
		function _hideOrShow(m){
			_buttons[m].onclick = function(){
				_elms[m].style.display = "block";
				this.style.backgroundColor = "#ffffff20";
				ref.propertiesMenu.focus = f[m];
				for(i = 0; i < _buttons.length;i++){
					if(i != m){ 
						_elms[i].style.display = "none";
						_buttons[i].style.backgroundColor = "transparent";
					}
				}
				ref.propertiesMenu.updateSelectionProperty();
				ref.propertiesMenu.updateCollisionFilter();
				ref.propertiesMenu.updategameviewProperties();
				ref.propertiesMenu.updateSceneCollection();
				ref.propertiesMenu.updateSettingsProperties();
			};
		}
		for(i = 0; i < _buttons.length; i++){
			_hideOrShow(i);
		}
		
		
		_elms[0].style.display = "block";
		_elms[1].style.display = "none";
		_elms[2].style.display = "none";
		_elms[3].style.display = "none";
		_elms[4].style.display = "none";
		_buttons[0].style.backgroundColor = "#ffffff20";
	}
	
	//section-property -> body -> buttons
	{
		var buttons = document.getElementById('object-property-head').querySelectorAll(".key");
		var elms = [];
		elms.push(document.getElementById('sprite-properties-head'));
		elms.push(document.getElementById('body-properties-head'));
		elms.push(document.getElementById('joint-properties-head'));
		elms.push(document.getElementById('particle-properties-head'));
		
		function hideOrShow(m){
			buttons[m].onclick = function(){
				elms[m].style.display = "block";
				buttons[m].style.backgroundColor = "#ffffff20";
				for(i = 0; i <buttons.length;i++){
					if(i != m){ 
						elms[i].style.display = "none";
						buttons[i].style.backgroundColor = "transparent";
					}
				}
			};
		}
		for(i = 0; i < buttons.length; i++){
			hideOrShow(i)
		}
		
		elms[0].style.display = "block";
		elms[1].style.display = "none";
		elms[2].style.display = "none";
		buttons[0].style.backgroundColor = "#ffffff20";
	}
	
}


UIManager.prototype.checkFileSaved = function(){
	if(Editor.currentFile.path != ""){
		var data = fs.readFileSync(Editor.currentFile.path, 'utf8');
		return data == this.stringify(this.sceneManager.getSceneData(), null, 4);
	}
	else{
		return false
	}
}

UIManager.prototype.openFile = function(options = {}){
	return ipcRenderer.sendSync('openFile-message', options);
}

UIManager.prototype.getFilePath = function(options = {}){
	return ipcRenderer.sendSync('getFilePath-message', options);
}

UIManager.prototype.getConfirmation = function(message, title){
	return ipcRenderer.sendSync('confirmation-message', { message : message, title : title });
}

UIManager.prototype._getConfirmation = function(options = {}){
	return ipcRenderer.sendSync('confirmation-message', options);
}

UIManager.prototype.alert = function(message){
	return ipcRenderer.sendSync('alert-message', message);
}

