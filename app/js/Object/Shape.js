/**
*
* params type of shape
* params width, needed when type = BOX | CIRCLE
* params height, needed when type = BOX
*/
function Shape(type, width, height){
	this.id = randomString(16);
	this.name = "shape_" + Shape.counter++;
	this.shapeType = type;
	this.position = [0, 0];						// position
	this.scaleXY = [1, 1];						// scale
	this.rotation = 0;							// only for editor purpose
	this.vertices = [];
	this.bounds = [0, 0, 0, 0];					// AABB for selecting
	this.centroid = [0, 0];						// centroid for shape
	this.isSelected = false;
	this.isHover = false;
	this.inEditMode = false;

	// fixture properties
	this.friction = 1;
	this.restitution = 0.25;
	this.density = 1;
	this.isSensor = false;
	this.maskBits = 65535;
	this.categoryBits = 1;
	this.groupIndex = 0;
	
	this.userData = null;

	if (type == Shape.SHAPE_NONE){
		this.shapeType = Shape.SHAPE_POLYGON;
		return;
	}

	if (type == Shape.SHAPE_CHAIN || type == Shape.SHAPE_POLYGON || type == Shape.SHAPE_EDGE){
			var width = 50;
			var height = 50;
			var size = 10;
			this.vertices.push(new Vertex(-width / 2, -height / 2, size, size));
			this.vertices.push(new Vertex( width / 2, -height / 2, size, size));
			this.vertices.push(new Vertex( width / 2,  height / 2, size, size));
			this.vertices.push(new Vertex(-width / 2,  height / 2, size, size));
	}

	else if (type == Shape.SHAPE_BOX){
		this.width = width || 100/2;
		this.height = height || 100/2;

		var size = 10;
		this.vertices.push(new Vertex(-this.width / 2, -this.height / 2, size, size));
		this.vertices.push(new Vertex( this.width / 2, -this.height / 2, size, size));
		this.vertices.push(new Vertex( this.width / 2,  this.height / 2, size, size));
		this.vertices.push(new Vertex(-this.width / 2,  this.height / 2, size, size));
	}

	else if (type == Shape.SHAPE_CIRCLE){
		this.radius = width / 2 || 50 / 2;
		
		var angle = 0
		var resolution = 24;
		var size = 10;
		for (var i = 0; i < resolution; i++){
			angle = 2 * Math.PI * i / resolution;
			var vertex = new Vertex(this.radius * Math.cos(angle), this.radius * Math.sin(angle), size, size);
			this.vertices.push(vertex);
		}
	}
}

Shape.SHAPE_BOX = 0;
Shape.SHAPE_CIRCLE = 1;
Shape.SHAPE_POLYGON = 2;
Shape.SHAPE_CHAIN = 3;
Shape.SHAPE_NONE = 4;
Shape.SHAPE_EDGE = 5;
Shape.counter = 0;

Shape.prototype.addVertex = function(x, y){
	var v = new Vertex(x, y, 10, 10);

	// do not edit BOX and CIRCLE shape
	if (this.shapeType == Shape.SHAPE_BOX || this.shapeType == Shape.SHAPE_CIRCLE)
		return;

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

		// if shapeType = CHAIN and distance is greate than threshold then just add the new vertex at the end of array
		if (distance > 25 && this.shapeType == Shape.SHAPE_CHAIN){
			this.vertices.push(v);
			return;
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

	// update the bounds for the shape
	this.calculateBounds();
};

Shape.prototype.removeVertexGivenVertex = function(v){
	// do not edit BOX and CIRCLE shape
	if (this.shapeType == Shape.SHAPE_BOX || this.shapeType == Shape.SHAPE_CIRCLE)
		return;

	for (var i = 0; i < this.vertices.length; i++){
		if (this.vertices[i] == v){ 
			this.removeVertexGivenIndex(i);
			break;
		}
	}
};

Shape.prototype.removeVertexGivenIndex = function(index){
	if (this.shapeType == Shape.SHAPE_BOX || this.shapeType == Shape.SHAPE_CIRCLE)
		return;
	if (index == 0){
		this.vertices.shift();
	}
	else if (index == this.vertices.length - 1){
		this.vertices.pop();
	}
	else {
		this.vertices.splice(index, 1);
	}

	// update the bounds for the shape 
	this.calculateBounds();
};

Shape.prototype.indexOfVertex = function(v){
	for (var i = 0; i < this.vertices.length; i++){
		if (this.vertices[i] == v){ 
			return i;
		}
	}
};

Shape.prototype.move = function(dx, dy){
	this.position[0] += dx;
	this.position[1] += dy;
	for (var i = 0; i < this.vertices.length; i++){
		this.vertices[i].move(dx, dy);
	}
	this.calculateBounds();
};

Shape.prototype.setPosition = function(x, y){
	this.move(x - this.position[0], y - this.position[1]);
}

Shape.prototype.scale = function(sx, sy, pivotX, pivotY){
	this.scaleXY[0] *= sx;
	this.scaleXY[1] *= sy;

	if (this.shapeType == Shape.SHAPE_BOX){
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
				pivotX = this.position[0];
				pivotY = this.position[1];
			}

			// move the shape to new origin
			this.move(-pivotX, -pivotY);
			
			// update position
			this.position[0] *= sx;
			this.position[1] *= sy
			
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
	}
	else if (this.shapeType == Shape.SHAPE_CIRCLE){
		this.radius *= sx;
		sy = sx;
	}

	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
	}

	// move the shape to new origin
	this.move(-pivotX, -pivotY);
	
	// update position
	this.position[0] *= sx;
	this.position[1] *= sy
	
	// scale vertices
	for (var i = 0; i < this.vertices.length; i++){
		this.vertices[i].x *= sx;
		this.vertices[i].y *= sy;
	}

	// revert origin
	this.move(pivotX, pivotY);		
};

