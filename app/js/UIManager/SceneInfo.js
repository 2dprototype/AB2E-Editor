function SceneInfo(sceneManager){
    this.sceneManager = sceneManager;
	this.element = document.getElementById('scene-info');
	this.isHidden = true;
	this.childs = [];
	this.childs = this.element.querySelectorAll('.push_able');
	this.buttons = [];
	this.buttons = this.element.querySelectorAll('.push_button');
	var ref = this;
	this.buttons[0].onclick = function(){
	    ref.hide();
	}
	this.buttons[1].onclick = function(){
	    ref.set();
	    ref.hide();
	}
}

SceneInfo.prototype.show = function(){
    this.element.style.display = 'block';
    this.isHidden = false;
}

SceneInfo.prototype.hide = function(){
    this.element.style.display = 'none';
    this.isHidden = true;
}

SceneInfo.prototype.update = function(){
	var sceneManager = this.sceneManager;
	
	this.childs[0].value = sceneManager.info.name;
	this.childs[1].value = sceneManager.info.author;
	this.childs[2].value = sceneManager.info.comment;
	this.childs[3].innerText = getTimeDiffAndPrettyText(sceneManager.info.dateCreated).friendlyNiceText;
	this.childs[4].innerText = getTimeDiffAndPrettyText(sceneManager.info.lastModified).friendlyNiceText;
	this.childs[5].innerText = Editor.currentFile.path;
}

SceneInfo.prototype.set = function(){
	var sceneManager = this.sceneManager;
	
	sceneManager.info.name = this.childs[0].value;
	sceneManager.info.author = this.childs[1].value;
	sceneManager.info.comment = this.childs[2].value;
}

SceneInfo.prototype.clear = function(){
	var sceneManager = this.sceneManager;
	
	this.childs[0].value = "";
	this.childs[1].value = "";
	this.childs[2].value = '';
	this.childs[3].innerText = '';
	this.childs[4].innerText = '';
	this.childs[5].innerText = '';
}