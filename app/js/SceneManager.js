function SceneManager(){
	this.info = {};
	this.info['dateCreated'] = null;
	this.info['lastModified'] = null;
	this.info['favourite'] = false;
	this.info['comment'] = '';
	this.info['name'] = '';
	this.info['author'] = '';
	this.STATE_DEFAULT_MODE 	      = +0;
	this.STATE_SHAPE_EDIT_MODE        = +1;
	this.STATE_BODY_EDIT_MODE 	      = +2;
	this.STATE_IMAGE_VERTEX_EDIT_MODE = +3;
	this.STATE_PARTICLE_EDIT_MODE     = +4;
	this.STATE_IMAGE_EDIT_MODE        = +5;
	this.STATE_JOINT_EDIT_MODE	      = +6;
	this.STATE_LOCK_MODE	      	  = -1;
	this.state 				= this.STATE_DEFAULT_MODE;
	this.currentState 		= this.STATE_DEFAULT_MODE;
	this.world 				= new World();
	this.bodies 			= [];
	this.joints 			= [];
	this.particles 			= [];
	this.objects 			= [];
	this.selectedObjects 	= [];
	this.selectedParticles 	= [];
	this.selectedBodies 	= [];
	this.selectedShapes 	= [];
	this.selectedVertices 	= [];
	this.selectedJoints 	= [];
	this.selectedAnchor;
	this.scripts            = [];
}

SceneManager.prototype.setScript = function(raw){
	if(raw.trim() != "") {
		this.scripts[0] = new Script(raw, 'javascript')
	}
}

SceneManager.prototype.loadSceneData = function(data){
	this.loadScene(data.scene);
	this.setSceneInfo(data.info);
}

SceneManager.prototype.getSceneData = function(){
	var data = {
		info : {},
		scene : {}
	}
	
	data.scene = this.saveScene();
	data.info = this.getSceneInfo();
	data.info.lastModified = new Date().getTime();
	
	return data
}

SceneManager.prototype.resetSceneInfo = function(){
	this.info = {};
	this.info['dateCreated'] = null;
	this.info['lastModified'] = null;
	this.info['favourite'] = false;
	this.info['comment'] = '';
	this.info['name'] = 'New Scene';
	this.info['author'] = '';
}

SceneManager.prototype.getSceneInfo = function(){
	var obj = {};
	
	for (var x in this.info){
	    obj[x] = this.info[x];
	}
	
	return obj
}

SceneManager.prototype.setSceneInfo = function(obj){
	for (var x in obj){
	    this.info[x] = obj[x];
	}
}


SceneManager.prototype.selectAll = function(){
	for (var i = 0; i < this.bodies.length; i++){
	    this.selectedBodies.push(this.bodies[i]);
		this.bodies[i].isSelected = true;
	}
	for (var i = 0; i < this.joints.length; i++){
	    this.selectedJoints.push(this.joints[i]);
		this.joints[i].isSelected = true;
	}
	for (var i = 0; i < this.particles.length; i++){
	    this.selectedParticles.push(this.particles[i]);
		this.particles[i].isSelected = true;
	}
}

SceneManager.prototype.clearSelection = function(){
	if(this.state == this.STATE_DEFAULT_MODE){
		this.selectedParticles 	= [];
		this.selectedBodies 	= [];
		this.selectedShapes 	= [];
		this.selectedVertices 	= [];
		this.selectedJoints 	= [];
	}
}


SceneManager.prototype.check_boneFolder_exists = function(){
	var dir = path.join(Editor.currentFile.dir, Editor.currentFile.nameonly + '_bones');
	if(!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}
}


SceneManager.prototype.exportSelectedObjects = function(){
	this.check_boneFolder_exists();
	
	var dir = path.join(Editor.currentFile.dir, Editor.currentFile.nameonly + '_bones');
	var bodies = this.selectedBodies;
	var joints = this.selectedJoints;
	var particles = this.selectedParticles;
	var shapes = this.selectedShapes;
	
	//...bodies	
	for(i = 0; i < bodies.length; i++){
		var body = bodies[i];
		var data = JSON.stringify(body, null, 4);
		var filename = body.name + '.body';
		var filedir = path.join(dir, filename);
		fs.writeFileSync(filedir, data);
	}
	//...joints
	for(i = 0; i < joints.length; i++){
		var joint = joints[i];
		var data = JSON.stringify(joint, null, 4);
		var filename = joint.name + '.joint';
		var filedir = path.join(dir, filename);
		fs.writeFileSync(filedir, data);
	}
	//...particles
	for(i = 0; i < particles.length; i++){
		var particle = particles[i];
		var data = JSON.stringify(particle, null, 4);
		var filename = particle.name + '.particle';
		var filedir = path.join(dir, filename);
		fs.writeFileSync(filedir, data);
	}
	//...shapes
	for(i = 0; i < shapes.length; i++){
		var shape = shapes[i];
		var data = JSON.stringify(shape, null, 4);
		var filename = shape.name + '.shape';
		var filedir = path.join(dir, filename);
		fs.writeFileSync(filedir, data);
	}
}



SceneManager.prototype.getSelectedBodiesBounds = function(){
	if(this.selectedBodies.length != 0){
		var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
		var v;

		for (var h = 0; h < this.selectedBodies.length; h++){
			var bodies = this.selectedBodies[h];
			for (var i = 0; i < bodies.shapes.length; i++){
				for (var j = 0; j < bodies.shapes[i].vertices.length; j++){
					v = bodies.shapes[i].vertices[j];
					minX = Math.min(minX, v.x)
					maxX = Math.max(maxX, v.x);
					minY = Math.min(minY, v.y);
					maxY = Math.max(maxY, v.y);
				}
			}
		}
		var a = (maxX + minX) / 2;
		var b = (maxY + minY) / 2;
		var c  = maxX - minX;
		var d = maxY - minY;
		
		return [a, b, c, d]
	}
};

SceneManager.prototype.enterDefaultMode = function(){
	this.state = this.STATE_DEFAULT_MODE;
	this.currentState = this.STATE_DEFAULT_MODE;
	
	if (this.selectedShapes.length > 0){
		for (var i = 0; i < this.selectedShapes.length; i++){
			this.selectedShapes[i].inEditMode = false;
			this.selectedShapes[i].isSelected = false;
		}
	}
	
	if (this.selectedJoints.length > 0){
		for (var i = 0; i < this.selectedJoints.length; i++){
			this.selectedJoints[i].inEditMode = false;
		}
	}
	
};

SceneManager.prototype.enterBodyEditMode = function(){
	if (this.selectedBodies.length > 1 || this.selectedBodies.length < 1) return;
	if (this.state == this.STATE_IMAGE_EDIT_MODE || this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE) return;
	if (this.state == this.STATE_JOINT_EDIT_MODE || this.state == this.STATE_PARTICLE_EDIT_MODE) return;
	if (this.selectedShapes.length > 0) this.selectedShapes[0].inEditMode = false;
	this.state = this.STATE_BODY_EDIT_MODE;
	this.currentState = this.STATE_BODY_EDIT_MODE;
};

SceneManager.prototype.enterShapeEditMode = function(){
	if (this.state != this.STATE_BODY_EDIT_MODE) return;
	// if (this.state == this.STATE_IMAGE_EDIT_MODE || this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE) return;
	// if (this.state == this.STATE_JOINT_EDIT_MODE || this.state == this.STATE_PARTICLE_EDIT_MODE) return;
	if (this.selectedShapes.length != 1) return;
	this.state = this.STATE_SHAPE_EDIT_MODE;
	this.currentState = this.STATE_SHAPE_EDIT_MODE;
	this.selectedShapes[0].inEditMode = true;
};

SceneManager.prototype.enterImageVertexEditMode = function(){
	if (this.state == this.STATE_SHAPE_EDIT_MODE) return;
	if (this.state == this.STATE_BODY_EDIT_MODE) return;
	if (this.state == this.STATE_PARTICLE_EDIT_MODE) return;
	if (this.state == this.STATE_IMAGE_EDIT_MODE) return;
	if (this.state == this.STATE_JOINT_EDIT_MODE) return;
	if (this.selectedBodies.length == 0) return;
	this.state = this.STATE_IMAGE_VERTEX_EDIT_MODE;
	this.currentState = this.STATE_IMAGE_VERTEX_EDIT_MODE;
	this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite].inEditMode = true;
};

SceneManager.prototype.enterImageEditMode = function(){
	if (this.state == this.STATE_SHAPE_EDIT_MODE) return;
	if (this.state == this.STATE_BODY_EDIT_MODE) return;
	if (this.state == this.STATE_PARTICLE_EDIT_MODE) return;
	if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE) return;
	if (this.state == this.STATE_JOINT_EDIT_MODE) return;
	if (this.selectedBodies.length == 0) return;
	this.state = this.STATE_IMAGE_EDIT_MODE;
	this.currentState = this.STATE_IMAGE_EDIT_MODE;
};

SceneManager.prototype.enterParticleEditMode = function(){
	if (this.state == this.STATE_SHAPE_EDIT_MODE) return;
	if (this.state == this.STATE_BODY_EDIT_MODE) return;
	if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE) return;
	if (this.state == this.STATE_JOINT_EDIT_MODE) return;
	this.state = this.STATE_PARTICLE_EDIT_MODE;
	this.currentState = this.STATE_PARTICLE_EDIT_MODE;
	this.selectedParticles[0].shape.inEditMode = true;
};

SceneManager.prototype.enterJointEditMode = function(){
	if (this.state == this.STATE_SHAPE_EDIT_MODE) return;
	if (this.state == this.STATE_BODY_EDIT_MODE) return;
	if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE) return;
	if (this.state == this.STATE_IMAGE_EDIT_MODE) return;
	if (this.state == this.STATE_PARTICLE_EDIT_MODE) return;
	this.state = this.STATE_JOINT_EDIT_MODE;
	this.currentState = this.STATE_JOINT_EDIT_MODE;
	this.selectedJoints[0].inEditMode = true;
};

