// to render viewport
function Renderer(context, sceneManager){
	this.scale = 1;
	this.nscale = 1;
	this.context = context;
	this.width = 0;
	this.height = 0;
	this.backgroundColor = "rgb(23, 24, 28)";
	this.gridColor = "#00ff00";
	this.showGrid = true;
	this.DEBUG = false;
	this.shapeSelectedColor = "rgba(228, 228, 177, 0.4)";
	this.dynamicBodyColor = "rgba(229, 178, 178, 0.4)";
	this.staticBodyColor = "rgba(127, 229, 127, 0.4)";
	this.kinematicBodyColor = "rgba(127, 127, 229, 0.4)";
	this.vertexColor = "rgba(255, 0, 0, 0.5)";
	
	
	this.BodyAlpha = 1;
	this.JointAlpha = 1;
	this.ParticleAlpha = 1;
	this.JointColor = '#aaa';
	
	this.bodyCenter = true;
	
	this.sceneManager = sceneManager;
	

	var jointAnchor = new Image();
		jointAnchor.src = "ui/jointAnchor.svg";
	var jointAnchorA = new Image();
		jointAnchorA.src = "ui/jointAnchorA.svg";
	var jointAnchorB = new Image();
		jointAnchorB.src = "ui/jointAnchorB.svg";		
	var jointAnchorC = new Image();
		jointAnchorC.src = "ui/rotateAnchor.svg";	
	this.jointAnchors = [jointAnchor, jointAnchorA, jointAnchorB, jointAnchorC];
}

Renderer.prototype.setScale = function(s){
	this.scale = s;
}

Renderer.prototype.setStageWidthHeight = function(w, h){
	this.width = w;
	this.height = h;
};


Renderer.prototype.renderVertex = function(v){
	
	this.context.globalAlpha = 1;
	this.context.strokeStyle = "#f00";
	this.context.fillStyle = this.vertexColor;
	this.renderBox(v.x, v.y, v.width / this.nscale, v.height / this.nscale, true);
	
	if (v.isSelected){
		this.context.strokeStyle = "#0f0";
		this.context.lineWidth = 1 / this.scale;
		this.renderBox(v.x, v.y, v.width / this.nscale, v.height / this.nscale, false);;
	}
};

