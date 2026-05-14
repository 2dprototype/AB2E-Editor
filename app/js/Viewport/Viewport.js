function Viewport(canvas, sceneManager){
	this.canvas = canvas;
	this.context = canvas.getContext("2d");
	this.navigator = new Navigator();
	this.navigator.panning[0] += canvas.width / 2;			// move origin-x to center of viewport (canvas)
	this.navigator.panning[1] += canvas.height / 2;			// move origin-y to center of viewport (canvas)
	this.inputHandler = new InputHandler();
	this.renderer = new Renderer(this.context, sceneManager);
	this.renderer.setStageWidthHeight(canvas.width, canvas.height);
	this.sceneManager = sceneManager;
	this.gameView;
	this.isHidden = false;
	// prevent default right click behaviour
	this.canvas.addEventListener("contextmenu", function(e){
		e.preventDefault();
	});
}


Viewport.prototype.hide = function(){
	this.canvas.style.display = 'none';
	this.isHidden = true;
}

Viewport.prototype.show = function(){
	this.canvas.style.display = 'block';
	this.isHidden = false;
}

Viewport.prototype.onKeyDown = function(e){
	var inpH = this.inputHandler;
	var nav = this.navigator;
	var sceneManager = this.sceneManager;
	
	//ctrl, alt, shift, space
	{
		if (e.which == 17) inpH.CTRL_PRESSED = 1;
		else if (e.which == 16) inpH.SHIFT_PRESSED = 1;
		else if (e.which == 18) inpH.ALT_PRESSED = 1;
		else if (e.which == 32) inpH.SPACE_PRESSED = 1;
	}
	
	
	var scale = 10 / nav.scale;
	
	//when (shift, ctrl, alt, space) key is pressed, this code will not work
	if(!inpH.SHIFT_PRESSED && !inpH.CTRL_PRESSED && !inpH.ALT_PRESSED && !inpH.SPACE_PRESSED){
		//arrow keys
		{
			if (e.which == 38) nav.panning[1] += scale;			              //up
			else if (e.which == 40) nav.panning[1] += -scale;	 			  //down
			else if (e.which == 39) nav.panning[0] += -scale;	 			  //right
			else if (e.which == 37) nav.panning[0] += scale;	 			  //left
		}
		//page up/ down
		{
			if (e.which == 33) this.zoomIn(); //up
			else if (e.which == 34) this.zoomOut(); //down
		}
	}
	
	//when shift key is pressed
	else if(inpH.SHIFT_PRESSED){
		//set position of selection arrow_keys(up, down, right, left)
		{
			if (e.which == 38) sceneManager.setPositionOfSelectedObjects(0, -scale, 1, inpH, nav);
			else if (e.which == 40) sceneManager.setPositionOfSelectedObjects(0, scale, 1, inpH, nav);
			else if (e.which == 39) sceneManager.setPositionOfSelectedObjects(scale, 0, 1, inpH, nav);
			else if (e.which == 37) sceneManager.setPositionOfSelectedObjects(-scale, 0, 1, inpH, nav);
		}
		//set scale of selection page (up / down)
		{
			if (e.which == 33) sceneManager.setScaleOfSelectedObjects(2, 2, 1, inpH, nav);
			else if (e.which == 34) sceneManager.setScaleOfSelectedObjects(0.5, 0.5, 1, inpH, nav);
		}
	}
	else if(inpH.CTRL_PRESSED){
		//set rotation of selection arrow_keys(right, left)
		{
			if (e.which == 39) sceneManager.setRotationOfSelectedObjects(10, 1, inpH, nav);
			else if (e.which == 37) sceneManager.setRotationOfSelectedObjects(-10, 1, inpH, nav);
		}
	}
		
	//zoom in and zoom out on key(+,-)
	if (e.which == 187) this.zoomIn();
	else if (e.which == 189) this.zoomOut();
	else if (e.which == 48) this.resetView();
	
	// change body type 'shift + t'
	if (e.which == 84 && inpH.SHIFT_PRESSED){
		for(i = 0; i < sceneManager.selectedBodies.length; i++){
			t = sceneManager.selectedBodies[i].bodyType;
				 if(t == 0) sceneManager.selectedBodies[i].bodyType = 1;
			else if(t == 1) sceneManager.selectedBodies[i].bodyType = 2;
			else if(t == 2) sceneManager.selectedBodies[i].bodyType = 0;
		}
	}
	
	//redo history
	if(inpH.CTRL_PRESSED && e.which == 89) sceneManager.history.redo();
	//undo history
	if(inpH.CTRL_PRESSED && e.which == 90) sceneManager.history.undo();
	
	// return if in game mode
	if (this.inputHandler.inGameMode) return;
	
	else if (e.which == 66) this.inputHandler.B_KEY_PRESSED = true; // mask joint
	else if (e.which == 74) this.inputHandler.J_KEY_PRESSED = true; // mask body
	else if (e.which == 80) this.inputHandler.P_KEY_PRESSED = true; // mask particle
};

