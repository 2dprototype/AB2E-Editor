function Sprite(){
	this.id = randomString(16);
	this.zIndex = Sprite.z_index++;
	this.src = "";
	this.sprite;
	this.height = 0;
	this.width = 0;
	this.vertices = [];
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.flip = [1,1];
	this.opacity = 50;
	this.hasLoaded = false;
	this.inEditMode = false;
}
Sprite.z_index = 0;

Sprite.prototype.export = function(body, bodyIndex){
	var p = new exportedSprites();
	p.body = bodyIndex;
	p.zIndex = this.zIndex;
	p.src = this.src;
	p.height = this.height;
	p.width = this.width;
	p.x = this.x - body.position[0];
	p.y = this.y - body.position[1];
	p.rotation = this.rotation;
	p.rot = body.rotation;
	p.vertices = [];
	for( i = 0; i < this.vertices.length; i++ ){
		p.vertices.push({ x : this.vertices[i].x - body.position[0], y : this.vertices[i].y - body.position[1]})
	}
	p.alpha = this.opacity / 100;
	p.flip = this.flip;
	
	return p
};

Sprite.prototype.flipX = function(f){
	this.flip[0] = f;
}

Sprite.prototype.flipY = function(f){
	this.flip[1] = f;
}


Sprite.prototype.setRotation = function(rot, body){
	var r = rot - this.rotation;
	this.rotate(r, body.position[0], body.position[1])
}

Sprite.prototype.rotate = function(angle, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.x;
		pivotY = this.y;
	}

	// update rotation
	this.rotation += angle;

	// rotate vertices
	for (var i = 0; i < this.vertices.length; i++){
		var x = this.vertices[i].x - pivotX;
		var y = this.vertices[i].y - pivotY;
		var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
		var length = Math.pow(x * x + y * y, 0.5);
		this.vertices[i].x = pivotX + length * Math.cos(newAngle * Math.PI / 180);
		this.vertices[i].y = pivotY + length * Math.sin(newAngle * Math.PI / 180);		
	}

	// update position
	var x = this.x - pivotX;
	var y = this.y - pivotY;
	var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
	var length = Math.pow(x * x + y * y, 0.5);
	this.x = pivotX + length * Math.cos(newAngle * Math.PI / 180);
	this.y = pivotY + length * Math.sin(newAngle * Math.PI / 180);
	
	// this.move(this.getCenterPos[0], this.getCenterPos[1]);
}

Sprite.prototype.getCenterPos = function(body){
	// var x = this.width / 2;
	// var y = this.height / 2;
	// console.log(x,y)
	// return [this.getBoundsOnly(body)[2] - x, this.getBoundsOnly(body)[3] - y];
}

Sprite.prototype.getBounds = function(){
	var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
	var v;
	for (var i = 0; i < this.vertices.length; i++){
		v = this.vertices[i];
		minX = Math.min(minX, v.x)
		maxX = Math.max(maxX, v.x);
		minY = Math.min(minY, v.y);
		maxY = Math.max(maxY, v.y);
	}
	var A = (maxX + minX) / 2;
	var B = (maxY + minY) / 2;
	var C = maxX - minX;
	var D = maxY - minY;
	return [A, B, C, D]
};

Sprite.prototype.move = function(dx, dy){
	this.x += dx;
	this.y += dy;

	for (var i = 0; i < this.vertices.length; i++){
		this.vertices[i].move(dx, dy);
	}
};

Sprite.prototype.setPosition = function(dx, dy){
	var x = dx - this.x;
	var y = dy - this.y;
	this.move(x, y);
};

Sprite.prototype.setScale = function(sx, sy){
	var w = sx / this.width;
	var h = sy /  this.height;
	this.scale(w, h);
}
Sprite.prototype.scale = function(sx, sy, pivotX, pivotY){

	if (this.rotation == 0 || this.rotation % 180 == 0){
		this.width *= sx;// * Math.cos(this.rotation);
		this.height *= sy;// * Math.sin(this.rotation);
	}
	else if (this.rotation % 90 == 0){
		this.width *= sy;
		this.height *= sx;
	}
	else {
		var rotation = this.rotation;
		this.rotate(-rotation);

		this.width *= sx;
		this.height *= sy;

		if (pivotX == null || pivotY == null){
			pivotX = this.x;
			pivotY = this.y;
		}

		// move the shape to new origin
		this.move(-pivotX, -pivotY);
		
		// update position
		this.x *= sx;
		this.y *= sy
		
		// scale vertices
		for (var i = 0; i < this.vertices.length; i++){
			this.vertices[i].x *= sx;
			this.vertices[i].y *= sy;
		}

		// revert origin
		this.move(pivotX, pivotY);	

		// reset rotation
		this.rotate(rotation);

		return;
	}


	if (pivotX == null || pivotY == null){
		pivotX = this.x;
		pivotY = this.y;
	}

	// move the shape to new origin
	this.move(-pivotX, -pivotY);
	
	// update position
	this.x *= sx;
	this.y *= sy
	
	// scale vertices
	for (var i = 0; i < this.vertices.length; i++){
		this.vertices[i].x *= sx;
		this.vertices[i].y *= sy;
	}

	// revert origin
	this.move(pivotX, pivotY);		
};