SceneManager.prototype.checkState = function(STATE){
	if(this.state == STATE || this.currentState  == STATE) return true
	return false
}
	
	
SceneManager.prototype.deleteSelectedObjects = function(){
	if (this.checkState(this.STATE_DEFAULT_MODE)){
		for (var i = 0; i < this.selectedBodies.length; i++){
			this.removeBody(this.selectedBodies[i]);
		}
		this.selectedBodies = [];
		for (var i = 0; i < this.selectedJoints.length; i++){
			this.removeJoint(this.selectedJoints[i]);
		}
		this.selectedJoints = [];
		//particles
		for (var i = 0; i < this.selectedParticles.length; i++){
			this.removeParticle(this.selectedParticles[i]);
		}
		this.selectedParticles = [];
	}
	else if (this.checkState(this.STATE_BODY_EDIT_MODE)){
		for (var i = 0; i < this.selectedShapes.length; i++){
			this.selectedBodies[0].removeShapeGivenShape(this.selectedShapes[i]);
		}
	}
	else if (this.checkState(this.STATE_SHAPE_EDIT_MODE)){
		for (var i = 0; i < this.selectedVertices.length; i++){
			this.selectedShapes[0].removeVertexGivenVertex(this.selectedVertices[i]);
		}
	}
	else if (this.checkState(this.STATE_IMAGE_VERTEX_EDIT_MODE)){
		for (var i = 0; i < this.selectedVertices.length; i++){
			this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite].removeVertexGivenVertex(this.selectedVertices[i]);
		}
	}
	else if (this.checkState(this.STATE_PARTICLE_EDIT_MODE)){
		for (var i = 0; i < this.selectedVertices.length; i++){
			this.selectedParticles[0].shape.removeVertexGivenVertex(this.selectedVertices[i]);
		}
	}
};

SceneManager.prototype.duplicateSelection = function(){
	if (this.state == this.STATE_DEFAULT_MODE){
		for (var i = 0; i < this.selectedBodies.length; i++){
			
			var b = this.selectedBodies[i].clone();
			b.isSelected = false;
			this.addBody(b);
		}
		for (var i = 0; i < this.selectedJoints.length; i++){
			if(this.selectedJoints[i].jointType != Joint.JOINT_AREA && this.selectedJoints[i].jointType != Joint.JOINT_GEAR){
				var j = this.selectedJoints[i].clone();
		
				if(this.selectedJoints[i].jointType == Joint.JOINT_MOUSE){
					var bodyB = this.selectedJoints[i].bodyB;
					if(bodyB.isSelected){
						for(b = 0; b < this.bodies.length; b++){
							var bodyClone = this.bodies[b];
							if(bodyClone.cloneOf == bodyB.id){
								j.bodyB = bodyClone;
							}
						}
					}
				}
				else{
					var bodyA = this.selectedJoints[i].bodyA;
					var bodyB = this.selectedJoints[i].bodyB;
					if(bodyA.isSelected && bodyB.isSelected){
						for(b = 0; b < this.bodies.length; b++){
							var bodyClone = this.bodies[b];
							if(bodyClone.cloneOf == bodyA.id){
								j.bodyA = bodyClone;
							}
							if(bodyClone.cloneOf == bodyB.id){
								j.bodyB = bodyClone;
							}
						}
					}
				}
				this.addJoint(j);
			}
		}
		//particles
		for (var i = 0; i < this.selectedParticles.length; i++){
			var p = this.selectedParticles[i].clone();
			//p.name = this.selectedParticles[i].name+"_copy"
			this.addParticle(p);
		}
	}
	else if (this.state == this.STATE_BODY_EDIT_MODE){
		for (var i = 0; i < this.selectedShapes.length; i++){
			this.selectedBodies[0].addShape(this.selectedShapes[i].clone());
		}
	}
	else if (this.state == this.STATE_SHAPE_EDIT_MODE){
		for (var i = 0; i < this.selectedVertices.length; i++){
			this.selectedShapes[0].vertices.splice(this.selectedShapes[0].indexOfVertex(this.selectedVertices[i]) + 1, 0, this.selectedVertices[i].clone());
		}
	}
	else if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE){
		var sprite = this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite];
		for (var i = 0; i < this.selectedVertices.length; i++){
			sprite.vertices.splice(sprite.indexOfVertex(this.selectedVertices[i]) + 1, 0, this.selectedVertices[i].clone());
		}
	}
};

// don't use only aabb collision detection for chain shapes, instead use its edges
SceneManager.prototype.checkCollisionWithChainShape = function(pointx, pointy, shape){
	var lineSegment, index = 0;
	for (var i = 0; i < shape.vertices.length; i++){
		if (i == shape.vertices.length - 1){
			lineSegment = new LineSegment(shape.vertices[i].x, shape.vertices[i].y, shape.vertices[0].x, shape.vertices[0].y);
		}
		else{
			lineSegment = new LineSegment(shape.vertices[i].x, shape.vertices[i].y, shape.vertices[i + 1].x, shape.vertices[i + 1].y);
		}
		
		// use some threshold to determine collision
		if (lineSegment.distanceFromPoint(pointx, pointy) < 10){
			if (lineSegment.checkInBoundsX(pointx) || lineSegment.checkInBoundsY(pointy)){
				return true;		
			}
		}
	}
	return false;
}