Viewport.prototype.onKeyUp = function(e){
	//ctrl, alt, shift
	if (e.which == 17){
		this.inputHandler.CTRL_PRESSED = 0;
	}
	else if (e.which == 16){
		this.inputHandler.SHIFT_PRESSED = 0;
	}
	else if (e.which == 18){
		this.inputHandler.ALT_PRESSED = 0;
	}
	else if (e.which == 32){
		this.inputHandler.SPACE_PRESSED = 0;
	}
	// return if in game mode
	if (this.inputHandler.inGameMode)
		return;

	else if (e.which == 46){		// delete selected object
		this.sceneManager.deleteSelectedObjects();
	}

	else if (e.which == 66){		// unmask joints
		this.inputHandler.B_KEY_PRESSED = false;
	}
	else if (e.which == 74){		// unmask body
		this.inputHandler.J_KEY_PRESSED = false;
	}
	else if (e.which == 80){		// unmask particle
		this.inputHandler.P_KEY_PRESSED = false;
	}

	else if (e.which == 70){		// f - key pressed => align view to selection
		if (this.inputHandler.selection[0] instanceof Vertex){
			var pivot = [0, 0];
			for (var i = 0; i < this.inputHandler.selection.length; i++){
				pivot[0] += this.inputHandler.selection[i].x;
				pivot[1] += this.inputHandler.selection[i].y;
			}
			pivot[0] /= Math.max(this.inputHandler.selection.length, 1);
			pivot[1] /= Math.max(this.inputHandler.selection.length, 1);
			this.navigator.panning = 
				[
					this.canvas.width / (this.navigator.scale * 2) - pivot[0] + this.navigator.origin[0],
					this.canvas.height / (this.navigator.scale * 2) - pivot[1] + this.navigator.origin[1],
				];
		}
		else {
			var pivot = [0, 0];
			for (var i = 0; i < this.inputHandler.selection.length; i++){
				pivot[0] += this.inputHandler.selection[i].position[0];
				pivot[1] += this.inputHandler.selection[i].position[1];
			}
			pivot[0] /= Math.max(this.inputHandler.selection.length, 1);
			pivot[1] /= Math.max(this.inputHandler.selection.length, 1);
			this.navigator.panning = 
				[
					this.canvas.width / (this.navigator.scale * 2) - pivot[0] + this.navigator.origin[0],
					this.canvas.height / (this.navigator.scale * 2) - pivot[1] + this.navigator.origin[1],
				];
		}
	}
	// w
	else if (e.which == 87){		// w - key pressed => enable translation tool
		this.inputHandler.activateTranslationTool();
	}
	// e
	else if (e.which == 69){		// e - key pressed => enable rotationtool
		this.inputHandler.activateRotationTool();
	}
	// r
	else if (e.which == 82){		// r - key pressed => enable scale tool
		this.inputHandler.activateScaleTool();
	}
	// shif + d
	else if (e.which == 68 && this.inputHandler.SHIFT_PRESSED){
		this.sceneManager.duplicateSelection();
	}
	// ctrl + v
	else if (e.which == 86 && this.inputHandler.CTRL_PRESSED){
		console.log('ctrl + v')
	}
};

