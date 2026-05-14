// function SceneHistory(sceneManager){
	// this.sceneManager = sceneManager;
	// this.history = [];
	// this.currentState = 0;
	// this.historyLimit = 10;
// }

// SceneHistory.prototype.addHistory = function(){
	// if(this.history.length > this.historyLimit){
		// this.history = this.history.slice(this.historyLimit, this.history.length - 1);
	// }
	// if(this.currentState < this.history.length){
		// this.history = this.history.slice(0, this.currentState);
	// }
	// var scene = this.sceneManager.saveScene();
	// this.history.push(clone_obj(scene));
	// this.currentState = this.history.length;
// }

// SceneHistory.prototype.getHistoryArray = function(){
	// return this.history
// }

// SceneHistory.prototype.undo = function(){
	// if(this.history.length > 0){
		// if(this.currentState > 0){
			// var state = this.currentState - 1;
			// var history = this.history[state];
			// this.sceneManager.bodies = history.bodies;
			// this.sceneManager.joints = history.joints;
			// this.sceneManager.particles = history.particles;
			// this.currentState = state;		    
		// }
	// }
// }

// SceneHistory.prototype.redo = function(){
	// if(this.history.length > this.currentState){
		// this.currentState += 1;
		// if(this.currentState < this.history.length){
			// var state = this.currentState;
			// var history = this.history[state];
			// this.sceneManager.bodies = history.bodies;
			// this.sceneManager.joints = history.joints;
			// this.sceneManager.particles = history.particles;
			// this.currentState = state;
		// }
	// }
// }

// SceneHistory.prototype.clear = function(){
	// this.history = [];
	// this.currentState = 0;
// }