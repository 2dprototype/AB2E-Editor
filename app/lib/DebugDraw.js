var debugDraw = function(context, world, scale, SCALE) {

	this.Alpha = 0.5;
	this.lineWidth = 1.5 / SCALE;
	
	this.colors = {
	    bodyStatic      : 'rgba(127, 229, 127, '+this.Alpha+')',
		bodyDynamic     : 'rgba(229, 178, 178, '+this.Alpha+')',
		bodyKinematic   : 'rgba(127, 127, 229, '+this.Alpha+')',
		notActive       : 'rgba(166, 160, 61,  '+this.Alpha+')',
		notAwake        : 'rgba(153, 153, 153, '+this.Alpha+')',
		jointColor      : 'rgba(135, 206, 235, '+this.Alpha+')',
		mouseJointColor : 'rgba(255, 255, 255, '+this.Alpha+')'
	}

	// Draw body shapes
	for(var b = world.m_bodyList; b; b=b.m_next) {
		for(var f = b.GetFixtureList(); f!==null; f=f.GetNext()) {
			context.lineWidth = this.lineWidth;
			if(b.m_userData != "hide") { drawShape(context, scale, world, b, f, this.colors) }
		}
	}
	// Draw joints
	for(var j = world.m_jointList; j; j=j.m_next) {
			context.lineWidth = this.lineWidth;
		    if(j.m_userData != "hide") { drawJoint(context, scale, world, j, this.colors) }
	}
	//Draw Particles
	if(world.GetParticleSystemList() !== null) { 
		drawParticle(world, context, scale) 
	}
};

var drawJoint = function(context, scale, world, joint, colors) {
	context.save();
	context.scale(scale, scale);
	context.lineWidth /= scale;
	context.strokeStyle = colors.jointColor;
	
	var b1 = joint.m_bodyA;
	var b2 = joint.m_bodyB;
	var x1 = b1.GetPosition();
	var x2 = b2.GetPosition();
	
	context.beginPath();
	
if(joint.m_type == 4){
	//pully
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	var s1 = joint.GetGroundAnchorA(x1);
    var s2 = joint.GetGroundAnchorB(x2);

	context.moveTo(p1.x, p1.y);
	context.lineTo(s1.x, s1.y);
	context.lineTo(s2.x, s2.y);
	context.lineTo(p2.x, p2.y);
}
if(joint.m_type == 1){
    //rev
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(x2.x, x2.y);
	context.lineTo(p2.x, p2.y);
	context.stroke();

	// var r = joint.GetReferenceAngle();
	// var u = joint.GetUpperLimit();
	// var l = joint.GetLowerLimit();
	// var a = joint.GetJointAngle();
	// var b = r - a;


	// context.fillStyle = "#0f0"; //Blue
	// context.font = (10 * (1.06)) + "px Arial";
	// context.fillText(JSON.stringify(joint.m_type), p1.x,  p1.y);
	// // console.log(r,u,l,a)
	
	// // var _a = a - r;
	// // var _u = u + a;
	// context.strokeStyle = "#4F80FF50"; //Blue
	// context.arc(p2.x, p2.y, 5, l + b, u + b, false);
	// context.stroke();
}
if(joint.m_type == 3){
    //distance
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);

}
if(joint.m_type == 2){
    //prism
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);

}
if(joint.m_type == 8){
    //weld
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);

}
if(joint.m_type == 6){
    //gear
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);

}
if(joint.m_type == 7){
    //wheel
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);

}
if(joint.m_type == 10){
    //rope
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	var ln = joint.GetMaxLength();
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);
	context.stroke();

    // optional
	// context.fillStyle = "#00ff0010"
	// context.strokeStyle = "#00ff0050"
	// context.save();
	// context.beginPath();
	// context.arc(p1.x, p1.y, joint.GetMaxLength(), 0, 2 * Math.PI, false);
	// context.closePath();
	// context.fill();
	// context.stroke();
	// context.restore();


}
if(joint.m_type == 9){
    //friction
	var p1 = joint.GetAnchorA(b1);
	var p2 = joint.GetAnchorB(b2);
	context.moveTo(x1.x, x1.y);
	context.lineTo(p1.x, p1.y);
	context.lineTo(p2.x, p2.y);
	context.lineTo(x2.x, x2.y);
	
}
if(joint.m_type == 11){
    //motor
	context.moveTo(x1.x, x1.y);
	context.lineTo(x2.x, x2.y);

}
if(joint.m_type == 5){
    //mouse
    let aA = joint.GetAnchorA(x1);
    let aB = joint.GetAnchorB(x2);
	
	// context.globalAlpha = 0.8;
	context.strokeStyle = colors.mouseJointColor;
	context.moveTo(aA.x, aA.y);
	context.lineTo(aB.x, aB.y);

}
	context.stroke();
	context.restore();
};