Viewport.prototype.onMouseDown = function(e){
	var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
	var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;

	var inputHandler = this.inputHandler;
	inputHandler.mouseStatus[0] = 1;

	inputHandler.pointerWorldPos[0] = this.navigator.screenPointToWorld(eoffsetX, eoffsetY)[0];
	inputHandler.pointerWorldPos[1] = this.navigator.screenPointToWorld(eoffsetX, eoffsetY)[1];
	
	inputHandler.selectionArea[0] = 0;
	inputHandler.selectionArea[1] = 0;
	inputHandler.selectionArea[2] = 0;
	inputHandler.selectionArea[3] = 0;

	// check whether right button is pressd or not
	if (e.which)
		inputHandler.mouseStatus[1] = (e.which == 3) + 1;
	else if (e.button)
		inputHandler.mouseStatus[1] = (e.button == 2) + 1;

	inputHandler.start = [eoffsetX, eoffsetY];

	if (inputHandler.mouseStatus[1] == InputHandler.IS_RIGHT_MOUSE_BUTTON)
		return;

	// return if in game mode
	if (this.inputHandler.inGameMode)
		return;

	// select bodies
	if (!this.sceneManager.onMouseDown(e, this.inputHandler, this.navigator)){
		inputHandler.selectionArea[0] = eoffsetX;
		inputHandler.selectionArea[1] = eoffsetY;
		inputHandler.selectionArea[4] = 1;
	}

	// selected object goes to inputHandler.selection[]
	else {
		if (this.sceneManager.state == this.sceneManager.STATE_DEFAULT_MODE){
			inputHandler.selection = [];
			//bodies
			for (var i = 0; i < this.sceneManager.selectedBodies.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedBodies[i]);
			}
			//joints
			for (var i = 0; i < this.sceneManager.selectedJoints.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedJoints[i]);
			}
			//particles
			for (var i = 0; i < this.sceneManager.selectedParticles.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedParticles[i]);
			}

		}
		else if (this.sceneManager.state == this.sceneManager.STATE_BODY_EDIT_MODE){
			inputHandler.selection = this.sceneManager.selectedShapes;
		}
		else if (this.sceneManager.state == this.sceneManager.STATE_SHAPE_EDIT_MODE){
			inputHandler.selection = this.sceneManager.selectedVertices;
		}
	}
	
	// Editor.on_file_changed();
};

Viewport.prototype.onMouseMove = function(e){
	var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
	var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
	var inputHandler = this.inputHandler, navigator = this.navigator, sceneManager = this.sceneManager;
	
	inputHandler.pointerWorldPos[2] = navigator.screenPointToWorld(eoffsetX, eoffsetY)[0];
	inputHandler.pointerWorldPos[3] = navigator.screenPointToWorld(eoffsetX, eoffsetY)[1];

	if (inputHandler.mouseStatus[0]){
		inputHandler.selectionArea[2] = (eoffsetX - inputHandler.selectionArea[0]);
		inputHandler.selectionArea[3] = (eoffsetY - inputHandler.selectionArea[1]);

		inputHandler.current = [eoffsetX, eoffsetY];

		inputHandler.delta[0] = inputHandler.current[0] - inputHandler.start[0];
		inputHandler.delta[0] *= inputHandler.mouseSensitivity / navigator.scale;
		inputHandler.delta[1] = inputHandler.current[1] - inputHandler.start[1];
		inputHandler.delta[1] *= inputHandler.mouseSensitivity / navigator.scale;

		inputHandler.start[0] = inputHandler.current[0];
		inputHandler.start[1] = inputHandler.current[1];

		// panning
		if (inputHandler.mouseStatus[1] == InputHandler.IS_RIGHT_MOUSE_BUTTON){
			navigator.panning[0] += inputHandler.delta[0];
			navigator.panning[1] += inputHandler.delta[1];

			inputHandler.selectionArea[2] = 0;
			inputHandler.selectionArea[3] = 0;

			return;
		}

		// return if in game mode
		if (this.inputHandler.inGameMode){
			inputHandler.selectionArea[2] = 0;
			inputHandler.selectionArea[3] = 0;
			return;
		}

		if (sceneManager.state != sceneManager.STATE_IMAGE_EDIT_MODE){
			if (inputHandler.selectionArea[4]){
				return;
			}
		}

		// edit bodies and shapes
		inputHandler.snappingData[0] = navigator.cell_size * navigator.cell_size;
		
		sceneManager.transformSelection(inputHandler.delta, inputHandler, navigator, e);
	}
};

Viewport.prototype.onMouseLeave = function(e){
	var inputHandler = this.inputHandler, sceneManager = this.sceneManager;
	inputHandler.mouseStatus[0] = 0;
	inputHandler.selectionArea = [0, 0, 0, 0, 0];
}