// for selecting objects
SceneManager.prototype.onMouseDown = function(e, inputHandler, navigator){
	var eoffsetX = e.offsetX == undefined ? e.layerX : e.offsetX;
	var eoffsetY = e.offsetY == undefined ? e.layerY : e.offsetY;
	var scale = navigator.scale;

	//particle vtx
	if (this.state == this.STATE_PARTICLE_EDIT_MODE){
		// for rendering vertices
		var pshape = this.selectedParticles[0].shape;
		pshape.inEditMode = true;
		
		// for adding vertex to the selected shape
		if (inputHandler.CTRL_PRESSED){
			var point = navigator.screenPointToWorld(eoffsetX, eoffsetY);
			pshape.addVertex(point[0], point[1]);
			for(v = 0; v < this.selectedVertices.length; v++){
				this.selectedVertices[v].isSelected = false;
			}
			this.selectedVertices = [];	
			
			// push the "new vertex" to selectedVertices
			for(v = 0; v < pshape.vertices.length; v++){
				var vtx = pshape.vertices[v];
				if(vtx.x == point[0] && vtx.y == point[1]){
					vtx.isSelected = true;
					this.selectedVertices.push(vtx);
				}
			}
			return true;
		}
		
		// for handling multiple vertices
		if (this.selectedVertices.length > 1) {
			for (var i = 0; i < this.selectedVertices.length; i++){
				var vertex = this.selectedVertices[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}
		}
		
		if (!inputHandler.SHIFT_PRESSED){
			this.selectedVertices = [];			
		}
		var vertexInBounds = false;
		for (var i = 0; i < pshape.vertices.length; i++){
			var vertex = pshape.vertices[i];
			
			if (!inputHandler.SHIFT_PRESSED){
				vertex.isSelected = false;
			}
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
				if (!inputHandler.SHIFT_PRESSED){
					this.selectedVertices[0] = vertex;
					vertex.isSelected = true;
				}
				else {
					if (this.selectedVertices.indexOf(vertex) < 0){
						this.selectedVertices.push(vertex);
						vertex.isSelected = true;
					}
				}
				vertexInBounds = true;
			}
		}
		return vertexInBounds;
	}
	

	//sprite's vtx
	if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE){
		// for rendering vertices
		var body = this.selectedBodies[0];
		var image = body.sprites[body.selectedSprite];
		image.inEditMode = true;
		
		// for adding vertex to the selected shape
		if (inputHandler.CTRL_PRESSED){
			var point = navigator.screenPointToWorld(eoffsetX, eoffsetY);
			image.addVertex(point[0], point[1]);
			for(v = 0; v < this.selectedVertices.length; v++){
				this.selectedVertices[v].isSelected = false;
			}
			this.selectedVertices = [];	
			
			// push the "new vertex" to selectedVertices
			for(v = 0; v < image.vertices.length; v++){
				var vtx = image.vertices[v];
				if(vtx.x == point[0] && vtx.y == point[1]){
					vtx.isSelected = true;
					this.selectedVertices.push(vtx);
				}
			}
			return true;
		}
		
		// for handling multiple vertices
		if (this.selectedVertices.length > 1) {
			for (var i = 0; i < this.selectedVertices.length; i++){
				var vertex = this.selectedVertices[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}
		}
		
		if (!inputHandler.SHIFT_PRESSED){
			this.selectedVertices = [];			
		}
		var vertexInBounds = false;
		for (var i = 0; i < image.vertices.length; i++){
			var vertex = image.vertices[i];
			
			if (!inputHandler.SHIFT_PRESSED){
				vertex.isSelected = false;
			}
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
				if (!inputHandler.SHIFT_PRESSED){
					this.selectedVertices[0] = vertex;
					vertex.isSelected = true;
				}
				else {
					if (this.selectedVertices.indexOf(vertex) < 0){
						this.selectedVertices.push(vertex);
						vertex.isSelected = true;
					}
				}
				vertexInBounds = true;
			}
		}
		return vertexInBounds;
	}
	
	if (this.state == this.STATE_SHAPE_EDIT_MODE){
		// for rendering vertices
		this.selectedShapes[0].inEditMode = true;
		
		// for adding vertex to the selected shape
		if (inputHandler.CTRL_PRESSED){
			var point = navigator.screenPointToWorld(eoffsetX, eoffsetY);
			this.selectedShapes[0].addVertex(point[0], point[1]);
			for(v = 0; v < this.selectedVertices.length; v++){
				this.selectedVertices[v].isSelected = false;
			}
			this.selectedVertices = [];	
			
			// push the "new vertex" to selectedVertices
			for(v = 0; v < this.selectedShapes[0].vertices.length; v++){
				var vtx = this.selectedShapes[0].vertices[v];
				if(vtx.x == point[0] && vtx.y == point[1]){
					vtx.isSelected = true;
					this.selectedVertices.push(vtx);
				}
			}
			return true;
		}
		
		// for handling multiple vertices
		if (this.selectedVertices.length > 1) {
			for (var i = 0; i < this.selectedVertices.length; i++){
				var vertex = this.selectedVertices[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}
		}
		
		if (!inputHandler.SHIFT_PRESSED){
			this.selectedVertices = [];			
		}
		var vertexInBounds = false;
		for (var i = 0; i < this.selectedShapes[0].vertices.length; i++){
			var vertex = this.selectedShapes[0].vertices[i];
			
			if (!inputHandler.SHIFT_PRESSED){
				vertex.isSelected = false;
			}
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [vertex.x, vertex.y, vertex.width / scale, vertex.height / scale])){
				if (!inputHandler.SHIFT_PRESSED){
					this.selectedVertices[0] = vertex;
					vertex.isSelected = true;
				}
				else {
					if (this.selectedVertices.indexOf(vertex) < 0){
						this.selectedVertices.push(vertex);
						vertex.isSelected = true;
					}
				}
				vertexInBounds = true;
			}
		}
		return vertexInBounds;
	}
	
	if (this.state == this.STATE_BODY_EDIT_MODE){
		// for handling multiple shapes
		if (this.selectedShapes.length > 1) {
			for (var i = 0; i < this.selectedShapes.length; i++){
				var shape = this.selectedShapes[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, shape.bounds)){
					// check for chain shapes
					if (shape.shapeType == Shape.SHAPE_CHAIN){
						var screenPointToWorld = navigator.screenPointToWorld(eoffsetX, eoffsetY);
						if (!this.checkCollisionWithChainShape(screenPointToWorld[0], screenPointToWorld[1], shape)){
							continue;
						}
					}
					
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}
		}
		
		// don't reset selectedShapes array if shift is pressed (multiple selection)			
		if (!inputHandler.SHIFT_PRESSED){
			this.selectedShapes = [];
		}
		var minDistance = 1000000000, distance, shapeInBounds = false;
		for (var i = 0; i < this.selectedBodies[0].shapes.length; i++){
			var shape = this.selectedBodies[0].shapes[i];
			
			if (!inputHandler.SHIFT_PRESSED){
				shape.isSelected = false;
			}
			
			// check if test point is in the shape
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, shape.bounds)){
				
				var point = navigator.worldPointToScreen(shape.position[0], shape.position[1]);
				distance = (point[0] - eoffsetX) * (point[0] - eoffsetX) + (point[1] - eoffsetY) * (point[1] - eoffsetY);
				// check for minimum distance in case the test point is in multiple shapes 
				if (minDistance >= distance){
					
					// if shape is chain_shape the check for intersection between test point and its edges with some threshold 
					if (shape.shapeType == Shape.SHAPE_CHAIN){
						var screenPointToWorld = navigator.screenPointToWorld(eoffsetX, eoffsetY);
						if (!this.checkCollisionWithChainShape(screenPointToWorld[0], screenPointToWorld[1], shape)){
							continue;
						}
					}
					
					// multiple selection is disabled
					if (!inputHandler.SHIFT_PRESSED){
						this.selectedShapes[0] = shape;
						shape.isSelected = true;
					}
					// user is holding shift, so multiple selection is active
					else {
						// check if the shape is already selected
						if (this.selectedShapes.indexOf(shape) < 0){
							this.selectedShapes.push(shape);
							shape.isSelected = true;
						}
					}
					
					// shape selected so return true
					shapeInBounds = true;
					minDistance = distance;
				}
			}
		}
		return shapeInBounds;
	}
	
	// editing joints
	if (this.state == this.STATE_JOINT_EDIT_MODE){
		var joint = this.selectedJoints[0];
			joint.isSelected = true;

		if(joint.jointType == Joint.JOINT_ROPE){
			var b = joint.getFrequecyHZBounds();
			var bounds = [b[0], b[1], b[2] / scale, b[3] / scale]
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, bounds)){
				this.selectedAnchor = 5;
				return true;
			}
		}
		
		var bounds = joint.getAnchorABounds();
		
		
		if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
			this.selectedAnchor = 0;
			return true;
		}
		
		var bounds = joint.getAnchorBBounds();
		
		if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
			this.selectedAnchor = 1;
			return true;
		}
		
		if (joint.jointType == Joint.JOINT_PULLEY){
		
			var bounds = joint.getGroundAnchorABounds();
			
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
				this.selectedAnchor = 2;
				return true;
			}
			
			var bounds = joint.getGroundAnchorBBounds();
			
			if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
				this.selectedAnchor = 3;
				return true;
			}
		}
		
		this.selectedAnchor = -1;
		
		if (navigator.checkPointInAABB(eoffsetX, eoffsetY, joint.bodyA.bounds) && joint.jointType != Joint.JOINT_PULLEY){
			this.selectedAnchor = 2;
			return true;
		}
		else if (navigator.checkPointInAABB(eoffsetX, eoffsetY, joint.bodyB.bounds)  && joint.jointType != Joint.JOINT_PULLEY){
			this.selectedAnchor = 3;
			return true;
		}
		
		return false;
	}
	
	if (this.state == this.STATE_DEFAULT_MODE){
		
		// for handling multiple bodies
		if (this.selectedBodies.length + this.selectedJoints.length + this.selectedParticles.length > 1){
			for (var i = 0; i < this.selectedBodies.length; i++){
				var body = this.selectedBodies[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, body.bounds)){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}	
		}
		
		// for handling multiple joints
		if (this.selectedJoints.length + this.selectedBodies.length + this.selectedParticles.length > 1){
			for (var i = 0; i < this.selectedJoints.length; i++){
				var joint = this.selectedJoints[i];
				var bounds = joint.getBounds();
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}	
		}
		
		// for handling multiple particles
		if (this.selectedParticles.length + this.selectedJoints.length + this.selectedBodies.length > 1){
			for (var i = 0; i < this.selectedParticles.length; i++){
				var p = this.selectedParticles[i];
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, p.bounds)){
					if (inputHandler.SHIFT_PRESSED){
						break;
					}
					return true;
				}
			}	
		}
		
		if (!inputHandler.SHIFT_PRESSED){
			this.selectedBodies    = [];
			this.selectedJoints    = [];
			this.selectedParticles = [];
		}
		var minDistance = 1000000000,  
		distance, 
		bodyInBounds = false, 
		jointInBounds = false,
		particleInBounds = false;
		if (!inputHandler.J_KEY_PRESSED && !inputHandler.P_KEY_PRESSED){
			for (var i = 0; i < this.bodies.length; i++){
				var body = this.bodies[i];
				
				if(!inputHandler.SHIFT_PRESSED){
					body.isSelected = false;
				}
				
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, body.bounds)){
					var point = navigator.worldPointToScreen(body.position[0], body.position[1]);
					distance = (point[0] - eoffsetX) * (point[0] - eoffsetX) + (point[1] - eoffsetY) * (point[1] - eoffsetY);
					if (minDistance >= distance){
						if (!inputHandler.SHIFT_PRESSED){
							this.selectedBodies[0] = body;
							body.isSelected = true;
						}
						else {
							if (this.selectedBodies.indexOf(body) < 0){
								this.selectedBodies.push(body);
								body.isSelected = true;
							}
						}
						minDistance = distance;
					}
					bodyInBounds = true;
				}
			}
		}
		if (!inputHandler.B_KEY_PRESSED && !inputHandler.P_KEY_PRESSED){
			minDistance = 100000000000000;
			for (var i = 0; i < this.joints.length; i++){
				var joint = this.joints[i];
				
				if(!inputHandler.SHIFT_PRESSED){
					joint.isSelected = false;
				}
				
				var bounds = joint.getBounds();
				
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, [bounds[0], bounds[1], bounds[2] / scale, bounds[3] / scale])){
					var point = navigator.worldPointToScreen(joint.position[0], joint.position[1]);
					distance = (point[0] - eoffsetX) * (point[0] - eoffsetX) + (point[1] - eoffsetY) * (point[1] - eoffsetY);
					if (minDistance >= distance){
						if (!inputHandler.SHIFT_PRESSED){
							this.selectedJoints[0] = joint;
							joint.isSelected = true;
						}
						else {
							if (this.selectedJoints.indexOf(joint) < 0){
								this.selectedJoints.push(joint);
								joint.isSelected = true;
							}
						}
						minDistance = distance;
					}
					jointInBounds = true;
				}
			}
		}
		
		
		//particle
		if(!inputHandler.J_KEY_PRESSED && !inputHandler.B_KEY_PRESSED){
			for (var i = 0; i < this.particles.length; i++){
				var particle = this.particles[i];
				
				if(!inputHandler.SHIFT_PRESSED){
					particle.isSelected = false;
				}
				
				if (navigator.checkPointInAABB(eoffsetX, eoffsetY, particle.bounds)){
					var point = navigator.worldPointToScreen(particle.position[0], particle.position[1]);
					distance = (point[0] - eoffsetX) * (point[0] - eoffsetX) + (point[1] - eoffsetY) * (point[1] - eoffsetY);
					if (minDistance >= distance){
						if (!inputHandler.SHIFT_PRESSED){
							this.selectedParticles[0] = particle;
							particle.isSelected = true;
						}
						else {
							if (this.selectedParticles.indexOf(particle) < 0){
								this.selectedParticles.push(particle);
								particle.isSelected = true;
							}
						}
						minDistance = distance;
					}
					particleInBounds = true;
				}
			}
		}
		
		
		return bodyInBounds || jointInBounds || particleInBounds;
	}
	return false
};

