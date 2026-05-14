function Joint(type){
	this.id = randomString(16);
	this.name = "joint_" + Joint.counter++;
	this.bodyA;
	this.bodyB;
	this.bodyIndexA = -1;
	this.bodyIndexB = -1;
	this.localAnchorA = [0, 0];
	this.localAnchorB = [0, 0];
	this.userData = null;
	this.collideConnected = false;

	this.jointType = type;
	if (type == Joint.JOINT_DISTANCE){
		this.length 		= 100;
		this.frequencyHZ 	= 60;
		this.dampingRatio 	= 1;
	}
	else if (type == Joint.JOINT_WELD){
		this.referenceAngle = 0;
	}
	else if (type == Joint.JOINT_FRICTION){
		this.maxForce = 100;
		this.maxTorque = 100;
	}
	else if (type == Joint.JOINT_MOUSE){
		this.maxForce 		= 100;
		this.frequencyHZ 	= 60;
		this.dampingRatio 	= 1;
	}
	else if (type == Joint.JOINT_AREA){
		this.bodies 	  = [];
		this.bodiesIndex  = [];
		this.frequencyHZ  = 60;
		this.dampingRatio = 1;
		
		delete this.localAnchorA
		delete this.localAnchorB
	}
	else if (type == Joint.JOINT_MOTOR){
		this.maxForce = 100;
		this.maxTorque = 100;
		this.linearOffset = [0, 0];
	    this.angularOffset = 0;
	    this.correctionFactor = 0.3;
	}
	else if (type == Joint.JOINT_REVOLUTE){
		this.enableLimit 	= false;
	 	this.enableMotor 	= false;
	 	this.lowerAngle 	= 0;
		this.maxMotorTorque = 100;
	 	this.motorSpeed 	= 100;
	 	this.referenceAngle = 0;
	 	this.upperAngle		= 0;
	}
	else if (type == Joint.JOINT_WHEEL){
		this.localAxisA 	= [0, 1];
		this.enableMotor 	= false;
		this.maxMotorTorque = 100;
	 	this.motorSpeed 	= 100;
	 	this.frequencyHZ 	= 60;
		this.dampingRatio 	= 1;
	}
	else if (type == Joint.JOINT_PULLEY){
		this.groundAnchorA 	= [0, 0];
		this.groundAnchorB 	= [0, 0];
		this.lengthA	   	= 100;
		this.lengthB		= 100;
		this.maxLengthA     = 100;
		this.maxLengthB     = 100;
		this.frequencyHZ    = 1;			// frequecyHZ is equivalent to ratio in this case (makes it easy to use the current ui layout)
	}
	else if (type == Joint.JOINT_GEAR){
		// localAnchors not needed for this joint
		this.frequencyHZ    = 1;			// frequecyHZ is equivalent to ratio in this case (makes it easy to use the current ui layout)
		this.joint1;
		this.joint2;
		this.jointIndex1    = -1;
		this.jointIndex2	= -1;
	}
	else if (type == Joint.JOINT_PRISMATIC){
		this.enableLimit 	= false;
	 	this.enableMotor 	= false;
	 	this.lowerTranslation 	= 0;
	 	this.upperTranslation   = 100;
	 	this.localAxisA 	= [1, 0];
		this.maxMotorTorque = 100;
	 	this.motorSpeed 	= 100;
	 	this.referenceAngle = 0;
	}
	else if (type == Joint.JOINT_ROPE){
		this.frequencyHZ    = 100;			// frequecyHZ is equivalent to maxLength in this case (makes it easy to use the current ui layout)
	}

	// editor parameters
	this.position = [0, 0];
	this.scaleXY = [1, 1];
	this.isSelected = false;
	this.inEditMode = false;
}

Joint.counter = 0;
Joint.JOINT_DISTANCE	= 0;
Joint.JOINT_WELD 		= 1;
Joint.JOINT_REVOLUTE	= 2;
Joint.JOINT_WHEEL 		= 3;
Joint.JOINT_PULLEY		= 4;
Joint.JOINT_GEAR		= 5;
Joint.JOINT_PRISMATIC	= 6;
Joint.JOINT_ROPE		= 7;
Joint.JOINT_AREA		= 8;
Joint.JOINT_FRICTION	= 9;
Joint.JOINT_MOTOR	    = 11;
Joint.JOINT_MOUSE	    = 10;

