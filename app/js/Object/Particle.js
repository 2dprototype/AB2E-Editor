function particleShape(type){
	this.type = type;
	if(type == Particle.SHAPE_CIRCLE){
		this.radius = 30;
	}
	else if(type == Particle.SHAPE_BOX){
		this.height = 50;
		this.width = 50;
	}
	else if(type == Particle.SHAPE_POLYGON){
		this.vertices = [];
		this.inEditMode = false;
		var size = 10;
		var width = 50;
		var height = 50;
		this.vertices.push(new Vertex(-width / 2, -height / 2, size, size));
		this.vertices.push(new Vertex( width / 2, -height / 2, size, size));
		this.vertices.push(new Vertex( width / 2,  height / 2, size, size));
		this.vertices.push(new Vertex(-width / 2,  height / 2, size, size));
	}	
	
}

particleShape.prototype.addVertex = function(x, y){
	if(this.type == Particle.SHAPE_POLYGON){
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
	}
};

particleShape.prototype.removeVertexGivenVertex = function(v){
	if(this.type == Particle.SHAPE_POLYGON){
		for (var i = 0; i < this.vertices.length; i++){
			if (this.vertices[i] == v){ 
				this.removeVertexGivenIndex(i);
				break;
			}
		}
	}
};

particleShape.prototype.removeVertexGivenIndex = function(index){
	if(this.type == Particle.SHAPE_POLYGON){
		if (index == 0){
			this.vertices.shift();
		}
		else if (index == this.vertices.length - 1){
			this.vertices.pop();
		}
		else {
			this.vertices.splice(index, 1);
		}
	}
};

particleShape.prototype.indexOfVertex = function(v){
	if(this.type == Particle.SHAPE_POLYGON){
		for (var i = 0; i < this.vertices.length; i++){
			if (this.vertices[i] == v){ 
				return i;
			}
		}
	}
};

particleShape.prototype.toPhysics = function(pos, rot){
	var ps = new PhysicsParticleShape(this.type);
	
	if(this.type == Particle.SHAPE_POLYGON){
		var vtx = []
		for(i = 0; i < this.vertices.length; i++){	
			vtx.push([this.vertices[i].x - pos[0], this.vertices[i].y - pos[1]])
		}
		ps.vertices = vtx;
		return ps
	}
	else if(this.type == Particle.SHAPE_CIRCLE){
		ps.radius = this.radius;
		return ps
	}
	else if(this.type == Particle.SHAPE_BOX){
		ps.width = this.width;
		ps.height = this.height;
		return ps
	}
};

function Particle(type){
	this.id = randomString(16);
	this.name = "particle_" + Particle.counter++;
	this.isSelected = false;
	this.bounds = [0, 0, 0, 0];
	this.userData = null;
	this.rotation = 0;
	this.angularVelocity = 0;
	this.color = Particle.DEFAULT_COLORS[ Math.floor( Math.random() * Particle.DEFAULT_COLORS.length ) ];
	this.flags = [null, null, null, null, null, null, null, null, null, null, null, null];
	this.group = null;
	this.groupFlags = null;
	this.lifetime = null;
	this.linearVelocity = [0 , 0];
	this.position = [0, 0]
	this.strength = 1;
	this.stride = 0;
	this.radius = 0.1;
	this.shape = new particleShape(type);
}

Particle.counter = 0;
//SHAPES
Particle.SHAPE_CIRCLE  = 0;
Particle.SHAPE_BOX     = 1;
Particle.SHAPE_POLYGON = 2;

Particle.DEFAULT_COLORS = [
	[255, 000, 000, 0.5],
	[000, 255, 000, 0.5],
	[000, 000, 255, 0.5],
	[255, 255, 000, 0.5]
];										  
						  