/**
	*
	* params x,	 			position on x - axis, null if only y pos is to be set (use null only when move = 0)
	* params y,    			position on y - axis, null if only x pos is to be set (use null only when move = 0)
	* params move, 			1 for moving, 0 for setting position
	* params inputHandler, 	information about pivot mode and snapping data
*/
SceneManager.prototype.setPositionOfSelectedObjects = function(x, y, move, inputHandler, navigator, e){
	// console.log(x, y, move, inputHandler, navigator, e)
	if (this.state == this.STATE_DEFAULT_MODE){
		for (var i = 0; i < this.selectedBodies.length; i++){
			if (move){
				this.selectedBodies[i].move(x, y);
				if (inputHandler.SNAPPING_ENABLED){
					var x = parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
					var y = parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
					this.selectedBodies[i].setPosition(x, y);
				}
			}
			else{
				var px = x == null ? this.selectedBodies[i].position[0] : x;
				var py = y == null ? this.selectedBodies[i].position[1] : y;
				this.selectedBodies[i].setPosition(px, py);
			}
		}
		//particle
		for (var i = 0; i < this.selectedParticles.length; i++){
			if (move){
				this.selectedParticles[i].move(x, y) 
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedParticles[i].setPosition(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
					parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
				}
			}
			else{
				var px = x == null ? this.selectedParticles[i].position[0] : x;
				var py = y == null ? this.selectedParticles[i].position[1] : y;
				this.selectedParticles[i].setPosition(px, py);
			}
		}
		// joints
		for (var i = 0; i < this.selectedJoints.length; i++){
			if (move){
				this.selectedJoints[i].move(x, y);
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedJoints[i].setPosition(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
					parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
				}
			}
			else{
				var px = x == null ? this.selectedJoints[i].position[0] : x;
				var py = y == null ? this.selectedJoints[i].position[1] : y;
				this.selectedJoints[i].setPosition(px, py);
			}
		}
	}
	else if (this.state == this.STATE_BODY_EDIT_MODE){
		for (var i = 0; i < this.selectedShapes.length; i++){
			if (move){
				this.selectedShapes[i].move(x, y);
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedShapes[i].setPosition(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
					parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
				}
			}
			else {
				var px = x == null ? this.selectedShapes[i].position[0] : x;
				var py = y == null ? this.selectedShapes[i].position[1] : y;
				this.selectedShapes[i].setPosition(px, py);
			}
		}
	}
	// Edit Joint
	else if (this.state == this.STATE_JOINT_EDIT_MODE){

		var joint = this.selectedJoints[0];
		if (this.selectedAnchor == 0){
			if (inputHandler.SNAPPING_ENABLED){
				joint.setLocalAnchorA(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
				parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
			}
			else {
				joint.moveAnchorA(x, y);
			}
		}
		else if (this.selectedAnchor == 1){
			if (inputHandler.SNAPPING_ENABLED){
				joint.setLocalAnchorB(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
				parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
			}
			else {
				joint.moveAnchorB(x, y);
			}
		}
		else if (this.selectedAnchor == 2){
			if (joint.jointType == Joint.JOINT_WELD || joint.jointType == Joint.JOINT_REVOLUTE){
				// if (inputHandler.SHIFT_PRESSED){
					joint.changeReferenceAngle(x);
				// }
			}
			else if (joint.jointType == Joint.JOINT_PULLEY){
				if (inputHandler.SNAPPING_ENABLED){
					joint.setGroundAnchorA(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
					parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
				}
				else {
					joint.moveGroundAnchorA(x, y);
				}
			}
			else if (joint.jointType == Joint.JOINT_PRISMATIC){
				if (inputHandler.SHIFT_PRESSED){
					joint.changeReferenceAngle(x);
				}
				else {
					joint.changeLowerAngle(x);
				}
			}
			else if (joint.jointType == Joint.JOINT_WHEEL){
				if (inputHandler.SHIFT_PRESSED){
					joint.changeLowerAngle(x);
				}
			}
		}
		else if (this.selectedAnchor == 3){
			if (joint.jointType == Joint.JOINT_REVOLUTE){
				if (joint.enableLimit){
					if (inputHandler.SHIFT_PRESSED){
						joint.changeUpperAngle(x);
					}
					else {
						joint.changeLowerAngle(x);	
					}
				}
			}
			else if (joint.jointType == Joint.JOINT_PRISMATIC){
				if (joint.enableLimit){
					if (inputHandler.SHIFT_PRESSED){
						joint.upperTranslation += x;
					}
					else {
						joint.lowerTranslation += x;	
					}
				}
			}
			else if (joint.jointType == Joint.JOINT_PULLEY){
				if (inputHandler.SNAPPING_ENABLED){
					joint.setGroundAnchorB(parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0],
					parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0]);
				}
				else {
					joint.moveGroundAnchorB(x, y);
				}
			}
		}
		else if (this.selectedAnchor == 5){
		
			joint.moveFrequecyHZ(x, y);
			
		}
		return;
	}
	else if (this.state == this.STATE_SHAPE_EDIT_MODE && 
			 this.selectedShapes[0].shapeType != Shape.SHAPE_BOX && 
			 this.selectedShapes[0].shapeType != Shape.SHAPE_CIRCLE){
		for (var i = 0; i < this.selectedVertices.length; i++){
			if (move){
				this.selectedVertices[i].x = x + this.selectedVertices[i].x * move;
				this.selectedVertices[i].y = y + this.selectedVertices[i].y * move;
				
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedVertices[i].x = parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
					this.selectedVertices[i].y = parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
				}	
			}
			else {
				var px = x == null ? this.selectedVertices[i].x : x;
				var py = y == null ? this.selectedVertices[i].y : y;
				this.selectedVertices[i].x = px;
				this.selectedVertices[i].y = py;	
			}
		}
	}
	//moving image vertices
	else if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE && this.selectedBodies[0].sprites.length > 0){
		for (var i = 0; i < this.selectedVertices.length; i++){
			if (move){
				this.selectedVertices[i].x = x + this.selectedVertices[i].x * move;
				this.selectedVertices[i].y = y + this.selectedVertices[i].y * move;
				
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedVertices[i].x = parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
					this.selectedVertices[i].y = parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
				}	
			}
			else {
				var px = x == null ? this.selectedVertices[i].x : x;
				var py = y == null ? this.selectedVertices[i].y : y;
				this.selectedVertices[i].x = px;
				this.selectedVertices[i].y = py;	
			}
		}
	}
	//Image Edit Mode
	else if (this.state == this.STATE_IMAGE_EDIT_MODE){
		var sprite = this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite];
		if(navigator.checkPointInAABB(e.offsetX, e.offsetY, sprite.getBounds())){
			if (move){
				sprite.move(x, y);
			}
			else {
				var px = x == null ? this.selectedShapes[i].position[0] : x;
				var py = y == null ? this.selectedShapes[i].position[1] : y;
				sprite.setPosition(px, py);
			}
		}
	}
	//moving particle vertices
	else if (this.state == this.STATE_PARTICLE_EDIT_MODE && this.selectedParticles[0].shape.type == 2){
		for (var i = 0; i < this.selectedVertices.length; i++){
			if (move){
				this.selectedVertices[i].x = x + this.selectedVertices[i].x * move;
				this.selectedVertices[i].y = y + this.selectedVertices[i].y * move;
				
				if (inputHandler.SNAPPING_ENABLED){
					this.selectedVertices[i].x = parseInt(inputHandler.pointerWorldPos[2] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
					this.selectedVertices[i].y = parseInt(inputHandler.pointerWorldPos[3] / inputHandler.snappingData[0]) * inputHandler.snappingData[0];
				}	
			}
			else {
				var px = x == null ? this.selectedVertices[i].x : x;
				var py = y == null ? this.selectedVertices[i].y : y;
				this.selectedVertices[i].x = px;
				this.selectedVertices[i].y = py;	
			}
		}
	}
};

