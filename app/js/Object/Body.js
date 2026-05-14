function Body(){
	this.id = randomString(16);
	this.name = "body_" + Body.counter++;
	this.userData = null;		
	this.shapes = [];
	this.position = [0, 0];
	this.scaleXY = [1, 1];
	this.rotation = 0;
	this.bounds = [0, 0, 0, 0];
	this.isSelected = false;
	this.bodyType = Body.BODY_TYPE_DYNAMIC;
	this.isBullet = false;
	this.isFixedRotation = false;
	this.linearDamping = 0;
	this.angularDamping = 0;
	this.linearVelocity = [0, 0];
	this.angularVelocity = 0;
	this.isAwake = true;
	this.isActive = true;
	this.gravityScale = 1;
	this.cloneOf = null;
	
	this.selectedSprite = 0;
	this.sprites = [];
}

Body.counter = 0;
Body.BODY_TYPE_STATIC = 0;
Body.BODY_TYPE_KINEMATIC = 1;
Body.BODY_TYPE_DYNAMIC = 2;

Body.prototype.get_body = function(){
	var loader = new b2Loader();
	return loader.createBody(this.toPhysics(), new b2World(new b2Vec2(0, 0), true))
}

Body.prototype.get_properties = function(){
	var pb = this.get_body();
	var keys = Object.keys(pb);
	var values = Object.values(pb);
	var obj = {};
	
	for (var i = 0; i < keys.length; i++){
		var k = keys[i];
		var v = values[i];
	    if(typeof v != 'object') obj[k] = v;
	}
	
	return obj
}

//sprite
Body.prototype.setSprite = function(src, direct_src){
	var ref = this;
	var size = 10;
	var s = new Sprite();
	s.src = src;
	s.sprite = new Image();
	s.sprite.src = direct_src;
	s.sprite.onload = function(){
		s.height = s.sprite.naturalHeight;
		s.width = s.sprite.naturalWidth;
		s.x = ref.position[0];
		s.y = ref.position[1];
		s.vertices.push(new Vertex(-s.width / 2 + ref.position[0], -s.height / 2 + ref.position[1], size, size));
		s.vertices.push(new Vertex(s.width / 2 + ref.position[0], -s.height / 2 + ref.position[1], size, size));
		s.vertices.push(new Vertex(s.width / 2 + ref.position[0], s.height / 2 + ref.position[1], size, size));
		s.vertices.push(new Vertex(-s.width / 2 + ref.position[0], s.height / 2 + ref.position[1], size, size));
		s.hasLoaded = true;
	}
	this.sprites.push(s)
};

// if (setPos == true) => shape would be moved to bodies center 
Body.prototype.addShape = function(shape, setPos){
	if (setPos){
		shape.setPosition(this.position[0], this.position[1]);
	}
	this.shapes.push(shape);
};

Body.prototype.removeShapeGivenIndex = function(index){
	if (index == 0){
		this.shapes.shift();
	}
	else if (index == this.shapes.length - 1){
		this.shapes.pop();
	}
	else {
		this.shapes.splice(index, 1);
	}
};

Body.prototype.removeShapeGivenShape = function(shape){
	for (var i = 0; i < this.shapes.length; i++){
		if (this.shapes[i] == shape){
			this.removeShapeGivenIndex(i);
			break;
		}
	}
};

Body.prototype.calculateBounds = function(){
	if(this.shapes.length != 0){
		var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
		var v;

		for (var i = 0; i < this.shapes.length; i++){
			for (var j = 0; j < this.shapes[i].vertices.length; j++){
				v = this.shapes[i].vertices[j];
				minX = Math.min(minX, v.x)
				maxX = Math.max(maxX, v.x);
				minY = Math.min(minY, v.y);
				maxY = Math.max(maxY, v.y);
			}
		}
		this.bounds[0] = (maxX + minX) / 2;
		this.bounds[1] = (maxY + minY) / 2;
		this.bounds[2] = maxX - minX;
		this.bounds[3] = maxY - minY;
	}
	else{
		this.bounds[0] = this.position[0];
		this.bounds[1] = this.position[1];
		this.bounds[2] = 32;
		this.bounds[3] = 32;	
	}
};

Body.prototype.move = function(dx, dy){
	this.position[0] += dx;
	this.position[1] += dy;

	for (var i = 0; i < this.shapes.length; i++){
		this.shapes[i].move(dx, dy);
	}
	for (var i = 0; i < this.sprites.length; i++){
		this.sprites[i].move(dx, dy);
	}
};

Body.prototype.setPosition = function(x, y){
	this.move(x - this.position[0], y - this.position[1]);
};

Body.prototype.scale = function(sx, sy, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
	}

	this.scaleXY[0] *= sx;
	this.scaleXY[1] *= sy;

	this.move(-pivotX, -pivotY);

	this.position[0] *= sx;
	this.position[1] *= sy;

	this.move(pivotX, pivotY);

	for (var i = 0; i < this.shapes.length; i++){
		this.shapes[i].scale(sx, sy, pivotX, pivotY);
	}
	for (var i = 0; i < this.sprites.length; i++){
		this.sprites[i].scale(sx, sy, pivotX, pivotY);
	}
	
};

Body.prototype.setScale = function(sx, sy, pivotX, pivotY){
	this.scale(Math.abs(sx / this.scaleXY[0]), Math.abs(sy / this.scaleXY[1]), pivotX, pivotY);
};

Body.prototype.rotate = function(angle, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
	}

	this.rotation += angle;
	for (var i = 0; i < this.shapes.length; i++){
		this.shapes[i].rotate(angle, pivotX, pivotY);
	}
	//sprite
	for (var i = 0; i < this.sprites.length; i++){
		this.sprites[i].rotate(angle, pivotX, pivotY);
	}

	// update position
	var x = this.position[0] - pivotX;
	var y = this.position[1] - pivotY;
	var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
	var length = Math.pow(x * x + y * y, 0.5);
	this.position[0] = pivotX + length * Math.cos(newAngle * Math.PI / 180);
	this.position[1] = pivotY + length * Math.sin(newAngle * Math.PI / 180);
};

Body.prototype.setRotation = function(angle, pivotX, pivotY){
	this.rotate(angle - this.rotation, pivotX, pivotY);
};

Body.prototype.clone = function(){
	var b = clone(this);
	b.cloneOf = b.id;
	b.id = randomString(16);
	return b;
};



Body.prototype.toPhysics = function(){
	var rot = this.rotation;

	this.rotate(-rot);

	var pBody = new PhysicsBody(this.bodyType);
	pBody.position = this.position;
	pBody.rotation = rot;
	pBody.isBullet = this.isBullet;
	pBody.isFixedRotation = this.isFixedRotation;
	pBody.userData = this.userData;
	pBody.linearDamping = this.linearDamping;
	pBody.angularDamping = this.angularDamping;
	//new
	pBody.linearVelocity = this.linearVelocity;
	pBody.angularVelocity = this.angularVelocity;
	//
	pBody.isAwake = this.isAwake;
	pBody.isActive = this.isActive;
	pBody.gravityScale = this.gravityScale;
	

	for (var i = 0; i < this.shapes.length; i++){
		var shape = this.shapes[i];
		pBody.fixtures.push(shape.toPhysics(this.position[0], this.position[1]));
	}

	this.rotate(rot);

	return pBody;
};