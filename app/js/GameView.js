var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
var _navigator;

function GameView(canvas, navigator) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	_navigator = navigator;
	this.world;
	this.debugDraw = true;
	this.drawSprites = true;
	this.drawScale = 30;
	this.worldLoader = new b2Loader();
	this.hasLoaded = false;
	this.paused = false;
	this.functions = []
}

/* SETUP */
GameView.prototype.setup = function(scene, scripts){
	if (this.context){
		this.init(scene, scripts);
	}
};

/* RESCALE */
GameView.prototype.rescale = function(){
	// canvas.setAttribute('width', window.innerWidth);
	// canvas.setAttribute('height', window.innerHeight);
	// this.draw();
};

/* INIT */
GameView.prototype.init = function(scene, scripts){
	var ref = this
	
	this.canvas.addEventListener("mousemove", function(e) {
		for (func of ref.functions) {
			if(typeof func.mousemove == 'function' && mouseX && mouseY) func.mousemove(mouseX, mouseY)
		}
	});
	
	// add event listeners
	this.canvas.addEventListener("mousedown", function(e) {
		isMouseDown = true;
		handleMouseMove(e);
		for (func of ref.functions) {
			if(typeof func.mousedown == 'function' && mouseX && mouseY) func.mousedown(mouseX, mouseY, e)
		}
		this.addEventListener("mousemove", handleMouseMove, true);
	}, true);
	
	this.canvas.addEventListener("mouseup", function() {
		this.removeEventListener("mousemove", handleMouseMove, true);
		isMouseDown = false;
		for (func of ref.functions) {
			if(typeof func.mouseup == 'function') func.mouseup(null, null, e)
		}
		mouseX = undefined;
		mouseY = undefined;
	}, true);
	this.canvas.addEventListener("mouseleave", function() {
		this.removeEventListener("mousemove", handleMouseMove, true);
		isMouseDown = false;
		for (func of ref.functions) {
			if(typeof func.mouseleave == 'function') func.mouseleave(null, null, e)
		}
		mouseX = undefined;
		mouseY = undefined;
	}, true);
	
	// create physics world, loadScene
	var gravity = scene.world.gravity;
	var allowSleep = scene.world.allowSleep;
	this.debugDraw = scene.world.debugDraw;
	this.drawScale = scene.world.drawScale;
	this.drawSprites = scene.world.drawSprites;
	
	this.world = new b2World(new b2Vec2(gravity[0], gravity[1]), true);
	this.world.SetAllowSleeping(allowSleep);
	this.worldLoader.loadScene(scene, this.world);
	this.hasLoaded = true;
	
	for (s of scripts) {
		if (s.type = "javascript") {
			try {
				let e = eval(s.raw)
				if(typeof e == 'function') this.functions.push(new e(this.worldLoader, this.worldLoader.world, this))
			}
			catch(err) {
				console.log(err)
			}
		}
	}
};

/* DRAW */
GameView.prototype.draw = function(){
	
	this.world.ClearForces();
	
	var obj = this.worldLoader.loadedSprites;
	if(this.drawSprites){
		for (var k = 0; k < obj.length; k++){
			var sprite = obj[k];
			if(sprite.sprite != null){
				var body = sprite.body;
				var px = body.GetPosition().x * 30;
				var py = body.GetPosition().y * 30;
				var r = body.GetAngle();
				var points = sprite.vertices;
				this.context.save();
				this.context.translate(px, py);
				this.context.rotate(r - sprite.rot * Math.PI / 180);
				this.context.beginPath();
				this.context.moveTo(points[0].x, points[0].y);
				for(i = 1; i < points.length; i++){
					var p = points[i];
					this.context.lineTo(points[i].x, points[i].y);
				}
				this.context.closePath();
				this.context.clip();
				this.context.translate(sprite.x, sprite.y);
				this.context.rotate(sprite.angle * Math.PI / 180);
				this.context.globalAlpha = sprite.alpha;
				this.context.scale(sprite.flip[0], sprite.flip[1]);
				this.context.drawImage(sprite.sprite, -sprite.width / 2, -sprite.height / 2, sprite.width, sprite.height);
				this.context.restore(); 
			}
		}
	}
	
	if(this.debugDraw) debugDraw(this.context, this.world, this.drawScale, _navigator.scale);
	
	for (func of this.functions) {
		if(typeof func.draw == 'function') func.draw(this.context)
	}
	
};

/* UPDATE */
GameView.prototype.update = function(){
	
	if(isMouseDown && (!mouseJoint)) {
		var body = getBodyAtMouse(this.world);
		if(body) {
			var md = new b2MouseJointDef();
			md.bodyA = this.world.CreateBody(new box2d.b2BodyDef());
			md.bodyB = body;
			md.target = new b2Vec2(mouseX, mouseY);
			md.collideConnected = true;
			md.maxForce = 1000.0 * body.GetMass();
			mouseJoint = this.world.CreateJoint(md);
			body.SetAwake(true);
		}
	}
	
	if(mouseJoint) {
		if(isMouseDown) {
			mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
		} 
		else {
			this.world.DestroyJoint(mouseJoint);
			mouseJoint = null;
		}
	}
	
	this.world.Step(1 / 60, 10, 10);
};

GameView.prototype.dispose = function(){
	
};

GameView.prototype.updateView = function(){
	if (!this.paused){
		this.update();
	}
	this.draw();
}

function handleMouseMove(e) {
	mouseX = _navigator.screenPointToWorld(e.offsetX, e.offsetY)[0] / 30;
	mouseY = _navigator.screenPointToWorld(e.offsetX, e.offsetY)[1] / 30;
}

function getBodyAtMouse(world) {
	mousePVec = new b2Vec2(mouseX, mouseY);
	var aabb = new b2AABB();
	aabb.lowerBound = new b2Vec2(mouseX - 0.001, mouseY - 0.001);
	aabb.upperBound = new b2Vec2(mouseX + 0.001, mouseY + 0.001);
	selectedBody = null;
	world.QueryAABB(getBodyCB, aabb);
	return selectedBody;
}

function getBodyCB(fixture) {
	if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
		if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
			selectedBody = fixture.GetBody();
			return false;
		}
	}
	return true;
}