Particle.prototype.calculateBounds = function(){
	
	if(this.shape.type == Particle.SHAPE_CIRCLE){
		this.bounds[0] = this.position[0];
		this.bounds[1] = this.position[1];
		this.bounds[2] = this.shape.radius * 2;
		this.bounds[3] = this.shape.radius * 2;
	}
	else if(this.shape.type == Particle.SHAPE_BOX){
		var corner_1_x = this.shape.width;
		var corner_2_x = this.shape.width;
		var corner_1_y = -this.shape.height;
		var corner_2_y =  this.shape.height;

		var sin_o  = Math.sin(this.rotation * Math.PI/180);
		var cos_o = Math.cos(this.rotation * Math.PI/180);

		var xformed_corner_1_x = corner_1_x * cos_o - corner_1_y * sin_o;
		var xformed_corner_1_y = corner_1_x * sin_o + corner_1_y * cos_o;
		var xformed_corner_2_x = corner_2_x * cos_o - corner_2_y * sin_o;
		var xformed_corner_2_y = corner_2_x * sin_o + corner_2_y * cos_o;

		var ex = Math.max(Math.abs(xformed_corner_1_x), Math.abs(xformed_corner_2_x));
		var ey = Math.max(Math.abs(xformed_corner_1_y), Math.abs(xformed_corner_2_y));

		this.bounds[0] = this.position[0];
		this.bounds[1] = this.position[1];
		this.bounds[2] = ex;
		this.bounds[3] = ey;
	}
	else if(this.shape.type == Particle.SHAPE_POLYGON){
		var minX = 100000, maxX = -100000, minY = 100000, maxY = -100000;
		var v;
		for (var i = 0; i < this.shape.vertices.length; i++){
			v = this.shape.vertices[i];
			minX = Math.min(minX, v.x)
			maxX = Math.max(maxX, v.x);
			minY = Math.min(minY, v.y);
			maxY = Math.max(maxY, v.y);
		}
		this.bounds[0] = (maxX + minX) / 2;
		this.bounds[1] = (maxY + minY) / 2;
		this.bounds[2] = maxX - minX;
		this.bounds[3] = maxY - minY;
	}

}

Particle.prototype.move = function(dx, dy){
	this.position[0] += dx;
	this.position[1] += dy;
	if(this.shape.type == Particle.SHAPE_POLYGON){
		for (var i = 0; i < this.shape.vertices.length; i++){
			this.shape.vertices[i].move(dx, dy);
		}
	}
    this.calculateBounds()
};
Particle.prototype.setPosition = function(x, y){
	this.move(x - this.position[0], y - this.position[1]);
};

Particle.prototype.scale = function(sx, sy, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
	}
	
	if(this.shape.type == Particle.SHAPE_CIRCLE){
		this.shape.radius *= ( sx + sy ) / 2;
	}
	else if(this.shape.type == Particle.SHAPE_BOX){	
		this.shape.width *= sx;
		this.shape.height *= sy;
	}
	else if(this.shape.type == Particle.SHAPE_POLYGON){
		// move the shape to new origin
		this.move(-pivotX, -pivotY);
		
		// update position
		this.position[0] *= sx;
		this.position[1] *= sy
		// scale vertices
		for (var i = 0; i < this.shape.vertices.length; i++){
			this.shape.vertices[i].x *= sx;
			this.shape.vertices[i].y *= sy;
		}
		// revert origin
		this.move(pivotX, pivotY);	
	}
	
};
Particle.prototype.setRotation = function(r){
	var rot = r - this.rotation;
	this.rotate(rot, this.position[0], this.position[1]);
}

Particle.prototype.rotate = function(angle, pivotX, pivotY){
	if (pivotX == null || pivotY == null){
		pivotX = this.position[0];
		pivotY = this.position[1];
	}

	// update rotation
	this.rotation += angle;

	// rotate vertices
	if(this.shape.type == Particle.SHAPE_POLYGON){
		for (var i = 0; i < this.shape.vertices.length; i++){
			var x = this.shape.vertices[i].x - pivotX;
			var y = this.shape.vertices[i].y - pivotY;
			var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
			var length = Math.pow(x * x + y * y, 0.5);
			this.shape.vertices[i].x = pivotX + length * Math.cos(newAngle * Math.PI / 180);
			this.shape.vertices[i].y = pivotY + length * Math.sin(newAngle * Math.PI / 180);		
		}
	}

	// update position
	var x = this.position[0] - pivotX;
	var y = this.position[1] - pivotY;
	var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
	var length = Math.pow(x * x + y * y, 0.5);
	this.position[0] = pivotX + length * Math.cos(newAngle * Math.PI / 180);
	this.position[1] = pivotY + length * Math.sin(newAngle * Math.PI / 180);
};
Particle.prototype.clone = function(){
	var p = clone(this);
	p.color = cloneArray(this.color)
	return p;
};
Particle.prototype.toPhysics = function(){
	
	var p = new PhysicsParticle(this.shape.type);
		p.userData = this.userData;
		p.position[0] = this.position[0];
		p.position[1] = this.position[1];
		if(this.shape.type != 2) p.rotation = this.rotation;
		else p.angle = 0;
		p.strength = this.strength;
		// p.color = this.color;
		p.color = { r : this.color[0], g : this.color[1], b : this.color[2], a : this.color[3] * 255 };
		p.linearVelocity = this.linearVelocity;
		p.angularVelocity = this.angularVelocity;
		p.lifetime = this.lifetime;
		p.radius = this.radius;
		p.stride = this.stride;
		//flags
		var f = null;
		for(i = 0; i < this.flags.length; i++) { f |= this.flags[i] }
		p.flags = f;
		p.shape = this.shape.toPhysics(this.position, this.rotation);
		
		return p
}