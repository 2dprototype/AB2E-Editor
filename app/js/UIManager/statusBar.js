function statusBar(sceneManager, viewport){
	this.isHidden = false;
    this.element = document.getElementById('statusBar');
	this.sceneManager = sceneManager;
	this.viewport = viewport;
}

statusBar.prototype.hide = function(){
	this.element.style.display = 'none';
	this.isHidden = true;
}

statusBar.prototype.show = function(){
	this.element.style.display = 'flex';
	this.isHidden = false;
}

statusBar.prototype.update = function(){
	if(!this.isHidden){
		var sceneManager = this.sceneManager;
		var viewport = this.viewport;
		var wx = parseInt(viewport.inputHandler.pointerWorldPos[2]);
		var wy = parseInt(viewport.inputHandler.pointerWorldPos[3]);
		var states = {};
		states[-1] = 'NONE' 	
		states[0] = 'DEFAULT' 	
		states[1] = 'SHAPE_EDIT'       
		states[2] = 'BODY_EDIT'	   
		states[3] = 'IMAGE_VERTEX_EDIT' 
		states[4] = 'PARTICLE_EDIT'    
		states[5] = 'IMAGE_EDIT'      
		states[6] = 'JOINT_EDIT'			
		var _state = states[sceneManager.state];
		
		var pivotModes = {};
		pivotModes[3] = 'LOCAL';
		pivotModes[4] = 'SELECTION';
		var _pivotMode  = pivotModes[viewport.inputHandler.pivotMode];
		var mouse_world = `<span>MOUSE : [X : ${wx}, Y : ${wy}]</span>`;
		var state = `STATE : ${_state}`;
		var pivotMode = `PIVOT : ${_pivotMode}`;
		var right = `<span>${pivotMode}, ${state}</span>`;
		this.element.innerHTML = mouse_world + right;	    
	}

}