Sprite.prototype.removeVertexGivenVertex = function(v){
	for (var i = 0; i < this.vertices.length; i++){
		if (this.vertices[i] == v){ 
			this.removeVertexGivenIndex(i);
			break;
		}
	}
};

Sprite.prototype.removeVertexGivenIndex = function(index){
	if (index == 0){
		this.vertices.shift();
	}
	else if (index == this.vertices.length - 1){
		this.vertices.pop();
	}
	else {
		this.vertices.splice(index, 1);
	}
};

Sprite.prototype.indexOfVertex = function(v){
	for (var i = 0; i < this.vertices.length; i++){
		if (this.vertices[i] == v){ 
			return i;
		}
	}
};


Sprite.prototype.exportImageData = function(body){
	var canvas = document.createElement('canvas');
	canvas.width = this.getBoundsOnly(body)[2];
	canvas.height = this.getBoundsOnly(body)[3];

	var context = canvas.getContext('2d');

	var points = this.vertices;

	var bounds = this.getBounds();
	var x = body.position[0] - bounds[0];
	var y = body.position[1] - bounds[1];;

	context.translate((canvas.width/2) + x, (canvas.height/2) + y)
	context.beginPath();
	context.moveTo(points[0].x - body.position[0], points[0].y - body.position[1]);
	for(i = 1; i < points.length; i++){
		var p = points[i];
		context.lineTo(points[i].x - body.position[0], points[i].y - body.position[1]);
	}
	context.closePath();
	context.clip();
	
	context.translate(this.x - body.position[0], this.y - body.position[1]);
	context.rotate((this.rotation) * Math.PI / 180);
	context.globalAlpha = this.opacity / 100;
	context.scale(this.flip[0], this.flip[1]);
	context.drawImage(this.sprite, -this.width/2, -this.height/2, this.width, this.height);

	var imageData = canvas.toDataURL();
	return imageData
}
Sprite.prototype.getBoundsOnly = function(body){
	var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
	var v;
	for (var i = 0; i < this.vertices.length; i++){
		v = this.vertices[i];
		minX = Math.min(minX, v.x - body.position[0])
		maxX = Math.max(maxX, v.x - body.position[0]);
		minY = Math.min(minY, v.y - body.position[1]);
		maxY = Math.max(maxY, v.y - body.position[1]);
	}
	var A = (maxX + minX) / 2;
	var B = (maxY + minY) / 2;
	var C = maxX - minX;
	var D = maxY - minY;
	return [A, B, C, D]
};

Sprite.prototype.addVertex = function(x, y){
	var v = new Vertex(x, y, 10, 10);


	if (this.vertices.length > 3){
		var lineSegment, distance = 10000, index = 0;
		for (var i = 0; i < this.vertices.length; i++){
			// create new line segment to calculate distance b/w vertex to be addded and each edge of the shape
			if (i == this.vertices.length - 1){
				lineSegment = new LineSegment(this.vertices[i].x, this.vertices[i].y, this.vertices[0].x, this.vertices[0].y);
			}
			else{
				lineSegment = new LineSegment(this.vertices[i].x, this.vertices[i].y, this.vertices[i + 1].x, this.vertices[i + 1].y);
			}

			// if distance is smaller then preceding edge, update the index
			if (distance > lineSegment.distanceFromPoint(v.x, v.y)){
				if (lineSegment.checkInBoundsX(v.x) || lineSegment.checkInBoundsY(v.y)){
					index = i;

					// update distance
					distance = lineSegment.distanceFromPoint(v.x, v.y);			
				}
			}
		}


		// if distance of very large then don't add vertex
		if (distance > 100) return;

		// otherwise add the vertex on the edge (b/w two existing vertices)
		this.vertices.splice(index + 1, 0, v);
	}
	// if shape has less than 3 vertices then just push the new vertex at the end of the array
	else{
		this.vertices.push(v);
	}
};


function exportedSprites(){
	this.body = null;
	this.src = "";
	this.zIndex = 0;
	this.sprite;
	this.height = 0;
	this.width = 0;
	this.vertices = [];
	this.rotation = 0;
	this.rot = 0;
	this.flip = [1,1];
	this.opacity = 100;
}