/**
	*
	* params sx,	 			x scale, null if only y scale is to be set (use null only when scale = 0)
	* params sy,    			y scale, null if only x scale is to be set (use null only when scale = 0)
	* params scale, 			1 for scaling, 0 for setting scale
	* params inputHandler, 	information about pivot mode and snapping data
*/
SceneManager.prototype.setScaleOfSelectedObjects = function(_sx, _sy, scale, inputHandler, navigator, e){
	var sx = _sx;
	var sy = _sy;
	if(inputHandler.LOCK_SCALE_ENABLED){
		sx = Math.abs(_sx + _sy) / 2;
		sy = Math.abs(_sx + _sy) / 2;

	}
	else{
		sx = _sx;
		sy = _sy;
	}
	if (this.state == this.STATE_DEFAULT_MODE){
		if (inputHandler.pivotMode == 3){								// InputHandler.PIVOT_LOCAL_MODE
			// bodies
			for (var i = 0; i < this.selectedBodies.length; i++){
				if (scale){
					this.selectedBodies[i].scale(sx, sy);
				}
				else {
					var sclx = sx == null ? this.selectedBodies[i].scaleXY[0] : sx;
					var scly = sy == null ? this.selectedBodies[i].scaleXY[1] : sy;
					this.selectedBodies[i].setScale(sclx, scly);	
				}
			}
			// joints
			for (var i = 0; i < this.selectedJoints.length; i++){
				if (scale){
					this.selectedJoints[i].scale(sx, sy);
				}
				else{
					var sclx = sx == null ? this.selectedJoints[i].scaleXY[0] : sx;
					var scly = sy == null ? this.selectedJoints[i].scaleXY[1] : sy;
					this.selectedJoints[i].setScale(sclx, scly);
				}
			}
			//particles
			for (var i = 0; i < this.selectedParticles.length; i++){
				if (scale){
					this.selectedParticles[i].scale(sx, sy);
				}
				else {
					// var sclx = sx == null ? this.selectedParticles[i].scaleXY[0] : sx;
					// var scly = sy == null ? this.selectedParticles[i].scaleXY[1] : sy;
					// this.selectedParticles[i].setScale(sclx, scly);	
					console.log("else {...}")
				}
			}
			return;
		}
		
		// if selection center is used as pivot (selection center)
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedBodies.length; i++){
			pivot[0] += this.selectedBodies[i].position[0];
			pivot[1] += this.selectedBodies[i].position[1];
		}
		for (var i = 0; i < this.selectedJoints.length; i++){
			pivot[0] += this.selectedJoints[i].position[0];
			pivot[1] += this.selectedJoints[i].position[1];
		}
		pivot[0] /= (this.selectedBodies.length + this.selectedJoints.length);
		pivot[1] /= (this.selectedBodies.length + this.selectedJoints.length);
		
		for (var i = 0; i < this.selectedBodies.length; i++){
			if (scale){
				this.selectedBodies[i].scale(sx, sy, pivot[0], pivot[1]);
			}
			else {
				var sclx = sx == null ? this.selectedBodies[i].scaleXY[0] : sx;
				var scly = sy == null ? this.selectedBodies[i].scaleXY[1] : sy;
				this.selectedBodies[i].setScale(sclx, scly, pivot[0], pivot[1]);	
			}
		}
		// joints
		for (var i = 0; i < this.selectedJoints.length; i++){
			if (scale){
				this.selectedJoints[i].scale(sx, sy, pivot[0], pivot[1]);
			}
			else{
				var sclx = sx == null ? this.selectedJoints[i].scaleXY[0] : sx;
				var scly = sy == null ? this.selectedJoints[i].scaleXY[1] : sy;
				this.selectedJoints[i].setScale(sclx, scly, pivot[0], pivot[1]);
			}
		}
	}
	else if (this.state == this.STATE_BODY_EDIT_MODE){
		if (inputHandler.pivotMode == 3){
			for (var i = 0; i < this.selectedShapes.length; i++){
				if (scale){
					this.selectedShapes[i].scale(sx, sy);	
				}
				else {
					var sclx = sx == null ? this.selectedShapes[i].scaleXY[0] : sx;
					var scly = sy == null ? this.selectedShapes[i].scaleXY[1] : sy;
					this.selectedShapes[i].setScale(sclx, scly);
				}
			}
			return;
		}
		
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedShapes.length; i++){
			pivot[0] += this.selectedShapes[i].position[0];
			pivot[1] += this.selectedShapes[i].position[1];
		}
		pivot[0] /= this.selectedShapes.length;
		pivot[1] /= this.selectedShapes.length;
		
		for (var i = 0; i < this.selectedShapes.length; i++){
			if (scale){
				this.selectedShapes[i].scale(sx, sy, pivot[0], pivot[1]);
			}
			else {
				var sclx = sx == null ? this.selectedShapes[i].scaleXY[0] : sx;
				var scly = sy == null ? this.selectedShapes[i].scaleXY[1] : sy;
				this.selectedShapes[i].setScale(sclx, scly, pivot[0], pivot[1]);
			}
		}
	}
	else if (	this.state == this.STATE_SHAPE_EDIT_MODE && 
		this.selectedShapes[0].shapeType != Shape.SHAPE_BOX && 
		this.selectedShapes[0].shapeType != Shape.SHAPE_CIRCLE){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];	
			vertex.move(-pivot[0], -pivot[1]);
			var sclx = sx == null ? 1 : sx;
			var scly = sy == null ? 1 : sy;
			vertex.x *= sclx;
			vertex.y *= scly;
			vertex.move(pivot[0], pivot[1]);
		}
	}
	else if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE && this.selectedBodies[0].sprites.length > 0){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];	
			vertex.move(-pivot[0], -pivot[1]);
			var sclx = sx == null ? 1 : sx;
			var scly = sy == null ? 1 : sy;
			vertex.x *= sclx;
			vertex.y *= scly;
			vertex.move(pivot[0], pivot[1]);
		}
	}
	else if (this.state == this.STATE_IMAGE_EDIT_MODE){
		var sprite = this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite];
		if(navigator.checkPointInAABB(e.offsetX, e.offsetY, sprite.getBounds())){
			if (scale){
				sprite.scale(sx, sy);
			}
			else {
				var sclx = sx == null ? this.selectedBodies[i].scaleXY[0] : sx;
				var scly = sy == null ? this.selectedBodies[i].scaleXY[1] : sy;
				sprite.setScale(sclx, scly);	
			}
		}
	}
	else if (this.state == this.STATE_PARTICLE_EDIT_MODE && this.selectedParticles[0].shape.type == 2){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];	
			vertex.move(-pivot[0], -pivot[1]);
			var sclx = sx == null ? 1 : sx;
			var scly = sy == null ? 1 : sy;
			vertex.x *= sclx;
			vertex.y *= scly;
			vertex.move(pivot[0], pivot[1]);
		}
	}
};

/**
	*
	* params angle,	 		rotation
	* params rotate,    	1 for rotating, 0 for setting rotation (do not use rotate = 0 when editing vertices)
	* params inputHandler, 	information about pivot mode and snapping data
*/
SceneManager.prototype.setRotationOfSelectedObjects = function(angle, rotate, inputHandler, navigator, e){
	if (this.state == this.STATE_DEFAULT_MODE){
		if (inputHandler.pivotMode == 3){								// InputHandler.PIVOT_LOCAL_MODE
			for (var i = 0; i < this.selectedBodies.length; i++){
				if (rotate){
					this.selectedBodies[i].rotate(angle);
				}
				else {
					this.selectedBodies[i].setRotation(angle);
				}
			}
			//for particles
			for (var i = 0; i < this.selectedParticles.length; i++){
				if (rotate){
					this.selectedParticles[i].rotate(angle);
				}
				else {
					// this.selectedParticles[i].setRotation(angle);
					console.log("SceneManager : else{...}")
				}
			}
			
			return;
		}
		
		// if selection center is used as pivot (selection center)
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedBodies.length; i++){
			pivot[0] += this.selectedBodies[i].position[0];
			pivot[1] += this.selectedBodies[i].position[1];
		}
		pivot[0] /= this.selectedBodies.length;
		pivot[1] /= this.selectedBodies.length;
		//Bodies
		for (var i = 0; i < this.selectedBodies.length; i++){
			if (rotate){
				this.selectedBodies[i].rotate(angle, pivot[0], pivot[1]);
			}
			else{
				this.selectedBodies[i].setRotation(angle, pivot[0], pivot[1]);	
			}
		}
		//Joints
		for (var i = 0; i < this.selectedJoints.length; i++){
			if (rotate){
				if(this.selectedBodies.length > 0) this.selectedJoints[i].rotate(angle, pivot[0], pivot[1]);
			}
		}
	}
	else if (this.state == this.STATE_BODY_EDIT_MODE){
		if (inputHandler.pivotMode == 3){
			for (var i = 0; i < this.selectedShapes.length; i++){
				if (rotate){
					this.selectedShapes[i].rotate(angle);	
				}
				else {
					this.selectedShapes[i].setRotation(angle);
				}
				
			}
			return;
		}
		
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedShapes.length; i++){
			pivot[0] += this.selectedShapes[i].position[0];
			pivot[1] += this.selectedShapes[i].position[1];
		}
		pivot[0] /= this.selectedShapes.length;
		pivot[1] /= this.selectedShapes.length;
		
		for (var i = 0; i < this.selectedShapes.length; i++){
			if (rotate){
				this.selectedShapes[i].rotate(angle, pivot[0], pivot[1]);
			}
			else {
				this.selectedShapes[i].setRotation(angle, pivot[0], pivot[1]);
			}
		}
	}
	else if (	this.state == this.STATE_SHAPE_EDIT_MODE && 
		this.selectedShapes[0].shapeType != Shape.SHAPE_BOX && 
		this.selectedShapes[0].shapeType != Shape.SHAPE_CIRCLE){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];
			var x = vertex.x - pivot[0];
			var y = vertex.y - pivot[1];
			var newAngle = angle + rotate * Math.atan2(y, x) * 180 / Math.PI;
			var length = Math.pow(x * x + y * y, 0.5);
			vertex.x = pivot[0] + length * Math.cos(newAngle * Math.PI / 180);
			vertex.y = pivot[1] + length * Math.sin(newAngle * Math.PI / 180);
		}
	}
	else if (this.state == this.STATE_IMAGE_VERTEX_EDIT_MODE && this.selectedBodies[0].sprites.length > 0){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];
			var x = vertex.x - pivot[0];
			var y = vertex.y - pivot[1];
			var newAngle = angle + rotate * Math.atan2(y, x) * 180 / Math.PI;
			var length = Math.pow(x * x + y * y, 0.5);
			vertex.x = pivot[0] + length * Math.cos(newAngle * Math.PI / 180);
			vertex.y = pivot[1] + length * Math.sin(newAngle * Math.PI / 180);
		}
	}	
	else if (this.state == this.STATE_IMAGE_EDIT_MODE){
		var sprite = this.selectedBodies[0].sprites[this.selectedBodies[0].selectedSprite];
		if(navigator.checkPointInAABB(e.offsetX, e.offsetY, sprite.getBounds())){
			if (rotate){
				sprite.rotate(angle);	
			}
			else {
				sprite.setRotation(angle);
			}
		}
	}
	else if (this.state == this.STATE_PARTICLE_EDIT_MODE && this.selectedParticles[0].shape.type == 2){
		if (this.selectedVertices.length < 1)
		return;
		
		// here we always use selection center pivot mode
		var pivot = [0, 0];
		for (var i = 0; i < this.selectedVertices.length; i++){
			pivot[0] += this.selectedVertices[i].x;
			pivot[1] += this.selectedVertices[i].y;
		}
		pivot[0] /= this.selectedVertices.length;
		pivot[1] /= this.selectedVertices.length;
		
		for (var i = 0; i < this.selectedVertices.length; i++){
			var vertex = this.selectedVertices[i];
			var x = vertex.x - pivot[0];
			var y = vertex.y - pivot[1];
			var newAngle = angle + rotate * Math.atan2(y, x) * 180 / Math.PI;
			var length = Math.pow(x * x + y * y, 0.5);
			vertex.x = pivot[0] + length * Math.cos(newAngle * Math.PI / 180);
			vertex.y = pivot[1] + length * Math.sin(newAngle * Math.PI / 180);
		}
	}
};

