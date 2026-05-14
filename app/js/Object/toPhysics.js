

// exporting objects //
function Fixture(){
	this.shapes;
	this.restitution;
	this.friction;
	this.density;
	this.isSensor = false;
	this.maskBits = 65535;
	this.categoryBits = 1;
	this.groupIndex = 0;
	this.userData = null;
}

function PhysicsShape(type){
	this.type = parseInt(type);
	this.position = [0, 0];				// position relative to body				
	this.vertices = [];
	
	// for box shape
	this.width;
	this.height;

	// for circle shape
	this.radius;
}

function PhysicsBody(type){
	this.type = parseInt(type);
	this.userData = null;
	this.texture;
	this.fixtures = [];
	this.position = [0, 0];
	this.rotation = 0;
	this.isBullet = false;
	this.isFixedRotation = 0;
	this.linearDamping = 0;
	this.angularDamping = 0;
	this.gravityScale = 1;
}

function PhysicsParticle(type){
	this.type = parseInt(type);
	this.userData = null;
	this.position = [0, 0];
	this.angle = 0;
	this.strength = null;
	this.color = null;
	this.linearVelocity = [0,0];
	this.angularVelocity = 0;
	this.flags = null;
	this.lifetime = null;
	this.radius = 0.1;
}
function PhysicsParticleShape(type){
	this.type = parseInt(type);
	if(this.type == Particle.SHAPE_POLYGON){
		this.vertices = [];
	}
	else if(this.type == Particle.SHAPE_CIRCLE){
		this.radius = 25;
	}
	else if(this.type == Particle.SHAPE_BOX){
		this.width = 50;
		this.height = 50;
	}
}

function PhysicsJoint(joint){
	this.bodyA;
	this.bodyB;
	this._localAnchorA 		= joint.localAnchorA;
	this._localAnchorB 		= joint.localAnchorB;
	this.localAnchorA 		= joint.localAnchorA;
	this.localAnchorB 		= joint.localAnchorB;
	this.userData 			= joint.userData;
	this.collideConnected 	= joint.collideConnected;
	this.userData 			= joint.userData;

	this.jointType = parseInt(joint.jointType);
	if (this.jointType == Joint.JOINT_DISTANCE){
		this.length 		= joint.length;
		this.frequencyHZ 	= joint.frequencyHZ;
		this.dampingRatio 	= joint.dampingRatio;
	}
	else if (this.jointType == Joint.JOINT_WELD){
		this.referenceAngle = joint.referenceAngle;
	}
	else if (this.jointType == Joint.JOINT_REVOLUTE){
		this.enableLimit 	= joint.enableLimit;
	 	this.enableMotor 	= joint.enableMotor;
	 	this.lowerAngle 	= joint.lowerAngle;
		this.maxMotorTorque = joint.maxMotorTorque;
	 	this.motorSpeed 	= joint.motorSpeed;
	 	this.referenceAngle = joint.referenceAngle;
	 	this.upperAngle		= joint.upperAngle;
	}
	else if (this.jointType == Joint.JOINT_WHEEL){
		this.localAxisA 	= joint.localAxisA;
		this.enableMotor 	= joint.enableMotor;
		this.maxMotorTorque = joint.maxMotorTorque;
	 	this.motorSpeed 	= joint.motorSpeed;
	 	this.frequencyHZ 	= joint.frequencyHZ;
		this.dampingRatio 	= joint.dampingRatio;
	}
	else if (this.jointType == Joint.JOINT_PULLEY){
		this.groundAnchorA 	= joint.groundAnchorA;
		this.groundAnchorB 	= joint.groundAnchorB;
		this.lengthA	   	= joint.lengthA;
		this.lengthB		= joint.lengthB;
		this.maxLengthA     = joint.maxLengthA;
		this.maxLengthB     = joint.maxLengthB;
		this.ratio 			= joint.frequencyHZ;
	}
	else if (this.jointType == Joint.JOINT_GEAR){
		this.ratio 			= joint.frequencyHZ;
		this.joint1			= -1;
		this.joint2			= -1;
		this.localAnchorA   = undefined;
		this.localAnchorB   = undefined;
	}
	else if (this.jointType == Joint.JOINT_PRISMATIC){
		this.enableLimit 	= joint.enableLimit;
	 	this.enableMotor 	= joint.enableMotor;
	 	this.lowerTranslation 	= joint.lowerTranslation;
	 	this.upperTranslation 	= joint.upperTranslation;
	 	this.localAxisA 	= joint.localAxisA;
		this.maxMotorForce = joint.maxMotorTorque;
	 	this.motorSpeed 	= joint.motorSpeed;
	 	this.referenceAngle = joint.referenceAngle;
	}
	else if (this.jointType == Joint.JOINT_ROPE){
		this.maxLength = joint.frequencyHZ;
	}
}