var drawShape = function(context, scale, world, body, fixture, colors) {
	
	context.save();
	context.scale(scale,scale);
	
	context.globalAlpha = this.Alpha;

	if(body.IsActive() == true && body.IsAwake() == true){
			if(body.GetType() == 0){
				context.fillStyle = colors.bodyStatic;
				context.strokeStyle = colors.bodyStatic;
			}
			else if(body.GetType() == 1){
				context.fillStyle = colors.bodyKinematic;
				context.strokeStyle = colors.bodyKinematic;
			}
			else if(body.GetType() == 2){
				context.fillStyle = colors.bodyDynamic;
				context.strokeStyle = colors.bodyDynamic;
			}
			// else if(body.GetType() == 3){
				// context.fillStyle = "#00ff0050";
				// context.strokeStyle = "#00ff0050";
			// }
			// else if(body.GetType() == -1){
				// context.fillStyle = "#ffffff25";
				// context.strokeStyle = "#ffffff25";
			// }
	}else if(body.IsActive() == false){
	
				context.fillStyle = colors.notActive;
				context.strokeStyle = colors.notActive;
	
	}else if(body.IsAwake() == false && body.GetType() != 1 && body.GetType() != 0){
	
				context.fillStyle = colors.notAwake;
				context.strokeStyle = colors.notAwake;
	
	}else{

			if(body.GetType() == 0){
				context.fillStyle = colors.bodyStatic;
				context.strokeStyle = colors.bodyStatic;
			}else if(body.GetType() == 1){
				context.fillStyle = colors.bodyKinematic;
				context.strokeStyle = colors.bodyKinematic;
			}
	
	}
	
	var bPos = body.GetPosition();
	context.translate(bPos.x, bPos.y);
	context.rotate(body.GetAngle());
	
	context.beginPath();
	context.lineWidth /= scale;
	
	var shape = fixture.m_shape;
	switch(shape.m_type) {
		case box2d.b2ShapeType.e_circleShape: {
			var r = shape.m_radius;
			context.translate(shape.m_p.x, shape.m_p.y);
			context.arc(0, 0, r, 0, 2 * Math.PI, false);
			context.moveTo(0, 0);
			context.lineTo(r, 0);
			context.fill();
			
		} break;
		
		case box2d.b2ShapeType.e_polygonShape:{
			
			var vertices = shape.m_vertices;
			var vertexCount = shape.m_count;
			if (!vertexCount) return;
			
			context.moveTo(vertices[0].x, vertices[0].y);
			for (var i = 0; i < vertexCount; i++)
			context.lineTo(vertices[i].x, vertices[i].y);
			
			context.fill();
		} break;
		
		
		case box2d.b2ShapeType.e_chainShape: {
			
			var vertices = shape.m_vertices;
			var vertexCount = shape.m_count;
			if (!vertexCount) return;
			
			context.moveTo(vertices[0].x, vertices[0].y);
			for (var i = 0; i < vertexCount; i++)
			context.lineTo(vertices[i].x, vertices[i].y);
		} break;
		
		
		case box2d.b2ShapeType.e_edgeShape: {
			if(shape.m_hasVertex0){ context.lineTo(shape.m_vertex0.x, shape.m_vertex0.y) }
			
			context.lineTo(shape.m_vertex1.x, shape.m_vertex1.y);
			context.lineTo(shape.m_vertex2.x, shape.m_vertex2.y);
			
			if(shape.m_hasVertex3){ context.lineTo(shape.m_vertex3.x, shape.m_vertex3.y) }
		} break;
		

		
	}
	
	context.closePath();
	context.stroke();
	
	context.restore();
};


var drawParticle = function(world, context, scale) {
	var system = world.GetParticleSystemList();
	var particles = system.GetPositionBuffer();
	
	for (var i=0;i<system.GetParticleCount(); i++){
	
		var b2color = system.GetColorBuffer()[i];
				
	    const newRadius = (system.m_particleDiameter/2) * scale;
        const x = particles[i].x*scale
        const y = particles[i].y*scale
        context.moveTo(x + newRadius, y)
		context.save();
        context.beginPath()
		context.lineWidth /= scale;
        context.arc(x, y, newRadius, 0, 2*Math.PI);
	    context.lineTo((x), (y));
		
        if(b2color !== undefined){
		

	    var color = 'rgba(' + b2color.r + ',' + b2color.g + ',' + b2color.b + ',' + (b2color.a / 255.0) + ')';
			context.fillStyle = color; 
			context.strokeStyle= color; 
		}
		else{
		
			console.error("DebugDraw() : null color at draw particles")
		
		}
        context.fill();
        context.closePath()
		context.restore(); 
            
        }
	
	
	
}