/* 
	*
	* params delta, 		array for x and y axis manipulation
	* params inputHandler, 	info about pivot mode and snapping data
*/
SceneManager.prototype.transformSelection = function(delta, inputHandler, navigator, e){
	if (inputHandler.transformTool == 5){					// scale
		if (Math.abs(delta[0]) >= 3 * Math.abs(delta[1])){
			delta[1] = 0;
		}
		else if (Math.abs(delta[1]) >= 3 * Math.abs(delta[0])){
			delta[0] = 0;
		}
		this.setScaleOfSelectedObjects(1 + delta[0] / 80, 1 - delta[1] / 80, 1, inputHandler, navigator, e);
	}
	else if (inputHandler.transformTool == 6){				// rotate
		this.setRotationOfSelectedObjects(delta[0], 1, inputHandler, navigator, e);
		
	}
	else if (inputHandler.transformTool == 7){				// translate
		this.setPositionOfSelectedObjects(delta[0], delta[1], 1, inputHandler, navigator, e);
	}
};

SceneManager.prototype.addBody = function(body){
	this.bodies.push(body);
};
//particles
SceneManager.prototype.addParticle = function(particle){
	this.particles.push(particle);
};

/**
	*
	* params shapeType, shape to start with (use polygon or chain for editing it)
	* params asCircle,  1 if circle shape is to be generated, otherwise defaults to box (use only when polygon or chain shape is created)
	* creates new body and adds it to the scene
*/
SceneManager.prototype.createBody = function(shapeType, ps = [0, 0]){
	var body = new Body();
	var shape = new Shape(shapeType);
	body.addShape(shape);
	body.setPosition(ps[0], ps[1]);
	this.addBody(body);
};

//drop sprite

SceneManager.prototype.dropSprite = function(x, y, src, dir){
	var body = new Body();
	body.setPosition(x, y);
	body.setSprite(src, dir + '\\' + src)
	body.selectedSprite = 0;
	this.addBody(body);
};

//Part

SceneManager.prototype.createParticle = function(type, ps = [0, 0]){
	var p = new Particle(type);
	p.setPosition(ps[0], ps[1]);
	this.addParticle(p)
}

/**
	*
	* params shapeType, shape to be created (use polygon or chain for editing it)
	* params asCircle,  1 if circle shape is to be generated, otherwise defaults to box (use only when polygon or chain shape is created)
	* creates new shape and adds it to the selected body
*/
SceneManager.prototype.createShape = function(shapeType, ps = [0, 0]){
	if (this.state == this.STATE_BODY_EDIT_MODE || this.state == this.STATE_LOCK_MODE){
		var shape = new Shape(shapeType);
		this.selectedBodies[0].addShape(shape, true);
		shape.setPosition(ps[0], ps[1]);
	}
	else{
	    Editor.alert("Shapes can be created only when editing body");
		return "Shapes can be created only when editing body";
	}


};

/**
	* params points, array of points ([pos_x, pox_y])
	* create a new polygon shape with given vertices
*/
SceneManager.prototype.createShapeFromPoints = function(points){
	if (this.state != this.STATE_BODY_EDIT_MODE){
		return "shapes can be created only when editing body";
	}
	
	var shape = new Shape(Shape.SHAPE_NONE);
	for (var i = 0; i < points.length; i++){
		var vertex = new Vertex(points[i][0], points[i][1], 10, 10);
		shape.vertices.push(vertex);
	}
	
	// remove overlapping vertices
	for (var i = 1; i < shape.vertices.length; i++){
		var vertex = shape.vertices[i];
		for (var j = 0; j < shape.vertices.length; j++){
			var vertexToCheck = shape.vertices[j];
			if (vertexToCheck != vertex){
				var dx = vertex.x - vertexToCheck.x;
				var dy = vertex.y - vertexToCheck.y;
				if (dx * dx + dy * dy < 120){
					shape.removeVertexGivenIndex(j);
				}
			}
		}
	}
	
	this.selectedBodies[0].addShape(shape, true);
};

// removes body from the scene
SceneManager.prototype.removeBody = function(body){
	for (var i = 0; i < this.bodies.length; i++){
		if (this.bodies[i] == body){
			if (i == 0){
				this.bodies.shift();
			}
			else if (i == this.bodies.length - 1){
				this.bodies.pop();
			}
			else {
				this.bodies.splice(i, 1);
			}
			break;
		}
	}
};
// removes particle from the scene
SceneManager.prototype.removeParticle = function(p){
	for (var i = 0; i < this.particles.length; i++){
		if (this.particles[i] == p){
			if (i == 0){
				this.particles.shift();
			}
			else if (i == this.particles.length - 1){
				this.particles.pop();
			}
			else {
				this.particles.splice(i, 1);
			}
			break;
		}
	}
};

SceneManager.prototype.addJoint = function(joint){
	this.joints.push(joint);
};

/**
	*
	* params jointType
	* creates a new joint
*/
SceneManager.prototype.createJoint = function(jointType){
	if (this.selectedBodies.length == 2 && (this.state == this.STATE_DEFAULT_MODE || this.state == this.STATE_LOCK_MODE) && jointType != Joint.JOINT_MOUSE && jointType != Joint.JOINT_AREA){
		var joint = new Joint(jointType);
		joint.bodyA = this.selectedBodies[0];
		joint.bodyB = this.selectedBodies[1];
		joint.setLocalAnchorA(joint.bodyA.position[0], joint.bodyA.position[1]);
		joint.setLocalAnchorB(joint.bodyB.position[0], joint.bodyB.position[1]);
		if (jointType == Joint.JOINT_REVOLUTE) {
			joint.setLocalAnchorA(joint.bodyB.position[0], joint.bodyB.position[1]);
			//joint.position = [(joint.bodyA.position[0] + joint.bodyB.position[0]) / 2, (joint.bodyA.position[1] + joint.bodyB.position[1]) / 2];
		}
		else if (jointType == Joint.JOINT_WHEEL) {
			joint.setLocalAnchorA(joint.bodyB.position[0], joint.bodyB.position[1]);
		}
		else if (jointType == Joint.JOINT_WELD) {
			joint.setLocalAnchorA(joint.bodyB.position[0], joint.bodyB.position[1]);
		}
		else if (jointType == Joint.JOINT_PRISMATIC) {
			joint.setLocalAnchorA(joint.bodyB.position[0], joint.bodyB.position[1]);
		}
		else if (jointType == Joint.JOINT_PULLEY){
			joint.setGroundAnchorA(joint.bodyA.position[0], joint.bodyA.position[1] - 100);
			joint.setGroundAnchorB(joint.bodyB.position[0], joint.bodyB.position[1] - 100);
		}
		else if (jointType == Joint.JOINT_GEAR){
			if (this.selectedJoints.length == 2 && ((this.selectedJoints[0].jointType == Joint.JOINT_REVOLUTE &&
				this.selectedJoints[1].jointType == Joint.JOINT_REVOLUTE) || (this.selectedJoints[0].jointType == Joint.JOINT_PRISMATIC &&
				this.selectedJoints[1].jointType == Joint.JOINT_PRISMATIC) || (this.selectedJoints[0].jointType == Joint.JOINT_PRISMATIC &&
				this.selectedJoints[1].jointType == Joint.JOINT_REVOLUTE) || (this.selectedJoints[0].jointType == Joint.JOINT_REVOLUTE &&
			this.selectedJoints[1].jointType == Joint.JOINT_PRISMATIC))){
			joint.joint1 = this.selectedJoints[0];
			joint.joint2 = this.selectedJoints[1];
			}
			else {
				Editor.alert("select 2 revolute/prismatic joints to create gear joint");
				return "select 2 revolute/prismatic joints to create gear joint";		
			}
		}
		else if (jointType == Joint.JOINT_ROPE){
			var lengthVec = [joint.localAnchorA[0] - joint.localAnchorB[0], joint.localAnchorA[1] - joint.localAnchorB[1]];
			joint.frequencyHZ = (Math.pow(lengthVec[0] * lengthVec[0] + lengthVec[1] * lengthVec[1], 0.5));
		}
		if (jointType != Joint.JOINT_REVOLUTE){
			joint.position = [(joint.localAnchorA[0] + joint.localAnchorB[0]) / 2, (joint.localAnchorA[1] + joint.localAnchorB[1]) / 2];
		}
		else {
			joint.position = [(joint.bodyA.position[0] + joint.bodyB.position[0]) / 2, (joint.bodyA.position[1] + joint.bodyB.position[1]) / 2];
		}
		this.addJoint(joint);
	}
	else if(this.selectedBodies.length == 1 && this.state == this.STATE_DEFAULT_MODE && jointType == Joint.JOINT_MOUSE){
		//yeah mouse joint!!!
		var joint = new Joint(jointType);
		joint.bodyA = new Body();
		joint.bodyB = this.selectedBodies[0];
		joint.setLocalAnchorA(joint.bodyB.position[0], joint.bodyB.position[1]);
		joint.setLocalAnchorB(joint.bodyB.position[0], joint.bodyB.position[1]);
		joint.maxForce = 100;
		this.addJoint(joint);
	}
	else if(jointType == Joint.JOINT_AREA && this.selectedBodies.length > 2){
		//area joint!!!
		var joint = new Joint(jointType);
		joint.bodies = this.selectedBodies;
		this.addJoint(joint);	
	}
	else {
		if(jointType == Joint.JOINT_MOUSE){
			Editor.alert("just select 1 bodies to create a mouse joint");
			return "just select 1 bodies to create a mouse joint";
		}
		else if(jointType == Joint.JOINT_AREA){
			Editor.alert("You cannot create an area joint with less than 3 bodies");
			return "You cannot create an area joint with less than 3 bodies";
		}
		else{
			Editor.alert("select 2 bodies to create a joint");
			return "select 2 bodies to create a joint";	
		}
	}
};