Renderer.prototype.renderJoint = function(joint, navigator){
	try {
		if(!joint || !joint.localAnchorA || !joint.localAnchorB) return;
		
		this.context.save();
		var fontStyle = 10 * (1.06) / this.scale + "px Arial";
		var width = 16;
		var height = 16;
		
		if(joint.isSelected) this.JointColor = "#fff";
		else this.JointColor = "#aaa";
		
		if(joint.jointType == Joint.JOINT_AREA){
			if(!joint.bodies || !joint.bodies[0] || !joint.bodies[joint.bodies.length-1]) return;
			joint.position[0] = (joint.bodies[0].position[0]+joint.bodies[joint.bodies.length-1].position[0])/2;
			joint.position[1] = (joint.bodies[0].position[1]+joint.bodies[joint.bodies.length-1].position[1])/2;
			
			this.context.globalAlpha = this.JointAlpha;
			this.context.translate(joint.position[0], joint.position[1]);
			this.context.drawImage(this.jointAnchors[0], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
		}
		else if(joint.jointType == Joint.JOINT_MOTOR){
			if(!joint.bodyA || !joint.bodyB) return;
			joint.position[0] = (joint.bodyA.position[0] + joint.bodyB.position[0]) / 2;
			joint.position[1] = (joint.bodyA.position[1] + joint.bodyB.position[1]) / 2;
			this.context.globalAlpha = this.JointAlpha;
			this.context.translate(joint.position[0], joint.position[1]);
			this.context.drawImage(this.jointAnchors[0], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
		}
		else if(joint.jointType == Joint.JOINT_GEAR){
			if(!joint.joint1 || !joint.joint2 || !joint.bodyA || !joint.bodyB) return;
			joint.localAnchorA = joint.joint1.position;
			joint.localAnchorB = joint.joint2.position;
			
			joint.position = [(joint.bodyA.position[0] + joint.bodyB.position[0]) / 2, (joint.bodyA.position[1] + joint.bodyB.position[1]) / 2];
			
			this.context.globalAlpha = this.JointAlpha;
			this.context.translate(joint.position[0], joint.position[1]);
			this.context.drawImage(this.jointAnchors[0], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
		}
		else {
			joint.position = [(joint.localAnchorA[0] + joint.localAnchorB[0]) / 2, (joint.localAnchorA[1] + joint.localAnchorB[1]) / 2];
			this.context.globalAlpha = this.JointAlpha;
			this.context.translate(joint.position[0], joint.position[1]);
			this.context.drawImage(this.jointAnchors[0], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
		
			if (joint.isSelected){
				this.context.translate(joint.localAnchorA[0] - joint.position[0], joint.localAnchorA[1] - joint.position[1]);
				this.context.drawImage(this.jointAnchors[1], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
				this.context.translate(joint.localAnchorB[0] - joint.localAnchorA[0], joint.localAnchorB[1] - joint.localAnchorA[1]);
				this.context.drawImage(this.jointAnchors[2], -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
				if (joint.jointType == Joint.JOINT_PULLEY && joint.groundAnchorA && joint.groundAnchorB){
					this.context.translate(joint.groundAnchorA[0] - joint.localAnchorB[0], joint.groundAnchorA[1] - joint.localAnchorB[1]);
					this.context.drawImage(this.jointAnchors[1],  -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
					this.context.translate(joint.groundAnchorB[0] - joint.groundAnchorA[0], joint.groundAnchorB[1] - joint.groundAnchorA[1]);
					this.context.drawImage(this.jointAnchors[2],  -width / 2 / this.nscale, -height / 2 / this.nscale, width / this.nscale, height / this.nscale);
				}
			}

		}

		this.context.restore();

		if(joint.jointType == Joint.JOINT_REVOLUTE && joint.bodyB){
			this.context.save();
			this.context.globalAlpha = this.JointAlpha;
			this.context.translate(joint.position[0], joint.position[1]);
			var localAnchor = joint.localAnchorB;
			var body = joint.bodyB;
			var x1 = localAnchor[0];
			var y1 = localAnchor[1];
			var x2 = body.position[0];
			var y2 = body.position[1];
			var bodyAngle = Math.atan2( y2 - y1, x2 - x1 ) * ( 180 / Math.PI );
			this.context.rotate(bodyAngle * Math.PI / 180);
			this.context.drawImage(this.jointAnchors[3], -32 / 2 / this.scale, -32 / 2 / this.scale, 32 / this.scale, 32 / this.scale);
			this.context.restore();
			if(joint.inEditMode && joint.bodyA && joint.bodyB){
				this.context.globalAlpha = this.JointAlpha;
				this.context.fillStyle = "#ffff00";
				this.context.font = fontStyle;
				this.context.fillText("A", joint.bodyA.position[0], joint.bodyA.position[1]);
				this.context.fillText("B", joint.bodyB.position[0], joint.bodyB.position[1]);
			}
		}
		
		this.context.globalAlpha = this.JointAlpha;
		this.context.lineWidth = 2 / this.scale;
		this.setLineDash(3 / this.scale, 3 / this.scale);
		this.context.beginPath();
		this.context.strokeStyle = this.JointColor;
		if (joint.jointType == Joint.JOINT_GEAR){	
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();
		}
		if (joint.jointType == Joint.JOINT_DISTANCE ||  joint.jointType == Joint.JOINT_MOUSE){
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();
		}
		if (joint.jointType == Joint.JOINT_MOTOR && joint.bodyA && joint.bodyB){
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.stroke();
		}
		if (joint.jointType == Joint.JOINT_AREA && joint.bodies){
			for(n = 0; n < joint.bodies.length - 1; n++){
				if(joint.bodies[n] && joint.bodies[n+1]){
					this.context.moveTo(joint.bodies[n].position[0], joint.bodies[n].position[1]);
					this.context.lineTo(joint.bodies[n+1].position[0], joint.bodies[n+1].position[1]);
					this.context.stroke();
				}
			}
		}
		
		if (joint.jointType == Joint.JOINT_ROPE && joint.bodyA && joint.bodyB){
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.moveTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();

			var x = joint.localAnchorA[0];
			var y = joint.localAnchorA[1] + joint.frequencyHZ;
			
			if(navigator.checkPointInCircle(joint.localAnchorA[0], joint.localAnchorA[1], joint.localAnchorB[0], joint.localAnchorB[1], joint.frequencyHZ)){
				this.context.strokeStyle = "#0000ff50";
				this.context.fillStyle = "#0000ff10";	
			}
			else{
				this.context.strokeStyle = "#ff000050";
				this.context.fillStyle = "#ff000010";
			}
			
			this.context.save();
			this.setLineDash(0, 0);
			this.context.beginPath();
			this.context.moveTo(x, y);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.stroke();
			var freqBounds = joint.getFrequecyHZBounds();
			if(freqBounds){
				var size = freqBounds[2]/2;
				this.renderCircle(x, y, ( size / 2) / this.scale, true);
			}
			if (joint.inEditMode){
				this.context.lineWidth = 1 / this.scale;
				this.renderCircle(joint.localAnchorA[0], joint.localAnchorA[1], Math.abs(joint.frequencyHZ), true);
			}
			this.context.restore();
		}
		if (joint.jointType == Joint.JOINT_PULLEY && joint.groundAnchorA && joint.groundAnchorB){
			this.context.moveTo(joint.groundAnchorA[0], joint.groundAnchorA[1]);
			this.context.lineTo(joint.groundAnchorB[0], joint.groundAnchorB[1]);
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.groundAnchorA[0], joint.groundAnchorA[1]);
			this.context.moveTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.lineTo(joint.groundAnchorB[0], joint.groundAnchorB[1]);
			this.context.stroke();
		}
		if ((joint.jointType == Joint.JOINT_WELD || joint.jointType == Joint.JOINT_FRICTION) && joint.bodyA && joint.bodyB){		
			this.context.strokeStyle = this.JointColor;
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.moveTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();
		}
		if (joint.jointType == Joint.JOINT_REVOLUTE && joint.bodyA && joint.bodyB){
			this.context.strokeStyle = this.JointColor;
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.moveTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();
			
			if(joint.inEditMode){
				var x = joint.localAnchorB[0] + 100 * Math.cos(joint.referenceAngle * Math.PI / 180);
				var y = joint.localAnchorB[1] + 100 * Math.sin(joint.referenceAngle * Math.PI / 180);
				this.context.strokeStyle = "#14d94f"; //Green
				this.context.beginPath();
				this.context.moveTo(joint.localAnchorB[0], joint.localAnchorB[1]);
				this.context.lineTo(x, y);
				this.context.stroke();
				this.context.closePath();
					
				if (joint.enableLimit){
					var localAnchor = joint.localAnchorB;
					var body = joint.bodyB;
					var x1 = localAnchor[0];
					var y1 = localAnchor[1];
					var x2 = body.position[0];
					var y2 = body.position[1];
					var bodyAngle = Math.atan2( y2 - y1, x2 - x1 ) * ( 180 / Math.PI );
					var angle = joint.referenceAngle + bodyAngle;
					
					var lx = localAnchor[0] + 100 * Math.cos((joint.lowerAngle * Math.PI / 180) + (angle  * Math.PI / 180));
					var ly = localAnchor[1] + 100 * Math.sin((joint.lowerAngle * Math.PI / 180) + (angle  * Math.PI / 180));
					this.context.strokeStyle = "#f54242"; //Red
					this.context.beginPath();
					this.context.moveTo(localAnchor[0], localAnchor[1]);
					this.context.lineTo(lx, ly);
					this.context.stroke();
					this.context.closePath();
					
					var a = (angle  * Math.PI / 180) - (joint.referenceAngle  * Math.PI / 180);
					var l = (joint.lowerAngle * Math.PI / 180) + (angle  * Math.PI / 180)
					this.context.fillStyle = "#f5424250"; //Red
					this.context.beginPath();
					this.context.moveTo(localAnchor[0], localAnchor[1]);
					this.context.arc(localAnchor[0], localAnchor[1], 30, l, a, false);
					this.context.fill();
					
					this.context.strokeStyle = "#4F80FF"; //Blue
					this.context.beginPath();
					this.context.moveTo(localAnchor[0], localAnchor[1]);
					var ux = localAnchor[0] + 100 * Math.cos((joint.upperAngle * Math.PI / 180) + (angle  * Math.PI / 180));
					var uy = localAnchor[1] + 100 * Math.sin((joint.upperAngle * Math.PI / 180) + (angle  * Math.PI / 180));
					this.context.lineTo(ux, uy);
					this.context.stroke();
					this.context.closePath();

					var u = (joint.upperAngle * Math.PI / 180) + (angle  * Math.PI / 180);
					this.context.fillStyle = "#4F80FF50"; //Blue
					this.context.beginPath();
					this.context.moveTo(localAnchor[0], localAnchor[1]);
					this.context.arc(localAnchor[0], localAnchor[1], 30, a, u, false);
					this.context.fill();
				}
			}
		}
		if (joint.jointType == Joint.JOINT_WHEEL && joint.bodyA && joint.bodyB){
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.stroke();	
			this.context.moveTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();
			this.context.strokeStyle = "#ff0";
			this.context.beginPath();
			this.context.moveTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			var angle = Math.atan2(joint.localAxisA[1], joint.localAxisA[0]);
			var x = joint.localAnchorB[0] + 100 * Math.cos(angle);
			var y = joint.localAnchorB[1] + 100 * Math.sin(angle);
			this.context.lineTo(x, y);
			this.context.stroke();
			this.context.closePath();
		}
		
		if (joint.jointType == Joint.JOINT_PRISMATIC && joint.bodyA && joint.bodyB){
			this.context.moveTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.moveTo(joint.bodyA.position[0], joint.bodyA.position[1]);
			this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
			this.context.stroke();	
			this.context.moveTo(joint.bodyB.position[0], joint.bodyB.position[1]);
			this.context.lineTo(joint.localAnchorB[0], joint.localAnchorB[1]);
			this.context.stroke();

			if (joint.inEditMode){
				this.context.strokeStyle = "#0f0";
				this.context.beginPath();
				this.context.moveTo(joint.localAnchorB[0], joint.localAnchorB[1]);
				var x = joint.localAnchorB[0] + 100 * Math.cos(joint.referenceAngle * Math.PI / 180);
				var y = joint.localAnchorB[1] + 100 * Math.sin(joint.referenceAngle * Math.PI / 180);
				this.context.lineTo(x, y);
				this.context.stroke();
			}
			if (joint.enableLimit){				
				var x0 = joint.localAnchorA[0] + joint.localAxisA[0] * joint.lowerTranslation;
				var y0 = joint.localAnchorA[1] + joint.localAxisA[1] * joint.lowerTranslation;
				var x1 = joint.localAnchorA[0] + joint.localAxisA[0] * joint.upperTranslation;
				var y1 = joint.localAnchorA[1] + joint.localAxisA[1] * joint.upperTranslation;
				this.context.strokeStyle = "#f54242";
				this.context.beginPath();
				this.context.moveTo(x0, y0);
				this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
				this.context.stroke();
				this.context.strokeStyle = "#4F80FF";
				this.context.beginPath();
				this.context.moveTo(x1, y1);
				this.context.lineTo(joint.localAnchorA[0], joint.localAnchorA[1]);
				this.context.stroke();
			}
			else{
				this.context.strokeStyle = "#ff0";
				this.context.beginPath();
				this.context.moveTo(joint.localAnchorB[0], joint.localAnchorB[1]);
				var angle = Math.atan2(joint.localAxisA[1], joint.localAxisA[0]);
				var x = joint.localAnchorB[0] + 100 * Math.cos(angle);
				var y = joint.localAnchorB[1] + 100 * Math.sin(angle);
				this.context.lineTo(x, y);
				this.context.stroke();
				this.context.closePath();
			}
		}
		
		this.context.lineWidth = 1;
		this.context.globalAlpha = 1;
		this.setLineDash(0, 0);
		this.context.closePath();
	} catch(e) {
		console.error("Renderer error in renderJoint", e);
	}
};

Renderer.prototype.renderImage = function(s, body){
	try {
		if(!s || !body) return;
		var points = s.vertices;
		
		if(points && points.length > 0){
			this.context.save();
			this.context.beginPath();
			this.context.moveTo(points[0].x, points[0].y);
			for(var i = 1; i < points.length; i++){
				if(points[i]) this.context.lineTo(points[i].x, points[i].y);
			}
			this.context.closePath();
			this.context.clip();
			this.context.translate(s.x, s.y);
			this.context.rotate(s.rotation * Math.PI / 180);
			this.context.globalAlpha = (s.opacity || 100) / 100;
			if(s.flip) this.context.scale(s.flip[0], s.flip[1]);
			if(s.sprite != null){
				this.context.drawImage(s.sprite, -s.width/2, -s.height/2, s.width, s.height);
			}
			this.context.restore();
		}
		
		
		if(body.isSelected){
			if (body.sprites && body.sprites.length > 0){
				var selectedS = body.sprites[body.selectedSprite];
				if(selectedS && selectedS.hasLoaded && (this.sceneManager.checkState(this.sceneManager.STATE_IMAGE_EDIT_MODE) || this.sceneManager.checkState(this.sceneManager.STATE_IMAGE_VERTEX_EDIT_MODE))){
					var bounds = selectedS.getBounds();
					if(bounds){
						this.context.save();
						this.context.globalAlpha = 1;
						if(selectedS.sprite != null){
							this.context.strokeStyle = "#00ff0050";
							this.context.fillStyle = "#00ff0005";
						}
						else{
							this.context.strokeStyle = "#ff000050";
							this.context.fillStyle = "#ff000005";
						}
						this.context.lineWidth = 1 / this.scale;
						this.renderBox(bounds[0], bounds[1], bounds[2], bounds[3], true);	
						this.centroid(bounds[0], bounds[1], 12 / this.scale);
						this.context.restore();
					}
					
					var sPoints = selectedS.vertices;
					if(sPoints && sPoints.length > 0){
						if(selectedS.inEditMode){
							this.context.lineWidth = 1 / this.scale;
							this.context.strokeStyle = "#ff0000";
							this.context.beginPath();
							this.context.moveTo(sPoints[0].x, sPoints[0].y);
							this.renderVertex(sPoints[0]);
							for(var i = 1; i < sPoints.length; i++){
								if(sPoints[i]){
									this.context.lineTo(sPoints[i].x, sPoints[i].y);
									this.renderVertex(sPoints[i]);
								}
							}
							this.context.closePath();
							this.context.stroke();
						}
					}
				}
			}
		}
	} catch(e) {
		console.error("Renderer error in renderImage", e);
	}
}
Renderer.prototype.renderBody = function(body, index){
	try {
		if(!body) return;
		// update aabb
		body.calculateBounds();
		// render shapes
		if(body.shapes){
			for (var i = 0; i < body.shapes.length; i++){
				if (body.bodyType == 0){
					this.renderShape(body.shapes[i], this.staticBodyColor);
				}
				else if (body.bodyType == 1){
					this.renderShape(body.shapes[i], this.kinematicBodyColor);
				}
				else {
					this.renderShape(body.shapes[i], 0);
				}
			}
		}

		// render aabb 
		if (body.isSelected && body.bounds){
			this.context.strokeStyle = 'rgba(0, 177, 177, 0.5)';
			this.context.fillStyle = 'rgba(0, 177, 177, 0.1)';
			this.context.lineWidth = 2 / this.scale;
			this.renderBox(body.bounds[0], body.bounds[1], body.bounds[2], body.bounds[3], true);
			if(this.DEBUG){
				this.context.lineWidth = 1;
				this.context.fillStyle = 'rgba(0, 177, 177, 1)';
				this.context.font = `${10 / this.scale}px Arial`;
				this.context.fillText(`Rotation : ${(body.rotation || 0).toFixed(2)}°`, body.bounds[0] - (body.bounds[2] / 2), body.bounds[1] - (body.bounds[3] / 2) - (3 / this.scale));
				this.context.fillText(`[${index}] : ${body.name || 'Body'}`, body.bounds[0] - (body.bounds[2] / 2), body.bounds[1] + (body.bounds[3] / 2) + (10 / this.scale));		    
			}

		}

		// draw axes of body
		if(this.bodyCenter && body.position) this.drawAxes(body.position[0], body.position[1], 25 / this.scale);
	} catch(e) {
		console.error("Renderer error in renderBody", e);
	}
};

Renderer.prototype.renderParticles = function(p){
	try {
		if(!p || !p.shape || !p.position) return;
		p.calculateBounds();

		var col = p.color || [255, 255, 255, 1];
		
		this.context.save();
		this.context.globalAlpha = this.ParticleAlpha;
		this.context.lineWidth = 1.5 / this.scale;
		this.context.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`;
		this.context.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${col[3]})`;
		if(p.shape.type == 0){
			this.context.save();
			this.context.translate(p.position[0], p.position[1]);
			this.context.rotate((p.rotation || 0) * Math.PI / 180);
			this.context.beginPath();
			this.context.moveTo(0, 0);
			this.context.lineTo(p.shape.radius || 0, 0);
			this.context.stroke();
			this.renderCircle(0, 0, p.shape.radius || 0, true);
			this.context.restore();
		}
		else if(p.shape.type == 1){
			this.context.save();
			this.context.translate(p.position[0], p.position[1]);
			this.context.rotate((p.rotation || 0) * Math.PI / 180);
			this.renderBox(0, 0, p.shape.width || 0, p.shape.height || 0, true);
			this.context.restore();
		}
		else if(p.shape.type == 2 && p.shape.vertices && p.shape.vertices.length > 0){
			this.context.beginPath();
			this.context.moveTo(p.shape.vertices[0].x, p.shape.vertices[0].y);
			for (var i = 1; i < p.shape.vertices.length; i++){
				if(p.shape.vertices[i]) this.context.lineTo(p.shape.vertices[i].x, p.shape.vertices[i].y);
			}
			this.context.stroke();
			this.context.fill();
			this.context.closePath();
		}

		this.context.restore();
		
		if (p.isSelected && p.bounds){
			this.context.strokeStyle = "rgba(0, 177, 177, 0.5)";
			this.context.lineWidth = 2 / this.scale;
			this.renderBox(p.bounds[0], p.bounds[1], p.bounds[2], p.bounds[3], false);
			this.context.fillStyle = "rgba(0, 177, 177, 0.05)";
			this.renderBox(p.bounds[0], p.bounds[1], p.bounds[2], p.bounds[3], true);
			this.context.lineWidth = 1 / this.scale;
			if(p.shape.type == 2 && p.shape.inEditMode && p.shape.vertices && p.shape.vertices.length > 0){
				this.context.beginPath();
				this.context.strokeStyle = "#f00";
				this.context.moveTo(p.shape.vertices[0].x, p.shape.vertices[0].y);
				this.renderVertex(p.shape.vertices[0]);
				for (var i = 1; i < p.shape.vertices.length; i++){
					if(p.shape.vertices[i]){
						this.context.lineTo(p.shape.vertices[i].x, p.shape.vertices[i].y);
						this.renderVertex(p.shape.vertices[i]);
					}
				}
				this.context.closePath();
				this.context.stroke();
			}
		}
	} catch(e) {
		console.error("Renderer error in renderParticles", e);
	}
}


Renderer.prototype.renderShape = function(shape, bodyColor){
	try {
		if(!shape) return;
		shape.calculateBounds();
		
		this.context.globalAlpha = this.BodyAlpha;
		this.context.lineWidth = 1.5 / this.scale;
		
		if (shape.vertices && shape.vertices.length > 0){
			this.context.beginPath();
			this.context.moveTo(shape.vertices[0].x, shape.vertices[0].y);
			for (var i = 0; i < shape.vertices.length; i++){
				if(shape.vertices[i]){
					this.context.lineTo(shape.vertices[i].x, shape.vertices[i].y);
					if (shape.inEditMode){
						this.renderVertex(shape.vertices[i]);
					}
				}
			}
		}
		
		if (shape.shapeType == Shape.SHAPE_CHAIN || shape.shapeType == Shape.SHAPE_EDGE){
			this.context.strokeStyle = bodyColor || this.dynamicBodyColor;
			if (shape.isSelected){
				this.context.strokeStyle = this.shapeSelectedColor;
			}
			this.context.stroke();
		}
		else if(shape.shapeType == Shape.SHAPE_CIRCLE && shape.position){
				this.context.fillStyle = bodyColor || this.dynamicBodyColor;
				this.context.strokeStyle = bodyColor || this.dynamicBodyColor;
				if (shape.isSelected){
					this.context.fillStyle = this.shapeSelectedColor;
					this.context.strokeStyle = this.shapeSelectedColor;
				}
				this.context.save();
				this.context.translate(shape.position[0], shape.position[1]);
				this.context.rotate((shape.rotation || 0) * Math.PI / 180);
				this.context.beginPath();
				this.context.lineWidth = 1 / this.scale;
				this.context.moveTo(0, 0);
				this.context.lineTo(shape.radius || 0, 0);
				this.context.stroke()
				this.context.lineWidth = 0;
				//circle
				this.context.beginPath();
				this.context.arc(0, 0, shape.radius || 0, 0, 2 * Math.PI, false);
				this.context.fill();
				this.context.stroke();
				this.context.closePath();
				
				this.context.restore()
				
		}	
		else {
			this.context.closePath();
			this.context.fillStyle = bodyColor || this.dynamicBodyColor;
			this.context.strokeStyle = bodyColor || this.dynamicBodyColor;
			if (shape.isSelected){
				this.context.fillStyle = this.shapeSelectedColor;
			}
			this.context.fill();
			this.context.stroke();
		}
		
		// draw vtx if concave
		if (shape.shapeType == Shape.SHAPE_POLYGON && typeof shape.isConvex === 'function'){
			if (!shape.isConvex()){
				var polys = shape.decomposeToConvex(0, 0);
				if(polys){
					for(var i = 0; i < polys.length; i++){
						if (polys[i] && polys[i].vertices && polys[i].vertices.length > 0){
							this.context.strokeStyle = bodyColor || this.dynamicBodyColor;
							this.context.beginPath();
							var firstV = polys[i].vertices[0];
							var pPos = polys[i].position || [0, 0];
							this.context.moveTo(firstV[0] + pPos[0], firstV[1] + pPos[1]);
							for(var j = 1; j < polys[i].vertices.length; j++){
								var v = polys[i].vertices[j];
								this.context.lineTo(v[0] + pPos[0], v[1] + pPos[1]);
							}
							this.context.closePath();
							this.context.stroke();
						}
					}
				}
			}
		}

		// render aabb
		if (shape.isSelected && shape.bounds){
			this.context.strokeStyle = 'rgba(0, 177, 177, 0.5)';
			this.context.fillStyle = 'rgba(0, 177, 177, 0.05)';
			this.context.lineWidth = 2 / this.scale;
			this.renderBox(shape.bounds[0], shape.bounds[1], shape.bounds[2], shape.bounds[3], false);
		}

		// draw axes & centroid of shape
		if(shape.isSelected && shape.centroid) this.centroid(shape.centroid[0], shape.centroid[1], 12 / this.scale);
		if(this.bodyCenter && shape.position) this.drawAxes(shape.position[0], shape.position[1], 25 / this.scale);
	} catch(e) {
		console.error("Renderer error in renderShape", e);
	}
};

Renderer.prototype.centroid = function(x , y, scale){
	this.context.save();
    this.context.translate(x, y);
    this.context.strokeStyle = 'rgba(192,192,192,0.8)';
	this.context.lineWidth = 2 / this.scale;
	
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(scale/2, -scale/2);
	this.context.stroke();
	
	this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(-scale/2, -scale/2);
	this.context.stroke();
	
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(scale/2, scale/2);
    this.context.stroke();
	
	this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(-scale/2, scale/2);
	this.context.stroke();
	
    this.context.restore();
}
Renderer.prototype.drawAxes = function(x , y, scale){
    this.context.save();
    this.context.translate(x, y);
    this.context.strokeStyle = 'rgba(192,0,0,0.5)';
	this.context.lineWidth = 2 / this.scale;
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(scale, 0);
    this.context.stroke();
    this.context.strokeStyle = 'rgba(0,192,0,0.5)';
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(0, -scale);
    this.context.stroke();
    this.context.restore();
}
Renderer.prototype.renderGrid = function(range, cell_size_unused){
	if(this.showGrid){
		var cell_size = cell_size_unused;
		// this.conte
		for (var x = -range; x <= range; x += cell_size){
			this.context.moveTo(x * cell_size, -range * cell_size);
			this.context.lineTo(x * cell_size,  range * cell_size);
		}
		for (var y = -range; y <= range; y += cell_size){
			this.context.moveTo(-range * cell_size, y * cell_size);
			this.context.lineTo( range * cell_size, y * cell_size);	
		}
		this.context.strokeStyle = this.gridColor;
		this.context.lineWidth = (0.15 + 0.05 / cell_size) / this.scale;
		this.context.stroke();

		var cell_size = cell_size_unused / 2;
		for (var x = -range; x <= range; x += cell_size){
			if (x == 0){									// to darken y - axis
				this.context.moveTo((-0.05 * cell_size) / this.scale, (-range * cell_size) / this.scale);
				this.context.lineTo((-0.05 * cell_size) / this.scale, ( range * cell_size) / this.scale);
																						
				this.context.moveTo((-0.025 * cell_size) / this.scale, (-range * cell_size) / this.scale);
				this.context.lineTo((-0.025 * cell_size) / this.scale, ( range * cell_size) / this.scale);

				this.context.moveTo((x * cell_size) / this.scale, (-range * cell_size) / this.scale);
				this.context.lineTo((x * cell_size) / this.scale, ( range * cell_size) / this.scale);

				this.context.moveTo((0.025 * cell_size) / this.scale, (-range * cell_size) / this.scale);
				this.context.lineTo((0.025 * cell_size) / this.scale, ( range * cell_size) / this.scale);
				
				this.context.moveTo((0.05 * cell_size) / this.scale, (-range * cell_size) / this.scale);
				this.context.lineTo((0.05 * cell_size) / this.scale, ( range * cell_size) / this.scale);
			}
			this.context.moveTo(x * cell_size, -range * cell_size);
			this.context.lineTo(x * cell_size,  range * cell_size);
		}
		for (var y = -range; y <= range; y += cell_size){
			if (y == 0){									// to darken x - axis
				this.context.moveTo((-range * cell_size) / this.scale, (-0.05 * cell_size) / this.scale);
				this.context.lineTo(( range * cell_size) / this.scale, (-0.05 * cell_size) / this.scale);
																	   
				this.context.moveTo((-range * cell_size) / this.scale, (-0.025 * cell_size) / this.scale);
				this.context.lineTo(( range * cell_size) / this.scale, (-0.025 * cell_size) / this.scale);	
																	   
				this.context.moveTo((-range * cell_size) / this.scale, (y * cell_size) / this.scale);
				this.context.lineTo(( range * cell_size) / this.scale, (y * cell_size) / this.scale);
																	   
				this.context.moveTo((-range * cell_size) / this.scale, (0.025 * cell_size) / this.scale);
				this.context.lineTo(( range * cell_size) / this.scale, (0.025 * cell_size) / this.scale);	
																	   
				this.context.moveTo((-range * cell_size) / this.scale, (0.05 * cell_size) / this.scale);
				this.context.lineTo(( range * cell_size) / this.scale, (0.05 * cell_size) / this.scale);	
			}
			this.context.moveTo(-range * cell_size, y * cell_size);
			this.context.lineTo( range * cell_size, y * cell_size);	
		}
		this.context.strokeStyle = this.gridColor;
		this.context.lineWidth = (0.1 + 0.05 / cell_size) / this.scale;
		this.context.stroke();
		this.context.lineWidth = 1 / this.scale;

		// draw scale
		this.context.fillStyle = this.gridColor;
		this.context.font = (10 * (1 + 0.6 / cell_size)) / this.scale + "px Arial";
		for (var x = -range; x <= range; x += cell_size){
			if (x != 0 && (x * cell_size) % 100 == 0){			
				// this.context.fillText(x * cell_size, x * cell_size - (10) / this.scale, (-20 / cell_size) / this.scale);
				this.renderCircle(x * cell_size, 0, (3 * (0.5 + 0.5 / cell_size)) / this.scale, true);
			}
		}
		for (var y = -range; y <= range; y += cell_size){
			if (y != 0 && (y * cell_size) % 100 == 0){
				// this.context.fillText(y * cell_size, (20 / cell_size) / this.scale, y * cell_size + (5) / this.scale);
				this.renderCircle(0, y * cell_size, 3 * (0.5 + 0.5 / cell_size) / this.scale, true);
			}
		}
	}
};

Renderer.prototype.renderBox = function(x, y, w, h, fill){
	if (fill) this.context.fillRect(x - w / 2, y - h / 2, w, h);
	this.context.strokeRect(x - w / 2, y - h / 2, w, h);
};

Renderer.prototype.renderCircle = function(x, y, r, fill){
	this.context.beginPath();
	this.context.arc(x, y, r, 0, 2 * Math.PI, false);
	if (fill) this.context.fill();
	this.context.closePath();
	this.context.stroke();
};

Renderer.prototype.setLineDash = function(x_div, y_div){
	this.context.setLineDash([x_div, y_div]);
};

Renderer.prototype.clear = function(x, y, w, h){
	this.context.fillStyle = this.backgroundColor;
	this.context.clearRect(x, y, w, h);
	this.context.fillRect(x, y, w, h);
};

Renderer.prototype.getContext = function(){
	return this.context;
};