Joint.prototype.clone = function(cloneBodyA, cloneBodyB){
	var copy = new Joint(this.jointType);
        for (var attr in this) {
        	if (attr == 'bodyA' && !cloneBodyA){		// do not clone body
        		copy[attr] = this[attr];
        		continue;
        	}
        	if (attr == 'bodyB' && !cloneBodyB){		// do not clone body
        		copy[attr] = this[attr];
        		continue;
        	}
            if (this.hasOwnProperty(attr) && attr != "name") copy[attr] = clone(this[attr]);
        }
	return copy;
}

Joint.prototype.setUserData = function(data){
	this.userData = data;
};

Joint.prototype.setLocalAnchorA = function(x, y){
	this.localAnchorA = [x, y];
};
Joint.prototype.setLocalAnchorB = function(x, y){
	this.localAnchorB = [x, y];
};

Joint.prototype.moveAnchorA = function(x, y){
	if(this.jointType != Joint.JOINT_AREA && this.jointType != Joint.JOINT_MOTOR && this.jointType != Joint.JOINT_GEAR){
		this.localAnchorA[0] += x;
		this.localAnchorA[1] += y;
	}
};

Joint.prototype.moveAnchorB = function(x, y){
	if(this.jointType != Joint.JOINT_AREA && this.jointType != Joint.JOINT_MOTOR && this.jointType != Joint.JOINT_GEAR){
		this.localAnchorB[0] += x;
		this.localAnchorB[1] += y;
	}
};
Joint.prototype.moveFrequecyHZ = function(x, y){
	this.frequencyHZ += ( x + y) / 2;
};
Joint.prototype.getFrequecyHZBounds = function(x, y){
	
	var a = this.localAnchorA[0];
	var b = this.localAnchorA[1] + this.frequencyHZ;
	var c = 16;
	var d = 16;
	
	return [a,b,c,d]
};

Joint.prototype.move = function(x, y){
	if(this.jointType != Joint.JOINT_MOTOR && this.jointType != Joint.JOINT_GEAR){
		this.position[0] += x;
		this.position[1] += y;

		this.moveAnchorA(x, y);
		this.moveAnchorB(x, y);

		if (this.jointType == Joint.JOINT_PULLEY){
			this.moveGroundAnchorA(x, y);
			this.moveGroundAnchorB(x, y);
		}
	}
};

Joint.prototype.setPosition = function(x, y){
	this.move(x - this.position[0], y - this.position[1]);
};

Joint.prototype.rotate = function(angle, pivotX, pivotY){
	{
		if (pivotX == null || pivotY == null){
			pivotX = this.localAnchorA[0];
			pivotY = this.localAnchorA[1];
		}
		// update position
		var x = this.localAnchorA[0] - pivotX;
		var y = this.localAnchorA[1] - pivotY;
		var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
		var length = Math.pow(x * x + y * y, 0.5);
		this.localAnchorA[0] = pivotX + length * Math.cos(newAngle * Math.PI / 180);
		this.localAnchorA[1] = pivotY + length * Math.sin(newAngle * Math.PI / 180);
	}
	{
		if (pivotX == null || pivotY == null){
			pivotX = this.localAnchorB[0];
			pivotY = this.localAnchorB[1];
		}
		// update position
		var x = this.localAnchorB[0] - pivotX;
		var y = this.localAnchorB[1] - pivotY;
		var newAngle = angle + Math.atan2(y, x) * 180 / Math.PI;
		var length = Math.pow(x * x + y * y, 0.5);
		this.localAnchorB[0] = pivotX + length * Math.cos(newAngle * Math.PI / 180);
		this.localAnchorB[1] = pivotY + length * Math.sin(newAngle * Math.PI / 180);
	}
};

Joint.prototype.scale = function(sx, sy, pivotX, pivotY){
	
	if(this.jointType != Joint.JOINT_AREA){
		if (pivotX == null || pivotY == null){
			pivotX = this.position[0];
			pivotY = this.position[1];
		}

		this.scaleXY[0] *= sx;
		this.scaleXY[1] *= sy;

		this.move(-pivotX, -pivotY);

		this.position[0] *= sx;
		this.position[1] *= sy;

		this.localAnchorA[0] *= sx;
		this.localAnchorA[1] *= sy;
		this.localAnchorB[0] *= sx;
		this.localAnchorB[1] *= sy;

		this.move(pivotX, pivotY);
	}
	else{
		//nothing need to do for JOINT_AREA
	}
};