// removes joint from the scene
SceneManager.prototype.removeJoint = function(joint){
	for (var i = 0; i < this.joints.length; i++){
		if (this.joints[i] == joint){
			if (i == 0){
				this.joints.shift();
			}
			else if (i == this.bodies.length - 1){
				this.joints.pop();
			}
			else {
				this.joints.splice(i, 1);
			}
			break;
		}
	}
};

SceneManager.prototype.getSelectedShapesBody = function(){
	
	var b;
	
	for(i=0;i<this.selectedBodies.length;i++){
		
		for(j=0;j<this.selectedShapes.length;j++){
			
			if(this.selectedBodies[i].shapes[j].length == this.selectedShapes[j].length){
				b = this.selectedBodies[i];	
			}
			
		}
		
		
	}
	
	return b
	
}

SceneManager.prototype.reverseSelectedShapes = function(){
	
	if(this.selectedShapes.length>0){
		
		for(i=0;i<this.selectedShapes.length;i++){
			
			this.selectedShapes[i].reverse(this.getSelectedShapesBody())
			
		}
		}else{
		
		Editor.alert("No Shape Selected")
		
	}
	
}


SceneManager.prototype.cloneImages = function(newdir, olddir){
	for (var i = 0; i < this.bodies.length; i++){
		for(j = 0; j < this.bodies[i].sprites.length; j++){
			var sprite = this.bodies[i].sprites[j];
			var copy = path.join(olddir, sprite.src);
			var past = path.join(newdir, sprite.src);
			fs.copyFileSync(copy, past);
		}
	}
	
}


// export the scene image
SceneManager.prototype.exportSpritesImages = function(__dir){	
	for (var i = 0; i < this.bodies.length; i++){
		var body = this.bodies[i];
		for(j = 0; j < this.bodies[i].sprites.length; j++){
			var sprite = this.bodies[i].sprites[j];
			var imageData = sprite.exportImageData(body);
			var data = imageData.replace(/^data:image\/png;base64,/, "");
			var fileName = 'body_' + i + '_' + j + '.png';
			var _path = path.join(__dir, fileName);
			fs.writeFileSync(__path, data, {encoding: 'base64'});	
		}
	}
}



// export the scene
SceneManager.prototype.sortSpritesByZIndex = function(array){
	var arr = [];
	array.sort((a, b) => a.zIndex - b.zIndex);

	array.forEach(function(e){
		arr.push(e);
	});
	
	return arr
}


SceneManager.prototype.exportScene = function(){
	var world = {
		bodies    : [],
		joints    : [],
		particles : [],
		world     : this.world
	}
	//push bodies
	for (var i = 0; i < this.bodies.length; i++){
		world.bodies.push(this.bodies[i].toPhysics());
	}
	//push joints
	for (var i = 0; i < this.joints.length; i++){
		if (this.joints[i].jointType == Joint.JOINT_DISTANCE){
			var lengthVec = [this.joints[i].localAnchorA[0] - this.joints[i].localAnchorB[0], this.joints[i].localAnchorA[1] - this.joints[i].localAnchorB[1]];
			this.joints[i].setLength(Math.pow(lengthVec[0] * lengthVec[0] + lengthVec[1] * lengthVec[1], 0.5));
		}
		world.joints.push(this.joints[i].toPhysics(this.bodies, this.joints));
	}
	//push particles
	for (var i = 0; i < this.particles.length; i++){
		world.particles.push(this.particles[i].toPhysics());
	}
	
	return world
}


SceneManager.prototype.exportSprites = function(trimImage = false){
	var sprites = [];
	
	for (var i = 0; i < this.bodies.length; i++){
		for(j = 0; j < this.bodies[i].sprites.length; j++){
			var sprite = this.bodies[i].sprites[j].export(this.bodies[i], i);
			if(trimImage) sprite.src = 'body_' + i + '_' + j + '.png';
			sprites.push(sprite);
		}
	}
	
	return sprites
}


SceneManager.prototype.exportWorld = function(trimImage){
	var world = {
		bodies    : [],
		joints    : [],
		particles : [],
		sprites   : [],
		world     : this.world
	};
	
	for (var i = 0; i < this.bodies.length; i++){
		world.bodies.push(this.bodies[i].toPhysics());
		for(j = 0; j < this.bodies[i].sprites.length; j++){
			var sprite = this.bodies[i].sprites[j].export(this.bodies[i], i);
			if(trimImage) sprite.src = 'body_' + i + '_' + j + '.png';
			world.sprites.push(sprite);
		}
	}
	//arranging sprites by their zIndex
	this.sortSpritesByZIndex(world.sprites);
	
	for (var i = 0; i < this.joints.length; i++){
		if (this.joints[i].jointType == Joint.JOINT_DISTANCE){
			var lengthVec = [this.joints[i].localAnchorA[0] - this.joints[i].localAnchorB[0], this.joints[i].localAnchorA[1] - this.joints[i].localAnchorB[1]];
			this.joints[i].setLength(Math.pow(lengthVec[0] * lengthVec[0] + lengthVec[1] * lengthVec[1], 0.5));
		}
		world.joints.push(this.joints[i].toPhysics(this.bodies, this.joints));
	}
	//particles
	for (var i = 0; i < this.particles.length; i++){
		world.particles.push(this.particles[i].toPhysics());
	}

	return world;
};

// exports the seleted object(s)
SceneManager.prototype.exportSelection = function(){
	if (this.state == this.STATE_DEFAULT_MODE){
		var array = {
			bodies: []
		};
		if (this.selectedBodies.length == 1){
			var body = this.selectedBodies[0];
			var position = [body.position[0], body.position[1]];
			body.setPosition(0, 0);
			array.bodies.push(body.toPhysics());
			body.move(position[0], position[1]);
			return array;
		}
		for (var i = 0; i < this.selectedBodies.length; i++){
			array.bodies.push(this.selectedBodies[i].toPhysics());
		}
		return array;
	}
	else if (this.state == this.STATE_BODY_EDIT_MODE){
		var array = {
			fixtures: []
		};
		if (this.selectedShapes.length == 1){
			var shape = this.selectedShapes[0];
			var position = [shape.position[0], shape.position[1]];
			shape.setPosition(0, 0);
			array.fixtures.push(shape.toPhysics(0, 0));
			shape.move(position[0], position[1]);
			return array;
		}
		for (var i = 0; i < this.selectedShapes.length; i++){
			array.fixtures.push(this.selectedShapes[i].toPhysics(0, 0));
			return array;
		}
	}
	console.log("only body and shapes can be exported");
};

SceneManager.prototype.saveScene = function(){
	for (var i = 0; i < this.joints.length; i++){
		this.joints[i].bodyIndexA = this.bodies.indexOf(this.joints[i].bodyA);
		this.joints[i].bodyIndexB = this.bodies.indexOf(this.joints[i].bodyB);
		
		if (this.joints[i].jointType == Joint.JOINT_GEAR){
			this.joints[i].jointIndex1 = this.joints.indexOf(this.joints[i].joint1);
			this.joints[i].jointIndex2 = this.joints.indexOf(this.joints[i].joint2);				
		}
		else if(this.joints[i].jointType == Joint.JOINT_AREA){ 
			this.joints[i].setBodiesIndex(this.bodies) 
		}
	}

	
	var scene = {
		bodies    : [],
		joints    : [],
		particles : [],
		world     : this.world,
		scripts   : this.scripts
	};
	scene.bodies = clone_obj(this.bodies);
	scene.joints = clone_obj(this.joints);
	scene.particles = clone_obj(this.particles);

	
	
	for (var i = 0; i < scene.joints.length; i++){
	    var j =  scene.joints[i];
		if(j.jointType == Joint.JOINT_AREA){
			delete j.bodies;
		}
		else if(j.jointType == Joint.JOINT_GEAR){
			delete j.joint1;
			delete j.joint2;
			delete j.bodyA;
			delete j.bodyB;		
		}
		else{
			delete j.bodyA;
			delete j.bodyB;		
		}

	}
	
	/*for (var i = 0; i < scene.bodies.length; i++){
		for (var j = 0; j < scene.bodies[i].sprites.length; j++){
			
			scene.bodies[i].sprites[j].data = "";
			
		}	
	}*/
	
	return scene;
};

SceneManager.prototype.newScene = function(){
	this.state = this.STATE_DEFAULT_MODE;
	this.world     = new World;
	this.bodies    = [];
	this.joints    = [];
	this.particles = [];
	this.scripts = [];
	
	this.selectedBodies = [];
	this.selectedShapes = [];
	this.selectedJoints = [];
	this.selectedVertices = [];
	this.selectedParticles = [];
	this.resetSceneInfo();
	this.info.dateCreated = new Date().getTime();
	this.info.lastModified = new Date().getTime();
	
	// this.scripts.push(new Script(atob('KGZ1bmN0aW9uKHNjZW5lLCByZWYpew0KCQ0KCXRoaXMuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7DQoJCQ0KCX0NCgkNCgl0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKHgsIHksIGUpIHsNCgkJDQoJfQ0KCQ0KCXRoaXMubW91c2Vkb3duID0gZnVuY3Rpb24oeCwgeSwgZSkgew0KCQkNCgl9DQoJDQoJdGhpcy5tb3VzZWxlYXZlID0gZnVuY3Rpb24oeCwgeSwgZSkgew0KCQkNCgl9DQp9KQ'), 'javascript'))
};

SceneManager.prototype.loadScene = function(scene){
	//bodies
	for (var i = 0; i < scene.bodies.length; i++){
		this.addBody(loadBody(scene.bodies[i]));
	}
	//particles
	for (var i = 0; i < scene.particles.length; i++){
		this.addParticle(loadParticle(scene.particles[i]));
	
	}
	//joints
	for (var i = 0; i < scene.joints.length; i++){
		this.addJoint(loadJoint(scene.joints[i], this.bodies, this.joints));
	}
	//world
	this.world = loadWorld(scene.world);
	
	for (s of scene.scripts) {
		this.scripts.push(s)
	}
};