Shape.prototype.setScale = function(sx, sy, pivotX, pivotY){
	this.scale(Math.abs(sx / this.scaleXY[0]), Math.abs(sy / this.scaleXY[1]), pivotX, pivotY);
};

Shape.prototype.setWidth = function(width){
	if (this.shapeType == Shape.SHAPE_BOX)
		this.scale(width / this.width, 1);
};

Shape.prototype.setRadius = function(radius){
	if (this.shapeType == Shape.SHAPE_CIRCLE)
		this.scale(radius / this.radius, 1);
};

Shape.prototype.setHeight = function(height){
	if (this.shapeType == Shape.SHAPE_BOX)
		this.scale(1, height / this.height);
};

// just for visualization in editor
Shape.prototype.rotate = function(angle, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
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
	var x = this.position[0] - pivotX;
	var y = this.position[1] - pivotY;
	var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
	var length = Math.pow(x * x + y * y, 0.5);
	this.position[0] = pivotX + length * Math.cos(newAngle * Math.PI / 180);
	this.position[1] = pivotY + length * Math.sin(newAngle * Math.PI / 180);
}

Shape.prototype.setRotation = function(angle, pivotX, pivotY){
	this.rotate(angle - this.rotation, pivotX, pivotY);
};

Shape.prototype.calculateBounds = function(){
	var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
	var v;
	for (var i = 0; i < this.vertices.length; i++){
		v = this.vertices[i];
		minX = Math.min(minX, v.x)
		maxX = Math.max(maxX, v.x);
		minY = Math.min(minY, v.y);
		maxY = Math.max(maxY, v.y);
	}
	this.bounds[0] = (maxX + minX) / 2;
	this.bounds[1] = (maxY + minY) / 2;
	this.bounds[2] = maxX - minX;
	this.bounds[3] = maxY - minY;

	// update centroid
	this.centroid = [0, 0];
	for (var i = 0; i < this.vertices.length; i++){
		this.centroid[0] += this.vertices[i].x;
		this.centroid[1] += this.vertices[i].y;
	}
	this.centroid[0] /= this.vertices.length;
	this.centroid[1] /= this.vertices.length;	    
};

Shape.prototype.clone = function(){
	var s = clone(this);
	return s;
};

Shape.prototype.isConvex = function(){
	var sumOfAngles = 0,											// sum of interior angles
		angleForConvexity = (this.vertices.length - 2) * 180,		// angle => (n - 2) * 180 for convexity
		edges = [];													// array of edges

	// calculate edges
	for (var i = 0; i < this.vertices.length; i++){
		if (i == this.vertices.length - 1){
			edges[i] = [this.vertices[0].x - this.vertices[i].x, this.vertices[0].y - this.vertices[i].y];
		}
		else {
			edges[i] = [this.vertices[i + 1].x - this.vertices[i].x, this.vertices[i + 1].y - this.vertices[i].y];
		}
	}

	// calculate angle b/w each edge
	for (var i = 0; i < edges.length; i++){
		if (i == edges.length - 1){
			var vec1 = edges[i],
				vec2 = edges[0],
				dot = vec1[0] * vec2[0] + vec1[1] * vec2[1],
				mag1 = Math.pow(vec1[0] * vec1[0] + vec1[1] * vec1[1], 0.5),
				mag2 = Math.pow(vec2[0] * vec2[0] + vec2[1] * vec2[1], 0.5),
				angle = Math.acos(dot / (mag1 * mag2));
			
			angle = Math.PI - angle;
			sumOfAngles += angle;
		}
		else {
			var vec1 = edges[i],
				vec2 = edges[i + 1],
				dot = vec1[0] * vec2[0] + vec1[1] * vec2[1],
				mag1 = Math.pow(vec1[0] * vec1[0] + vec1[1] * vec1[1], 0.5),
				mag2 = Math.pow(vec2[0] * vec2[0] + vec2[1] * vec2[1], 0.5),
				angle = Math.acos(dot / (mag1 * mag2)),
			
			angle = Math.PI - angle;
			sumOfAngles += angle;
		}
	}
	// convert radian to degrees (in radians gives unexpected results because of approximations)
	sumOfAngles = sumOfAngles * 180 / Math.PI;
	return Math.abs(sumOfAngles - angleForConvexity) < 0.1;
};