Joint.prototype.setScale = function(sx, sy, pivotX, pivotY){
	this.scale(sx / this.scaleXY[0], sy / this.scaleXY[1], pivotX, pivotY);
};

Joint.prototype.getBounds = function(){
	return [this.position[0], this.position[1], 16, 16];
};

Joint.prototype.getAnchorABounds = function(){
	return [this.localAnchorA[0], this.localAnchorA[1], 16, 16];
};

Joint.prototype.getAnchorBBounds = function(){
	return [this.localAnchorB[0], this.localAnchorB[1], 16, 16];
};

// distance joint
Joint.prototype.setLength = function(length){
	this.length = length;
};
Joint.prototype.setDampingRatio = function(dampingRatio){
	this.dampingRatio = dampingRatio;
};
Joint.prototype.setFrequency = function(frequency){
	this.frequencyHZ = frequency;
};

// weld joint
Joint.prototype.setReferenceAngle = function(angle){
	this.referenceAngle = angle * Math.PI / 180;
};

Joint.prototype.changeReferenceAngle = function(delta){
	this.referenceAngle += delta;
};

// revolute joint
Joint.prototype.changeLowerAngle = function(delta){
	this.lowerAngle += delta;
	// if joint is wheel or prismatic, then edit localAxis 
	if (this.jointType == Joint.JOINT_PRISMATIC || this.jointType == Joint.JOINT_WHEEL){
		this.rotateLocalAxis(delta);
	}
};
Joint.prototype.changeUpperAngle = function(delta){
	this.upperAngle += delta;
};
Joint.prototype.setLowerAngle = function(angle){
	this.lowerAngle = angle;
};
Joint.prototype.setUpperAngle = function(angle){
	this.upperAngle = angle;
};
Joint.prototype.setMotorSpeed = function(speed){
	this.motorSpeed = speed;
};
Joint.prototype.setMaxMotorTorque = function(torque){
	this.maxMotorTorque = torque;
};

// wheel and prismatic joint
Joint.prototype.rotateLocalAxis = function(delta){
	var newAngle = -Math.atan2(this.localAxisA[1], this.localAxisA[0]) + delta * Math.PI / 180;
	this.localAxisA = [Math.cos(newAngle), -Math.sin(newAngle)];
};

// pulley joint
Joint.prototype.setGroundAnchorA = function(x, y){
	this.groundAnchorA = [x, y];
};
Joint.prototype.setGroundAnchorB = function(x, y){
	this.groundAnchorB = [x, y];
};

Joint.prototype.moveGroundAnchorA = function(x, y){
	this.groundAnchorA[0] += x;
	this.groundAnchorA[1] += y;
};

Joint.prototype.moveGroundAnchorB = function(x, y){
	this.groundAnchorB[0] += x;
	this.groundAnchorB[1] += y;
};

Joint.prototype.setLengthA = function(length){
	this.lengthA = length;
};

Joint.prototype.setLengthB = function(length){
	this.lengthB = length;
};

Joint.prototype.setMaxLengthA = function(length){
	this.maxLengthA = length;
};

Joint.prototype.setMaxLengthB = function(length){
	this.maxLengthB = length;
};

Joint.prototype.getGroundAnchorABounds = function(){
	return [this.groundAnchorA[0], this.groundAnchorA[1], 16, 16];
};

Joint.prototype.getGroundAnchorBBounds = function(){
	return [this.groundAnchorB[0], this.groundAnchorB[1], 16, 16];
};
Joint.prototype.setBodiesIndex = function(bodies){
	this.bodiesIndex = [];
	for(b=0;b<this.bodies.length;b++){
		this.bodiesIndex.push(bodies.indexOf(this.bodies[b]))
	}
};