function cloneArray(obj){
	if (obj instanceof Array) {
		copy = [];
	for (var i = 0, len = obj.length; i < len; i++) {
		copy[i] = clone(obj[i]);
	}
		return copy;
	}
}

function loadVertex(obj){
	var vertices = [];
	for (var i = 0; i < obj.length; i++){
		var vertex = new Vertex();
		vertex.x = obj[i].x;
		vertex.y = obj[i].y;
		vertex.width = obj[i].width;
		vertex.height = obj[i].height;
		vertices.push(vertex);
	}
	return vertices;
}

function loadShape(obj){
	var shapes = [];
	for (var i = 0; i < obj.length; i++){
		var shape = new Shape(Shape.SHAPE_NONE);
		shape.shapeType = obj[i].shapeType;
		shape.position = cloneArray(obj[i].position);						// position
		shape.scaleXY = cloneArray(obj[i].scaleXY);						// scale
		shape.rotation = obj[i].rotation;							// only for editor purpose
		shape.vertices = loadVertex(obj[i].vertices);
		shape.bounds = cloneArray(obj[i].bounds);					// AABB for selecting
		shape.centroid = cloneArray(obj[i].centroid);						// centroid for shape
		// fixture properties
		shape.friction = obj[i].friction;
		shape.restitution = obj[i].restitution;
		shape.density = obj[i].density;
		shape.isSensor = obj[i].isSensor;
		shape.maskBits = obj[i].maskBits;
		shape.categoryBits = obj[i].categoryBits;
		shape.groupIndex = obj[i].groupIndex;
		
		shape.userData = obj[i].userData;
		
		if (shape.shapeType == Shape.SHAPE_BOX){
			shape.width = obj[i].width;
			shape.height = obj[i].height;
		}
		else if (shape.shapeType == Shape.SHAPE_CIRCLE){
			shape.radius = obj[i].radius;
		}
		
		shapes.push(shape);
	}
	return shapes;
}

function loadWorld(obj){
	var world = new World();
	world.gravity = obj.gravity;
	world.allowSleep = obj.allowSleep;
	world.debugDraw = obj.debugDraw;
	world.drawScale = obj.drawScale;
	world.drawSprites = obj.drawSprites;
	
	return world
}

function loadBody(obj){
	var body = new Body();
	body.id = obj.id;
	body.name = obj.name;
	body.userData = obj.userData;

	body.shapes = loadShape(obj.shapes);
	body.position = cloneArray(obj.position);
	body.scaleXY = cloneArray(obj.scaleXY);
	body.rotation = obj.rotation;
	body.bounds = cloneArray(obj.bounds);

	body.bodyType = obj.bodyType;
	body.isBullet = obj.isBullet;
	body.isFixedRotation = obj.isFixedRotation;
	body.linearDamping = obj.linearDamping;
	body.angularDamping = obj.angularDamping;
	body.linearVelocity = obj.linearVelocity;
	body.angularVelocity = obj.angularVelocity
	body.isAwake = obj.isAwake;
	body.isActive = obj.isActive;
	body.gravityScale = obj.gravityScale;

	body.sprites = [];


	for(i = 0; i < obj.sprites.length; i++){
		var so = obj.sprites[i];
		var s = new Sprite();
		s.width = so.width;
		s.height = so.height;
		s.x = so.x;
		s.y = so.y;
		s.vertices = [];
			for(c = 0; c < so.vertices.length; c ++){
				var v = new Vertex(so.vertices[c].x, so.vertices[c].y , so.vertices[c].width, so.vertices[c].height);
				s.vertices.push(v)
			}
		s.rotation = so.rotation;
		s.src = so.src;
		var src = path.join(Editor.currentFile.dir, so.src);
		if(fs.existsSync(src)){
			s.sprite = new Image();
			s.sprite.src = src;
		}
		else{
			s.sprite = null
		}
		s.flip = so.flip;
		s.zIndex = so.zIndex;
		s.opacity = so.opacity;
		s.hasLoaded = true;
		body.sprites.push(s)

	}

	return body;
}

function loadParticleShape(obj){

	var ps = new particleShape(obj.type);
	if(obj.type == Particle.SHAPE_BOX){
		ps.height = obj.height;
		ps.width = obj.width;
	}
	else if(obj.type == Particle.SHAPE_CIRCLE){
		ps.radius = obj.radius;
	}
	else if(obj.type == Particle.SHAPE_POLYGON){
		ps.vertices = [];
		for(i = 0; i < obj.vertices.length; i++){
			var v = obj.vertices[i];
			ps.vertices.push(new Vertex(v.x, v.y, v.width, v.height))
		}
	}	

	return ps
	
}
//particles
function loadParticle(obj){
	var p = new Particle()
	p.name = obj.name;
	p.bounds = obj.bounds;
	p.userData = obj.userData;	
	p.rotation = obj.rotation;
	p.angularVelocity = obj.angularVelocity;
	p.color = obj.color;
	p.flags = obj.flags;
	p.lifetime = obj.lifetime;
	p.linearVelocity = obj.linearVelocity;
	p.position = obj.position;
	p.strength = obj.strength;
	p.stride = obj.stride;
	p.radius = obj.radius;
	p.shape = loadParticleShape(obj.shape);

	return p
}
function loadJoint(obj, bodies, joints){
	var joint = new Joint();
	joint.id = obj.id;
	joint.name = obj.name;
	joint.userData = obj.userData;
	joint.position = cloneArray(obj.position);
	joint.scaleXY = cloneArray(obj.scaleXY);

	joint.jointType = obj.jointType;	
	joint.collideConnected = obj.collideConnected;
	joint.localAnchorA = cloneArray(obj.localAnchorA);
	joint.localAnchorB = cloneArray(obj.localAnchorB);
	joint.bodyA = bodies[obj.bodyIndexA];
	joint.bodyB = bodies[obj.bodyIndexB];

	if (joint.jointType == Joint.JOINT_DISTANCE){
		joint.length 		= obj.length;
		joint.frequencyHZ 	= obj.frequencyHZ;
		joint.dampingRatio 	= obj.dampingRatio;
	}
	else if (joint.jointType == Joint.JOINT_MOUSE){
		joint.maxForce 		= obj.maxForce;
		joint.length 		= obj.length;
		joint.frequencyHZ 	= obj.frequencyHZ;
		joint.dampingRatio 	= obj.dampingRatio;
	}
	else if (joint.jointType == Joint.JOINT_WELD){
		joint.referenceAngle = obj.referenceAngle;
	}
	else if (joint.jointType == Joint.JOINT_FRICTION){
		joint.maxForce = obj.maxForce;
		joint.maxTorque = obj.maxTorque;
	}
	else if (joint.jointType == Joint.JOINT_AREA){
		joint.frequencyHZ 	= obj.frequencyHZ;
		joint.dampingRatio 	= obj.dampingRatio;
		joint.bodies 	= [];
		for(n = 0; n < obj.bodiesIndex.length; n++){
			joint.bodies.push(bodies[obj.bodiesIndex[n]]);
		}
		delete joint.localAnchorA
		delete joint.localAnchorB
		delete joint.bodyA
		delete joint.bodyB
	}
	else if (joint.jointType == Joint.JOINT_MOTOR){
		joint.maxForce = obj.maxForce;
		joint.maxTorque = obj.maxTorque;
		joint.linearOffset = obj.linearOffset;
		joint.angularOffset = obj.angularOffset;
		joint.correctionFactor = obj.correctionFactor;
	}
	else if (joint.jointType == Joint.JOINT_REVOLUTE){
		joint.enableLimit 	 = obj.enableLimit;
		joint.enableMotor 	 = obj.enableMotor;
		joint.lowerAngle 	 = obj.lowerAngle;
		joint.upperAngle	 = obj.upperAngle;
		joint.maxMotorTorque = obj.maxMotorTorque;
		joint.motorSpeed 	 = obj.motorSpeed;
		joint.referenceAngle = obj.referenceAngle;
	}
	else if (joint.jointType == Joint.JOINT_WHEEL){
		joint.localAxisA 	= cloneArray(obj.localAxisA);
		joint.enableMotor 	= obj.enableMotor;
		joint.maxMotorTorque = obj.maxMotorTorque;
		joint.motorSpeed 	= obj.motorSpeed;
		joint.frequencyHZ 	= obj.frequencyHZ;
		joint.dampingRatio 	= obj.dampingRatio;
	}
	else if (joint.jointType == Joint.JOINT_PULLEY){
		joint.groundAnchorA  = cloneArray(obj.groundAnchorA);
		joint.groundAnchorB = cloneArray(obj.groundAnchorB);
		joint.lengthA	   	 = obj.lengthA;
		joint.lengthB		 = obj.lengthB;
		joint.maxLengthA     = obj.maxLengthA;
		joint.maxLengthB     = obj.maxLengthB;
		joint.frequencyHZ    = obj.frequencyHZ;
	}
	else if (joint.jointType == Joint.JOINT_GEAR){
		joint.joint1		= joints[obj.jointIndex1];
		joint.joint2		= joints[obj.jointIndex2];
		joint.frequencyHZ = obj.frequencyHZ;
	}
	else if (joint.jointType == Joint.JOINT_PRISMATIC){
		joint.enableLimit 	 = obj.enableLimit;
		joint.enableMotor 	 = obj.enableMotor;
		joint.localAxisA 	= cloneArray(obj.localAxisA);
		joint.lowerTranslation 	 = obj.lowerTranslation;
		joint.upperTranslation	 = obj.upperTranslation;
		joint.maxMotorTorque = obj.maxMotorTorque;
		joint.motorSpeed 	 = obj.motorSpeed;
		joint.referenceAngle = obj.referenceAngle;
	}
	else if (joint.jointType == Joint.JOINT_ROPE){
		joint.frequencyHZ = obj.frequencyHZ;
	}
	return joint;
}