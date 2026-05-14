function SceneHistory(sceneManager){
	this.sceneManager = sceneManager;
	this.history = [];
	this.currentState = -1;
	this.historyLimit = 50;
	this.isRestoring = false;
}

SceneHistory.prototype.addHistory = function(){
	// If we are not at the end of the history (we undid some things), 
	// remove everything after the current state
	if(this.currentState < this.history.length - 1){
		this.history = this.history.slice(0, this.currentState + 1);
	}
	
	var scene = this.sceneManager.saveScene();
	this.history.push(clone_obj(scene));
	
	if(this.history.length > this.historyLimit){
		this.history.shift();
	}
	
	this.currentState = this.history.length - 1;
}

SceneHistory.prototype.undo = function(){
	if(this.currentState > 0){
		this.currentState--;
		var history = this.history[this.currentState];
		this.restoreState(history);
	}
}

SceneHistory.prototype.redo = function(){
	if(this.currentState < this.history.length - 1){
		this.currentState++;
		var history = this.history[this.currentState];
		this.restoreState(history);
	}
}

SceneHistory.prototype.restoreState = function(state){
	this.isRestoring = true;
	// Clear current scene
	this.sceneManager.bodies = [];
	this.sceneManager.joints = [];
	this.sceneManager.particles = [];
	this.sceneManager.world = new World();
	this.sceneManager.scripts = [];
	
	// Load scene from state
	this.sceneManager.loadScene(clone_obj(state));
	
	// Clear selection as objects are new instances
	this.sceneManager.clearSelection();
	this.isRestoring = false;
}

SceneHistory.prototype.clear = function(){
	this.history = [];
	this.currentState = -1;
}