Viewport.prototype.onMouseUp = function(e){
	var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
	var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
	var inputHandler = this.inputHandler, sceneManager = this.sceneManager;
	inputHandler.mouseStatus[0] = 0;
	
	var scale = this.navigator.scale;

	// return if in game mode
	if (this.inputHandler.inGameMode)
		return;

	if (inputHandler.selectionArea[4]){
		var startPoint = this.screenPointToWorld(inputHandler.selectionArea[0], inputHandler.selectionArea[1]),
			endPoint = this.screenPointToWorld(eoffsetX, eoffsetY);
		var lineSegment  = new LineSegment(startPoint[0], startPoint[1], endPoint[0], endPoint[1]);

		// edit bodies and shapes
		if (sceneManager.state == sceneManager.STATE_DEFAULT_MODE){
			if (sceneManager.selectedJoints.length == 1){
				if (sceneManager.selectedJoints[0].inEditMode){
					inputHandler.selectionArea = [0, 0, 0, 0, 0];
					return;
				}
			}
			if (!inputHandler.SHIFT_PRESSED){
				sceneManager.selectedBodies = [];
				sceneManager.selectedJoints = [];
				sceneManager.selectedParticles = [];
			}
			// bodies
			for (var i = 0; i < sceneManager.bodies.length; i++){
				if (lineSegment.checkInBoundsAABB(sceneManager.bodies[i].bounds)){
					if (sceneManager.selectedBodies.indexOf(sceneManager.bodies[i]) < 0){
						sceneManager.selectedBodies.push(sceneManager.bodies[i]);
						}
					sceneManager.bodies[i].isSelected = true;
				}
				else {
					if (!inputHandler.SHIFT_PRESSED){
						sceneManager.bodies[i].isSelected = false;
					}
				}
			}
			// joints
			for (var i = 0; i < sceneManager.joints.length; i++){
				var bounds = sceneManager.joints[i].getBounds();
				if (lineSegment.checkInBoundsAABB( [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale] )){
					if (sceneManager.selectedJoints.indexOf(sceneManager.joints[i]) < 0){
						sceneManager.selectedJoints.push(sceneManager.joints[i]);
					}
					sceneManager.joints[i].isSelected = true;
				}
				else {
					if (!inputHandler.SHIFT_PRESSED){
						sceneManager.joints[i].isSelected = false;
					}
				}
			}
			//particles
			for (var i = 0; i < sceneManager.particles.length; i++){
				if (lineSegment.checkInBoundsAABB(sceneManager.particles[i].bounds)){
					if (sceneManager.selectedParticles.indexOf(sceneManager.particles[i]) < 0){
						sceneManager.selectedParticles.push(sceneManager.particles[i]);
					}
					sceneManager.particles[i].isSelected = true;
				}
				else {
					if (!inputHandler.SHIFT_PRESSED){
						sceneManager.particles[i].isSelected = false;
					}
				}
			}
		}
		else if (sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE){
			if (!inputHandler.SHIFT_PRESSED){
				sceneManager.selectedShapes = [];
			}
			for (var i = 0; i < sceneManager.selectedBodies[0].shapes.length; i++){
				
				if (lineSegment.checkInBoundsAABB(sceneManager.selectedBodies[0].shapes[i].bounds)){
					if (sceneManager.selectedShapes.indexOf(sceneManager.selectedBodies[0].shapes[i]) < 0){
						sceneManager.selectedShapes.push(sceneManager.selectedBodies[0].shapes[i]);
					}
					sceneManager.selectedBodies[0].shapes[i].isSelected = true;
				}
				else {
					if (!inputHandler.SHIFT_PRESSED){
						sceneManager.selectedBodies[0].shapes[i].isSelected = false;
					}
				}
			}
		}
		else if (sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE){
			if (!inputHandler.SHIFT_PRESSED){
				sceneManager.selectedVertices = [];
			}
			for (var i = 0; i < sceneManager.selectedShapes[0].vertices.length; i++){
				var vertex = sceneManager.selectedShapes[0].vertices[i];
				if (lineSegment.checkInBoundsAABB([vertex.x, vertex.y, vertex.width, vertex.height])){
					if (sceneManager.selectedVertices.indexOf(sceneManager.selectedShapes[0].vertices[i]) < 0){
						sceneManager.selectedVertices.push(sceneManager.selectedShapes[0].vertices[i]);
					}
					sceneManager.selectedShapes[0].vertices[i].isSelected = true;
				}
				else{
					if (!inputHandler.SHIFT_PRESSED){
						sceneManager.selectedShapes[0].vertices[i].isSelected = false;	
					}
				}
			}
		}
		else if (sceneManager.state == sceneManager.STATE_IMAGE_VERTEX_EDIT_MODE && sceneManager.selectedBodies[0].sprites.length > 0){
			if (!inputHandler.SHIFT_PRESSED){
				sceneManager.selectedVertices = [];
			}
			var sprite = sceneManager.selectedBodies[0].sprites[sceneManager.selectedBodies[0].selectedSprite];
			for (var i = 0; i < sprite.vertices.length; i++){
				var vertex = sprite.vertices[i];
				if (lineSegment.checkInBoundsAABB([vertex.x, vertex.y, vertex.width, vertex.height])){
					if (sceneManager.selectedVertices.indexOf(sprite.vertices[i]) < 0){
						sceneManager.selectedVertices.push(sprite.vertices[i]);
					}
					sprite.vertices[i].isSelected = true;
				}
				else{
					if (!inputHandler.SHIFT_PRESSED){
						sprite.vertices[i].isSelected = false;	
					}
				}
			}
		}
		else if (sceneManager.state == sceneManager.STATE_PARTICLE_EDIT_MODE && sceneManager.selectedParticles[0].shape.type == 2){
			if (!inputHandler.SHIFT_PRESSED){
				sceneManager.selectedVertices = [];
			}
			var shape = sceneManager.selectedParticles[0].shape;
			for (var i = 0; i < shape.vertices.length; i++){
				var vertex = shape.vertices[i];
				if (lineSegment.checkInBoundsAABB([vertex.x, vertex.y, vertex.width, vertex.height])){
					if (sceneManager.selectedVertices.indexOf(shape.vertices[i]) < 0){
						sceneManager.selectedVertices.push(shape.vertices[i]);
					}
					shape.vertices[i].isSelected = true;
				}
				else{
					if (!inputHandler.SHIFT_PRESSED){
						shape.vertices[i].isSelected = false;	
					}
				}
			}
		}
		// else if (sceneManager.state == sceneManager.STATE_IMAGE_EDIT_MODE){
			// if (!inputHandler.SHIFT_PRESSED){
				// sceneManager.selectedVertices = [];
			// }
			// var sprite = sceneManager.selectedBodies[0].sprites[sceneManager.selectedBodies[0].selectedSprite];
			// if (lineSegment.checkInBoundsAABB(sprite.getBounds())){
				// console.log(0)
				// // if (sceneManager.selectedShapes.indexOf(sceneManager.selectedBodies[0].shapes[i]) < 0){
					// // sceneManager.selectedShapes.push(sceneManager.selectedBodies[0].shapes[i]);
				// // }
				// // sceneManager.selectedBodies[0].shapes[i].isSelected = true;
			// }
			// else {
				// if (!inputHandler.SHIFT_PRESSED){
					// // sceneManager.selectedBodies[0].shapes[i].isSelected = false;
				// }
			// }
		// }

		// selected object goes to inputHandler.selection[]
		if (sceneManager.state == sceneManager.STATE_DEFAULT_MODE){
			inputHandler.selection = [];
			//bodies
			for (var i = 0; i < this.sceneManager.selectedBodies.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedBodies[i]);
			}
			//joints
			for (var i = 0; i < this.sceneManager.selectedJoints.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedJoints[i]);
			}
			//particles
			for (var i = 0; i < this.sceneManager.selectedParticles.length; i++){
				inputHandler.selection.push(this.sceneManager.selectedParticles[i]);
			}
		}
		else if (sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE){
			inputHandler.selection = sceneManager.selectedShapes;
		}
		else if (this.sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE){
			inputHandler.selection = sceneManager.selectedVertices;
		}
		// else if (this.sceneManager.state == sceneManager.STATE_IMAGE_EDIT_MODE){
			// inputHandler.selection = [sceneManager.selectedBodies[0].sprites[sceneManager.selectedBodies[0].selectedSprite]];
		// }
	}

	inputHandler.selectionArea = [0, 0, 0, 0, 0];
	Editor.on_file_changed();
};