Shape.prototype.decomposeToConvex = function(x, y){
	var shapes = [];
	var polygons = decomposeToConvex(this.vertices);

	for (var i = 0; i < polygons.length; i++){
		var shape = new PhysicsShape(Shape.SHAPE_POLYGON);
		shape.position = [this.position[0] - x, this.position[1] - y];
		for (var j = 0; j < polygons[i].vertices.length; j++){
			shape.vertices.push([polygons[i].vertices[j].x - this.position[0], polygons[i].vertices[j].y - this.position[1]]);
		}
		shapes.push(shape);
	}
	return shapes;
};


Shape.prototype.reverse = function(b){
	
    var x = this.position[0]+b.position[0];
    var y = this.position[1]+b.position[1];

	if(this.shapeType != Shape.SHAPE_BOX && this.shapeType != Shape.SHAPE_CIRCLE){
		this.vertices = reversePolygon(this.vertices,x,y);
	}
	else{
		//console.log("Can't reverse SHAPE_BOX or SHAPE_CIRCLE")
	}

}
	
function reversePolygon(v,px = 0,py = 0){
	
	var arr = []
	
	for(i=0;i<v.length;i++){
	
	var x = -(v[i].x-px);
	var y = -(v[i].y-py);
	var w = (v[i].width);
	var h = (v[i].height);
	
	arr.push( new Vertex(x, y, w, h) )
		
	}
	
	return arr
	
}

// returns PhysicsShape for exporting
// use (x, y) as the origin for physics shape
Shape.prototype.exportShape = function(x, y){
	var shapes = []; // an array of physics shape (shapes if the shape is concave)
	
	if (this.shapeType == Shape.SHAPE_BOX && this.rotation == 0){
		var pShape = new PhysicsShape(Shape.SHAPE_BOX);
		pShape.width = this.width;
		pShape.height = this.height;
		pShape.position = [this.position[0] - x, this.position[1] - y];
		shapes.push(pShape);
		return shapes;
	}
	else if (this.shapeType == Shape.SHAPE_CIRCLE){
		var pShape = new PhysicsShape(Shape.SHAPE_CIRCLE);
		pShape.radius = this.radius / 2;
		pShape.position = [this.position[0] - x, this.position[1] - y];
		shapes.push(pShape);
		return shapes;
	}

	var pShape = new PhysicsShape(this.shapeType == Shape.SHAPE_BOX ? Shape.SHAPE_POLYGON : this.shapeType);
	pShape.position = [this.position[0] - x, this.position[1] - y];
	// need to check for convexity if shape is polygon
	if (this.shapeType == Shape.SHAPE_POLYGON){
		// is shape convex
		if(/*this.isConvex()*/ false){
			// just export it
			for (var i = 0; i < this.vertices.length; i++){
				pShape.vertices.push([this.vertices[i].x - this.position[0], this.vertices[i].y - this.position[1]]);	// vertex position relative to shape
			}
			shapes.push(pShape);
			return shapes;
		}
		// decompose concave shape to convex shapes
		else {
			// decompose shape
			shapes = this.decomposeToConvex(x, y);
			return shapes;
		}
	}
	// just add the vertices if the shape is edge
	else {
		for (var i = 0; i < this.vertices.length; i++){
			pShape.vertices.push([this.vertices[i].x - this.position[0], this.vertices[i].y - this.position[1]]);		// vertex position relative to shape
		}
		shapes.push(pShape);
		return shapes;
	}
};

Shape.prototype.toPhysics = function(x, y){
	if (x == null || y == null){
		x = this.position[0];
		y = this.position[1];
	}
	var fixture = new Fixture();
	fixture.restitution = this.restitution;
	fixture.friction = this.friction;
	fixture.density = this.density;
	fixture.isSensor = this.isSensor;
	fixture.maskBits = this.maskBits;
	fixture.categoryBits = this.categoryBits;
	fixture.groupIndex = this.groupIndex;
	fixture.userData = this.userData;
	fixture.shapes = this.exportShape(x, y);
	return fixture;
};