Joint.prototype.toPhysics = function(bodies, joints){
	var joint = new PhysicsJoint(this);
	joint.bodyA = bodies.indexOf(this.bodyA);
	joint.bodyB = bodies.indexOf(this.bodyB);
	if (joint.jointType == Joint.JOINT_PULLEY){
		joint.maxLengthA = Math.pow((this.groundAnchorA[0] - this.localAnchorA[0]) * (this.groundAnchorA[0] - this.localAnchorA[0]) + 
									(this.groundAnchorA[1] - this.localAnchorA[1]) * (this.groundAnchorA[1] - this.localAnchorA[1]), 0.5);
		joint.maxLengthB = Math.pow((this.groundAnchorB[0] - this.localAnchorB[0]) * (this.groundAnchorB[0] - this.localAnchorB[0]) + 
									(this.groundAnchorB[1] - this.localAnchorB[1]) * (this.groundAnchorB[1] - this.localAnchorB[1]), 0.5);
		joint.lengthA = joint.maxLengthA;
		joint.lengthB = joint.maxLengthB;
	}
	if (joint.jointType != Joint.JOINT_GEAR && joint.jointType != Joint.JOINT_MOUSE && joint.jointType != Joint.JOINT_AREA){
		var rotation, dx, dy, length, angle;
		if (this.bodyA.rotation != 0){
			rotation = -this.bodyA.rotation;
			dx = this.localAnchorA[0] - this.bodyA.position[0];
			dy = this.localAnchorA[1] - this.bodyA.position[1];
			length = Math.pow(dx * dx + dy * dy, 0.5);
			angle = Math.atan2(dy, dx);
			
			joint.localAnchorA = [	length * Math.cos(angle + rotation * Math.PI / 180), 
								 	length * Math.sin(angle + rotation * Math.PI / 180)  ];
		}
		else {
			joint.localAnchorA = [this.localAnchorA[0] - this.bodyA.position[0], this.localAnchorA[1] - this.bodyA.position[1]];
		}

		if (this.bodyB.rotation != 0){
			rotation = -this.bodyB.rotation;
			dx = this.localAnchorB[0] - this.bodyB.position[0];
			dy = this.localAnchorB[1] - this.bodyB.position[1]
			length = Math.pow(dx * dx + dy * dy, 0.5);
			angle = Math.atan2(dy, dx);

			joint.localAnchorB = [	length * Math.cos(angle + rotation * Math.PI / 180), 
								 	length * Math.sin(angle + rotation * Math.PI / 180)  ];
		}
		else {
			joint.localAnchorB = [this.localAnchorB[0] - this.bodyB.position[0], this.localAnchorB[1] - this.bodyB.position[1]];
		}
	}
	if (joint.jointType == Joint.JOINT_GEAR) {
		joint.joint1 = joints.indexOf(this.joint1);
		joint.joint2 = joints.indexOf(this.joint2);
	}
	if (joint.jointType == Joint.JOINT_MOUSE) {
	    joint.groundBody = [this.localAnchorA[0], this.localAnchorA[1]];
	    joint.target = [this.localAnchorB[0], this.localAnchorB[1]];
		joint.maxForce = this.maxForce;
		joint.frequencyHZ = this.frequencyHZ;
		joint.dampingRatio = this.dampingRatio;
		joint.userData = this.userData;
		
		delete joint.bodyA
		delete joint.localAnchorA
		delete joint.localAnchorB
	}
	if (joint.jointType == Joint.JOINT_AREA) {
	
		joint.bodies = [];
		for(b=0;b<this.bodies.length;b++){
			joint.bodies.push(bodies.indexOf(this.bodies[b]))
		}
		
		joint.frequencyHZ = this.frequencyHZ;
		joint.dampingRatio = this.dampingRatio;
		joint.userData = this.userData;
		
	}
	if(joint.jointType == Joint.JOINT_FRICTION){
	    joint.maxForce = this.maxForce;
	    joint.maxTorque = this.maxTorque;
	}
	else if(joint.jointType == Joint.JOINT_MOTOR){
	    joint.maxForce = this.maxForce;
	    joint.maxTorque = this.maxTorque;
	    joint.linearOffset = this.linearOffset;
	    joint.angularOffset = this.angularOffset;
	    joint.correctionFactor = this.correctionFactor;
		
		delete joint.localAnchorA
		delete joint.localAnchorB
	}
	return joint;
};