// viewport scaling
Viewport.prototype.onMouseWheel = function(e){
	var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
	var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
	
	var mouseX = eoffsetX;
	var mouseY = eoffsetY;
	var wheel = e.wheelDelta / 120;
	var zoom = 1 + (wheel > 0 ? 1 : -1) * Math.min(Math.abs(wheel / 20), 0.1);

	this.zoom(mouseX, mouseY, zoom);	    
};

Viewport.prototype.zoom = function(mouseX, mouseY, zoom){
	var navigator = this.navigator;
	
	if (zoom > 1){
		if (navigator.scale > navigator.scaleLimits[1])
			return;
	}
	else{
		if (navigator.scale < navigator.scaleLimits[0]) 
			return;
	}

	this.context.translate(
		navigator.origin[0],
		navigator.origin[1]
	);
	this.context.scale(zoom,zoom);
	this.context.translate(
		-( mouseX / navigator.scale + navigator.origin[0] - mouseX / ( navigator.scale * zoom ) ),
		-( mouseY / navigator.scale + navigator.origin[1] - mouseY / ( navigator.scale * zoom ) )
	);

	navigator.origin[0] = ( mouseX / navigator.scale + navigator.origin[0] - mouseX / ( navigator.scale * zoom ) );
	navigator.origin[1] = ( mouseY / navigator.scale + navigator.origin[1] - mouseY / ( navigator.scale * zoom ) );
	navigator.scale *= zoom;
};

Viewport.prototype.zoomIn = function(){
	this.zoom(this.canvas.width / 2, this.canvas.height / 2, 1.2);
};

Viewport.prototype.zoomOut = function(){
	this.zoom(this.canvas.width / 2, this.canvas.height / 2, 0.8);
};

Viewport.prototype.resetView = function(){
	this.zoom(this.canvas.width / 2, this.canvas.height / 2, 1 / this.navigator.scale);	
	this.navigator.panning = 
				[
					this.canvas.width / (this.navigator.scale * 2) + this.navigator.origin[0],
					this.canvas.height / (this.navigator.scale * 2) + this.navigator.origin[1],
				];
};

Viewport.prototype.reset = function(){
	this.navigator.origin = [0, 0];
	this.navigator.scale = 1;
}

Viewport.prototype.resetPanning = function(){
	this.navigator.panning = 
				[
					this.canvas.width / (this.navigator.scale * 2) + this.navigator.origin[0],
					this.canvas.height / (this.navigator.scale * 2) + this.navigator.origin[1],
				];
	this.navigator.origin = [0, 0];
	this.navigator.scale = 1;
}

Viewport.prototype.draw = function(gameView){
	var inputHandler = this.inputHandler; 
	var navigator = this.navigator;
	var renderer = this.renderer;
	var sceneManager = this.sceneManager;
	var scale = navigator.scale;
	
	//set scale for thickness
	if(navigator.scale > 1){
		renderer.setScale(scale);
	}
	else{
		renderer.setScale(1);
	}
	//nav scale
	renderer.nscale = scale;
	
	// clear screen
	renderer.clear(navigator.origin[0], navigator.origin[1], renderer.width / scale, renderer.height / scale);
	

	if(inputHandler.B_KEY_PRESSED){
		renderer.BodyAlpha = 1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 0.1;
	}
	else if(inputHandler.J_KEY_PRESSED){
		renderer.BodyAlpha = 0.1;
		renderer.JointAlpha = 1;
		renderer.ParticleAlpha = 0.1;
	}
	else if(inputHandler.P_KEY_PRESSED){
		renderer.BodyAlpha = 0.1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 1;
	}
	else if(sceneManager.state == sceneManager.STATE_DEFAULT_MODE){
		renderer.BodyAlpha = 1;
		renderer.JointAlpha = 1;
		renderer.ParticleAlpha = 1;
	}
	else if(sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE){
		renderer.BodyAlpha = 1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 0.1;
	}
	else if(sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE){
		renderer.BodyAlpha = 1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 0.1;
	}
	else if(sceneManager.state == sceneManager.STATE_PARTICLE_EDIT_MODE){
		renderer.BodyAlpha = 0.1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 1;
	}
	else if(sceneManager.state == sceneManager.STATE_IMAGE_EDIT_MODE || sceneManager.state == sceneManager.STATE_IMAGE_VERTEX_EDIT_MODE){
		renderer.BodyAlpha = 0.1;
		renderer.JointAlpha = 0.1;
		renderer.ParticleAlpha = 0.1;
	}


	// saving the current state of the canvas
	renderer.getContext().save();

	// applying panning to canvas
	
	renderer.getContext().translate(navigator.panning[0], navigator.panning[1]);
	
	// rendering the grid
	renderer.renderGrid(navigator.range, navigator.cell_size);



	if (!inputHandler.inGameMode){
	
		//draw selected bodies bounds
		var bounds = sceneManager.getSelectedBodiesBounds();
		if(sceneManager.selectedBodies.length > 1 && inputHandler.pivotMode == 4){
			renderer.getContext().strokeStyle = 'rgba(255, 255, 0, 0.8)';
			renderer.getContext().lineWidth = 1 / renderer.scale;
			renderer.setLineDash(2.5 / scale, 2.5 / scale);
			renderer.renderBox(bounds[0], bounds[1], bounds[2], bounds[3], false);
			renderer.centroid(bounds[0], bounds[1], 12 / renderer.scale);
			renderer.setLineDash(0, 0);
		}
	
		// rendering the images
		for (var i = 0; i < sceneManager.bodies.length; i++){
			var body = sceneManager.bodies[i];
			for (var j = 0; j < body.sprites.length; j++){
			    var s = body.sprites[j];
				if(s.hasLoaded){
					this.renderer.renderImage(s, body);
				}
			}
		}
		
		// rendering the bodies
		for (var i = 0; i < sceneManager.bodies.length; i++){
			renderer.renderBody(sceneManager.bodies[i], i);
		}
		
		// rendering the particles
		for (var i = 0; i < sceneManager.particles.length; i++){
			renderer.renderParticles(sceneManager.particles[i]);
		}
		
		// rendering the joints
		for (var i = 0; i < sceneManager.joints.length; i++){
			renderer.renderJoint(sceneManager.joints[i], navigator);
		}
		
		if(sceneManager.state == sceneManager.STATE_LOCK_MODE && renderer.DEBUG){
			var x = inputHandler.lastRightMouseClickPos[0];
			var y = inputHandler.lastRightMouseClickPos[1];
			renderer.getContext().lineWidth = 1  / renderer.scale;
			renderer.getContext().strokeStyle = '#0f0';
			renderer.getContext().beginPath();
			renderer.getContext().moveTo(x, 0);
			renderer.getContext().lineTo(x, y);
			renderer.getContext().stroke();
			renderer.getContext().strokeStyle = '#f00';
			renderer.getContext().beginPath();
			renderer.getContext().moveTo(0, y);
			renderer.getContext().lineTo(x, y);
			renderer.getContext().stroke();	
			renderer.centroid(x, y, 12 / renderer.scale);
		}
			

		// draw selection area if active
		if(sceneManager.state != sceneManager.STATE_IMAGE_EDIT_MODE){
			if (inputHandler.selectionArea[4]){
				var position = this.screenPointToWorld(inputHandler.selectionArea[0], inputHandler.selectionArea[1]),
					width = inputHandler.selectionArea[2] / navigator.scale,
					height = inputHandler.selectionArea[3] / navigator.scale;
				
				renderer.getContext().globalAlpha = 1;
				renderer.getContext().lineWidth = 0.25 / scale;
				renderer.setLineDash(2.5 / scale, 2.5 / scale);
				renderer.getContext().strokeStyle = "#ffffff";
				renderer.getContext().fillStyle = "#ffffff10";
				renderer.renderBox(position[0] + width / 2, position[1] + height / 2, width, height, false);
				renderer.renderBox(position[0] + width / 2, position[1] + height / 2, width, height, true);
				renderer.getContext().strokeStyle = "#f00";
				renderer.setLineDash(0, 0);
			}
		}
	}
	else {
		if (gameView && gameView.hasLoaded){
			gameView.updateView();
		}
	}

	// restoring the saved canvas state
	renderer.getContext().restore();
};

Viewport.prototype.screenPointToWorld = function(x, y){
	return 	this.navigator.screenPointToWorld(x, y);
};

Viewport.prototype.worldPointToScreen = function(x, y){
	return 	this.navigator.worldPointToScreen(x, y);
};

Viewport.prototype.getNavigator = function(){
	return this.navigator;
};

Viewport.prototype.getInputHandler = function(){
	return this.inputHandler;
};

Viewport.prototype.getRenderer = function(){
	return this.renderer;
};

Viewport.prototype.getSceneManager = function(){
	return this.sceneManager;
};