function propertiesMenu(sceneManager, viewport, UIManager){
	this.sceneManager = sceneManager;
	this.viewport = viewport;
	this.UIManager = UIManager;
    this.element = document.getElementById('section_property');
	this.isHidden = false;
	
	this.FOCUS_NONE = -1;
	this.FOCUS_SELECTION = 0;
	this.FOCUS_COLLISION_FILTER = 1;
	this.FOCUS_WORLD = 2;
	this.FOCUS_SCENE_COLLECTION = 3;
	this.FOCUS_SETTINGS = 4;
	this.focus = this.FOCUS_SELECTION;
	
	this.spriteProperties     = [];
	this.gameviewProperties   = [];
	this.bodyProperties       = [];
	this.fixtureProperties    = [];
	this.jointProperties      = [];
	this.renderProperties     = [];
	this.particleProperties   = [];
	this.particleFlagsList    = [];
	this.settingsProperties   = [];
	this.jointPropertyRows    = [];
	this.particlePropertyRows = [];
}

propertiesMenu.prototype.resizeLayout = function(){
	
	var section_property = this.element;
	
	//section_property -> object_property
	var _body = section_property.getElementsByClassName('body')[0];
	var _head = section_property.getElementsByClassName('head')[0];
	
	_body.style.height = section_property.offsetHeight - _head.offsetHeight;
}

propertiesMenu.prototype.init = function(){
	var sceneManager = this.sceneManager;
	var UIManager = this.UIManager;
	var ref = this;
	
	
	//collisiton filters
	
	
	
	
	
	//section_property --> body
	
	{	
		//properties of selected objects[body]
		var inputs = document.getElementById('body-properties').querySelectorAll("input");
		
		for(i = 0; i < inputs.length; i++){
			this.bodyProperties.push(inputs[i])
		}
		
		this.bodyProperties.push(document.getElementById('body-properties').querySelectorAll("select")[0]);
		
		
		
		
		//getInfo
		this.bodyProperties[18].onclick = function(){
			if(sceneManager.selectedBodies.length == 1){
				var str = JSON5.stringify(sceneManager.selectedBodies[0].get_properties(), null, 4);
				var h =  hljs.highlight(str, {language: 'json'});
				Editor.terminal.println(`<code><pre>${h.value}</pre></code>`);
				Editor.terminal.show();
			}
		}
		//bodyType
		this.bodyProperties[19].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].bodyType = this.value;
			}
		}
		//name
		this.bodyProperties[1].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].name = this.value;
			}
		}
		//userData
		this.bodyProperties[2].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].userData = eval(this.value);
			}
		}
		//position[0]
		this.bodyProperties[3].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				var pos = sceneManager.selectedBodies[i].position;
				sceneManager.selectedBodies[i].setPosition(parseFloat(this.value), pos[1]);
			}
		}
		//position[1]
		this.bodyProperties[4].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				var pos = sceneManager.selectedBodies[i].position;
				sceneManager.selectedBodies[i].setPosition(pos[0], parseFloat(this.value));
			}
		}	
		//rotation
		this.bodyProperties[5].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].setRotation(parseFloat(this.value));
			}
		}	
		//scale_x
		this.bodyProperties[6].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				var s = sceneManager.selectedBodies[i].scaleXY;
				sceneManager.selectedBodies[i].setScale(parseFloat(this.value), s[1]);
			}
		}	
		//scale_y
		this.bodyProperties[7].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				var s = sceneManager.selectedBodies[i].scaleXY;
				sceneManager.selectedBodies[i].setScale(s[0], parseFloat(this.value));
			}
		}	
		//linearVelocity[0]
		this.bodyProperties[8].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].linearVelocity[0] = parseFloat(this.value);
			}
		}
		//linearVelocity[1]
		this.bodyProperties[9].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].linearVelocity[1] = parseFloat(this.value);
			}
		}
		//angularVelocity
		this.bodyProperties[10].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].angularVelocity = parseFloat(this.value);
			}
		}
		//linearDamping
		this.bodyProperties[11].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].linearDamping = parseFloat(this.value);
			}
		}
		//angularDamping
		this.bodyProperties[12].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].angularDamping = parseFloat(this.value);
			}
		}
		//isBullet
		this.bodyProperties[13].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].isBullet = this.checked;
			}
		}
		//isFixedRotation
		this.bodyProperties[14].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].isFixedRotation = this.checked;
			}
		}
		//isActive
		this.bodyProperties[15].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].isActive = this.checked;
			}
		}
		//isAwake
		this.bodyProperties[16].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].isAwake = this.checked;
			}
		}
		//gravityScale
		this.bodyProperties[17].onchange = function(){
			for(i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].gravityScale =  parseFloat(this.value);
			}
		}
		//bodyEditMode
		this.bodyProperties[0].onclick = function(){
			if(sceneManager.selectedBodies.length > 0){
				sceneManager.enterBodyEditMode();
				ref.updateSelectionProperty();
				ref.UIManager.statusBar.update();
			}
		}
	}
	
	//section_property --> fixtures
	
	{
		var inputs = document.getElementById('fixture-properties').querySelectorAll("input");
		for(i = 0; i < inputs.length; i++){
			this.fixtureProperties.push(inputs[i]);
		}
		this.fixtureProperties.push(document.getElementById('fixture-properties').querySelectorAll("span")[0]);
		
		//done
		this.fixtureProperties[0].onclick = function(){
			if(sceneManager.state != sceneManager.STATE_SHAPE_EDIT_MODE){
				sceneManager.enterDefaultMode();
				ref.updateSelectionProperty();		    
			}
			else{
				ref.UIManager.alert(`First you have to close "SHAPE_EDIT_MODE".`)
			}
		}
		//vertex edit
		this.fixtureProperties[1].onclick = function(){
			if(sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE) sceneManager.enterShapeEditMode();
			else if(sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE) sceneManager.enterBodyEditMode();
			if(sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE) this.value = 'Done';
			else this.value = 'Edit';
			ref.updateSelectionProperty();
		}
		//userData
		this.fixtureProperties[2].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].userData = eval(this.value);
			}
		}
		//position_x
		this.fixtureProperties[3].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				var pos = sceneManager.selectedShapes[i].position;
				sceneManager.selectedShapes[i].setPosition(parseFloat(this.value), pos[1]);
			}
		}	
		//position_y
		this.fixtureProperties[4].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				var pos = sceneManager.selectedShapes[i].position;
				sceneManager.selectedShapes[i].setPosition(pos[0], parseFloat(this.value));
			}
		}	
		//rotation
		this.fixtureProperties[5].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].setRotation(parseFloat(this.value));
			}
		}
		//scale_x
		this.fixtureProperties[6].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				var s = sceneManager.selectedShapes[i].scaleXY;
				sceneManager.selectedShapes[i].setScale(s[0], parseFloat(this.value));
			}
		}	
		//scale_y
		this.fixtureProperties[7].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				var s = sceneManager.selectedShapes[i].scaleXY;
				sceneManager.selectedShapes[i].setScale(parseFloat(this.value), s[1]);
			}
		}	
		//density
		this.fixtureProperties[8].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].density = parseFloat(this.value);
			}
		}	
		//friction
		this.fixtureProperties[9].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].friction = parseFloat(this.value);
			}
		}	
		//restitution
		this.fixtureProperties[10].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].restitution = parseFloat(this.value);
			}
		}
		//maskBits
		this.fixtureProperties[11].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].maskBits = parseFloat(this.value);
			}
		}
		//categoryBits
		this.fixtureProperties[12].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].categoryBits = parseFloat(this.value);
			}
		}
		//groupIndex
		this.fixtureProperties[13].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].groupIndex = parseFloat(this.value);
			}
		}
		//isSensor
		this.fixtureProperties[14].onchange = function(){
			for(i = 0; i < sceneManager.selectedShapes.length; i++){
				sceneManager.selectedShapes[i].isSensor = this.checked;
			}
		}
	}
	
	//section_property --> joints
	
	{
		var inputs = document.getElementById('joint-properties').querySelectorAll("input");
		for(i = 0;i < inputs.length; i++){
			this.jointProperties.push(inputs[i])
		}
		this.jointProperties.push(document.getElementById('joint-properties').querySelectorAll("span")[0])
		
		this.jointPropertyRows = document.getElementById('joint-properties').querySelectorAll("tr");
		
		//edit joint
		this.jointProperties[0].onclick = function(){
			if(sceneManager.selectedJoints.length == 1){
				if (sceneManager.state == sceneManager.STATE_DEFAULT_MODE) sceneManager.enterJointEditMode();
				else if(sceneManager.state == sceneManager.STATE_JOINT_EDIT_MODE) sceneManager.enterDefaultMode();
				if(sceneManager.state == sceneManager.STATE_JOINT_EDIT_MODE) this.value = 'Done';
				else this.value = 'Edit';
				ref.updateSelectionProperty();
			}
		}
		//name
		this.jointProperties[1].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].name = this.value;
			}
			ref.updateJointProperties();
		}	
		//userData
		this.jointProperties[2].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].userData = eval(this.value);
			}
			ref.updateJointProperties();
		}
		//collideConnected
		this.jointProperties[3].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].collideConnected = this.checked;
			}
			ref.updateJointProperties();
		}
		//frequencyHZ
		this.jointProperties[4].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].frequencyHZ = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}	
		//dampingRatio
		this.jointProperties[5].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].dampingRatio = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//localAnchorA[0]
		this.jointProperties[6].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].localAnchorA[0] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//localAnchorA[1]
		this.jointProperties[7].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].localAnchorA[1] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//localAnchorB[0]
		this.jointProperties[8].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].localAnchorB[0] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//localAnchorB[1]
		this.jointProperties[9].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].localAnchorB[1] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//referenceAngle
		this.jointProperties[10].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].referenceAngle = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//lowerAngle
		this.jointProperties[11].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].lowerAngle = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//upperAngle
		this.jointProperties[12].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].upperAngle = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//enableLimit
		this.jointProperties[13].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].enableLimit = this.checked;
			}
			ref.updateJointProperties();
		}	
		//enableMotor
		this.jointProperties[14].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].enableMotor = this.checked;
			}
			ref.updateJointProperties();
		}
		//motorSpeed
		this.jointProperties[15].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].motorSpeed = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}	
		//maxMotorTorque
		this.jointProperties[16].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].maxMotorTorque = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//lowerTranslation
		this.jointProperties[17].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].lowerTranslation = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//upperTranslation
		this.jointProperties[18].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].upperTranslation = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}		
		//ratio
		this.jointProperties[19].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].frequencyHZ = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//groundAnchorA[0]
		this.jointProperties[20].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].groundAnchorA[0] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//groundAnchorA[1]
		this.jointProperties[21].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].groundAnchorA[1] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//groundAnchorB[0]
		this.jointProperties[22].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].groundAnchorB[0] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//groundAnchorB[1]
		this.jointProperties[23].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].groundAnchorB[1] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//maxLength
		this.jointProperties[24].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].frequencyHZ = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//maxForce
		this.jointProperties[25].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].maxForce = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//maxTorque
		this.jointProperties[26].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].maxTorque = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//angularOffset
		this.jointProperties[27].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].angularOffset = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}	
		//linearOffset[0]
		this.jointProperties[28].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].linearOffset[0] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//linearOffset[1]
		this.jointProperties[29].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].linearOffset[1] = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
		//correctionFactor
		this.jointProperties[29].onchange = function(){
			for(i = 0; i < sceneManager.selectedJoints.length; i++){
				sceneManager.selectedJoints[i].correctionFactor = parseFloat(this.value);
			}
			ref.updateJointProperties();
		}
	}
	
	{
		//properties of selected objects[sprites]
		var inputs = document.getElementById('sprite-properties').querySelectorAll("input");
		
		for(i = 0; i < inputs.length; i++){
			this.spriteProperties.push(inputs[i])
		}
		this.spriteProperties.push(document.getElementById('sprite-properties').querySelectorAll("select")[0])
		this.spriteProperties.push(document.getElementById('sprite-properties').querySelectorAll("span")[0])
		//choose img
		//correctionFactor
		this.spriteProperties[0].onclick = function(){
			if(fs.existsSync(Editor.currentFile.dir)){
				var options = {
					filters : [
						{ name: "Images", extensions: ["jpg", "jpeg", "png", "svg", "bmp", "gif"] }
					],
					title : 'Choosing Sprites',
					properties: ['openFile', 'multiSelections']
				}
				var file = ref.UIManager.openFile(options);
				for(i = 0; i < file.filePaths.length; i++){
					var imgpath = file.filePaths[i];
					var imgname = path.basename(imgpath);
					var dir = Editor.currentFile.dir + '\\';
					var copyfile = imgname;
					var clonefile = path.parse(imgname).name + '_' + randomString(5) + path.parse(imgname).ext;
					var src = '';
					if(path.dirname(imgpath) == Editor.currentFile.dir){
						src = imgname;
					}
					else if(fs.existsSync(dir + copyfile)){
						fs.copyFileSync(imgpath, dir + clonefile);
						src = clonefile;
					}
					else{
						fs.copyFileSync(imgpath, dir + copyfile);
						src = copyfile;
					}
					for(j = 0; j < sceneManager.selectedBodies.length; j++){
						sceneManager.selectedBodies[j].setSprite(src, dir + src);
						sceneManager.selectedBodies[j].selectedSprite = 0;
					}
				}
			}
			else{
				ref.UIManager.alert('First save scene in a valid path')
			}
			ref.updateSelectionProperty();
		}
		//list of images
		this.spriteProperties[13].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				sceneManager.selectedBodies[i].selectedSprite = parseInt(this.value);
			}
			ref.updateSelectionProperty();
		}
		//width
		this.spriteProperties[1].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var height =sceneManager.selectedBodies[i].sprites[k].height;
					sceneManager.selectedBodies[i].sprites[k].setScale(parseFloat(this.value), height);
				}
			}
		}
		//height
		this.spriteProperties[2].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var width =sceneManager.selectedBodies[i].sprites[k].width;
					sceneManager.selectedBodies[i].sprites[k].setScale(width, parseFloat(this.value));
				}
			}
		}
		//x
		this.spriteProperties[3].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var y = sceneManager.selectedBodies[i].sprites[k].y;
					sceneManager.selectedBodies[i].sprites[k].setPosition(parseFloat(this.value), y);
				}
			}
		}
		//y
		this.spriteProperties[4].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var x = sceneManager.selectedBodies[i].sprites[k].x;
					sceneManager.selectedBodies[i].sprites[k].setPosition(x, parseFloat(this.value));
				}
			}
		}
		//rotation
		this.spriteProperties[5].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var body = sceneManager.selectedBodies[i];
					var k = body.selectedSprite;
					body.sprites[k].setRotation(parseFloat(this.value), body);
				}
			}
		}
		//opacity
		this.spriteProperties[6].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					sceneManager.selectedBodies[i].sprites[k].opacity = parseFloat(this.value);
				}
			}
		}		
		//flip[0]
		this.spriteProperties[7].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var sprite = sceneManager.selectedBodies[i].sprites[k];
					if(this.checked) sprite.flipX(-1);
					else sprite.flipX(1);
				}
			}
		}	
		//flip[1]
		this.spriteProperties[8].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					var sprite = sceneManager.selectedBodies[i].sprites[k];
					if(this.checked) sprite.flipY(-1);
					else sprite.flipY(1);
				}
			}
		}
		//zIndex
		this.spriteProperties[9].onchange = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				if(sceneManager.selectedBodies[i].sprites.length > 0){
					var k = sceneManager.selectedBodies[i].selectedSprite;
					sceneManager.selectedBodies[i].sprites[k].zIndex = parseInt(this.value);
				}
			}
		}
		
		//edit
		this.spriteProperties[10].onclick = function(){
			if(sceneManager.selectedBodies.length == 1){
				var body = sceneManager.selectedBodies[0];
				if(body.sprites.length > 0){
					var sprite = body.sprites[body.selectedSprite];
					if(sceneManager.state == sceneManager.STATE_DEFAULT_MODE) sceneManager.enterImageVertexEditMode();
					else if(sceneManager.state == sceneManager.STATE_IMAGE_VERTEX_EDIT_MODE){
						sceneManager.enterDefaultMode();
						sprite.inEditMode = false;
					}
					if(sceneManager.state == sceneManager.STATE_IMAGE_VERTEX_EDIT_MODE) this.value = 'Done';
					else this.value = 'Edit';
				}
			}
			ref.updateSelectionProperty();
		}
		
		//clear
		this.spriteProperties[12].onclick = function(){
			for (var i = 0; i < sceneManager.selectedBodies.length; i++){
				var sprite = sceneManager.selectedBodies[i].sprites;
				var index = sceneManager.selectedBodies[i].selectedSprite;
				if (index > -1) sprite.splice(index, 1);
				sceneManager.selectedBodies[i].selectedSprite = sceneManager.selectedBodies[i].sprites.length - 1;
			}
			ref.updateSelectionProperty();
		}
		// edit image
		this.spriteProperties[11].onclick = function(){
			if(sceneManager.selectedBodies.length == 1){
				var body = sceneManager.selectedBodies[0];
				if(body.sprites.length > 0){
					var sprite = body.sprites[body.selectedSprite];
					if(sceneManager.state == sceneManager.STATE_DEFAULT_MODE) sceneManager.enterImageEditMode();
					else if(sceneManager.state == sceneManager.STATE_IMAGE_EDIT_MODE) sceneManager.enterDefaultMode();
					if(sceneManager.state == sceneManager.STATE_IMAGE_EDIT_MODE) this.value = 'Done';
					else this.value = 'Edit';
				}
			}
			ref.updateSelectionProperty();
		}
		
		
		
		
	}
	
	{
		//properties of selected objects[sprites]
		var inputs = document.getElementById('particle-properties').querySelectorAll("input");
		
		for(i = 0; i < inputs.length; i++){
			this.particleProperties.push(inputs[i]);
		}
		this.particleProperties.push(document.getElementById('particle-properties').querySelectorAll("span")[0]);
		this.particleProperties.push(document.getElementById('particle-properties').querySelectorAll("span")[1]);
		
		this.particlePropertyRows = document.getElementById('particle-properties').querySelectorAll("tr");
		
		this.particleProperties[5].onclick = function(){
			if(sceneManager.selectedParticles.length == 1){
				var p = sceneManager.selectedParticles[0].shape;
				if(p.type == 2){
					if(sceneManager.state == sceneManager.STATE_DEFAULT_MODE){
						sceneManager.enterParticleEditMode();
						p.inEditMode = true;
					}
					else if(sceneManager.state == sceneManager.STATE_PARTICLE_EDIT_MODE){
						sceneManager.enterDefaultMode();
						p.inEditMode = false;
					}
					if(sceneManager.state == sceneManager.STATE_PARTICLE_EDIT_MODE) this.value = 'Done';
					else this.value = 'Edit';
				}
			}
			ref.updateSelectionProperty();
		}
		//name
		this.particleProperties[0].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].name = this.value;
			}
		}
		//userData
		this.particleProperties[1].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].userData = eval(this.value);
			}
		}
		//position[0]
		this.particleProperties[2].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var ps = sceneManager.selectedParticles[i].position;
				sceneManager.selectedParticles[i].setPosition(parseFloat(this.value), ps[1]);
			}
		}
		//position[1]
		this.particleProperties[3].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var ps = sceneManager.selectedParticles[i].position;
				sceneManager.selectedParticles[i].setPosition(ps[0], parseFloat(this.value));
			}
		}	
		//rotation
		this.particleProperties[4].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].setRotation(parseFloat(this.value));
			}
		}
		//radius > circle shape
		this.particleProperties[6].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var p =  sceneManager.selectedParticles[i];
				if(p.shape.type == 0) p.shape.radius = parseFloat(this.value);
			}
		}	
		//width > box shape
		this.particleProperties[7].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var p =  sceneManager.selectedParticles[i];
				if(p.shape.type == 1) p.shape.width = parseFloat(this.value);
			}
		}
		//height > box shape
		this.particleProperties[8].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var p =  sceneManager.selectedParticles[i];
				if(p.shape.type == 1) p.shape.height = parseFloat(this.value);
			}
		}	
		//strength
		this.particleProperties[13].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].strength = parseFloat(this.value);
			}
		}
		//lifetime
		this.particleProperties[14].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].lifetime = parseFloat(this.value);
			}
		}
		//stride
		this.particleProperties[15].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].stride = parseFloat(this.value);
			}
		}
		//particle radius
		this.particleProperties[16].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].radius = parseFloat(this.value);
			}
		}
		//angularVelocity
		this.particleProperties[17].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].angularVelocity = parseFloat(this.value);
			}
		}	
		//linearVelocity[0]
		this.particleProperties[18].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].linearVelocity[0] = parseFloat(this.value);
			}
		}
		//linearVelocity[1]
		this.particleProperties[19].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].linearVelocity[1] = parseFloat(this.value);
			}
		}
		//color r
		this.particleProperties[9].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].color[0] = parseInt(this.value);
			}
		}
		//color g
		this.particleProperties[10].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].color[1] = parseInt(this.value);
			}
		}
		//color b
		this.particleProperties[11].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].color[2] = parseInt(this.value);
			}
		}
		//color a
		this.particleProperties[12].onchange = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				sceneManager.selectedParticles[i].color[3] = parseFloat(this.value);
			}
		}
	}
	
	{
		//list of particle flags
		var inputs = document.getElementById('particle-flags-list').querySelectorAll("input");
		
		for(i = 0; i < inputs.length; i++){
			this.particleFlagsList.push(inputs[i]);
		}
		
		//setFlags
		this.particleFlagsList[this.particleFlagsList.length - 1].onclick = function(){
			for (var i = 0; i < sceneManager.selectedParticles.length; i++){
				var flags = [];
				for(var f = 0; f < ref.particleFlagsList.length - 1; f++){
					if(ref.particleFlagsList[f].checked){
						flags.push(parseInt(ref.particleFlagsList[f].value));
					}
					else{
						flags.push(null);
					}
				}
				sceneManager.selectedParticles[i].flags = flags;
			}
			ref.updateParticleProperties();
		}
		
	}
	
	{
		//properties of selected objects[sprites]
		var inputs = document.getElementById('settings-properties').querySelectorAll("input");
		for(i = 0; i < inputs.length; i++){
			this.settingsProperties.push(inputs[i]);
		}
		
		
		console.log(this.settingsProperties)
		
		//grid
		this.settingsProperties[0].onchange = function(){
			ref.viewport.renderer.showGrid = this.checked;
			ref.updateSettingsProperties();
		}
		//grid color
		this.settingsProperties[1].onchange = function(){
			ref.viewport.renderer.gridColor = this.value;
			ref.updateSettingsProperties();
		}
		//background color
		this.settingsProperties[2].onchange = function(){
			ref.viewport.renderer.backgroundColor = this.value;
			ref.updateSettingsProperties();
		}
		// cell_size
		this.settingsProperties[3].onchange = function(){
			if(parseFloat(this.value) != 0) ref.viewport.navigator.cell_size = Math.abs(parseFloat(this.value));
			ref.updateSettingsProperties();
		}		
		//range
		this.settingsProperties[4].onchange = function(){
			ref.viewport.navigator.range = Math.abs(parseFloat(this.value));
			ref.updateSettingsProperties();
		}
		//darw center
		this.settingsProperties[5].onchange = function(){
			ref.viewport.renderer.bodyCenter = this.checked;
			ref.updateSettingsProperties();
		}	
		//darw DEBUG
		this.settingsProperties[6].onchange = function(){
			ref.viewport.renderer.DEBUG = this.checked;
			ref.updateSettingsProperties();
		}
		
	}
	{
		//properties of selected objects[sprites]
		var inputs = document.getElementById('world-properties').querySelectorAll("input");
		var span = document.getElementById('world-properties').querySelectorAll("span");
		
		for(i = 0; i < inputs.length; i++){
			this.gameviewProperties.push(inputs[i]);
		}
		for(i = 0; i < span.length; i++){
			this.gameviewProperties.push(span[i]);
		}
		
		//gravity[0]
		this.gameviewProperties[0].onchange = function(){
			sceneManager.world.gravity[0] = parseFloat(this.value);
		}
		//gravity[1]
		this.gameviewProperties[1].onchange = function(){
			sceneManager.world.gravity[1] = parseFloat(this.value);
		}
		//allowSleep
		this.gameviewProperties[2].onchange = function(){
			sceneManager.world.allowSleep = this.checked;
		}
		//debugDraw
		this.gameviewProperties[3].onchange = function(){
			sceneManager.world.debugDraw = this.checked;
		}	
		//drawScale
		this.gameviewProperties[4].onchange = function(){
			sceneManager.world.drawScale = parseFloat(this.value);
		}
		//drawSprites
		this.gameviewProperties[5].onchange = function(){
			sceneManager.world.drawSprites = this.checked;
		}
		//runtime script
		this.gameviewProperties[6].onclick = function(){
			if (this.getAttribute("isDone") == "false") {
				if(ref.sceneManager.scripts.length > 0) {
					ref.UIManager.codeEditor.setValue(ref.sceneManager.scripts[0].raw)
				}
				ref.UIManager.codeEditorBG.style.display = "block"
				this.setAttribute("isDone", "true")
				this.value = "Done"
			}
			else {
				// ref.sceneManager.scripts[0] = new Script(ref.UIManager.codeEditor.getValue())
				ref.sceneManager.setScript(ref.UIManager.codeEditor.getValue())
				ref.UIManager.codeEditorBG.style.display = "none"
				this.setAttribute("isDone", "false")
				this.value = "Edit"
			}
			ref.UIManager.codeEditor.refresh()
		}
		
		// ref.UIManager.codeEditor.setValue(atob('KGZ1bmN0aW9uKHNjZW5lLCByZWYpew0KCQ0KCXRoaXMuZHJhdyA9IGZ1bmN0aW9uKGN0eCl7DQoJCQ0KCX0NCgkNCgl0aGlzLm1vdXNlbW92ZSA9IGZ1bmN0aW9uKHgsIHksIGUpIHsNCgkJDQoJfQ0KCQ0KCXRoaXMubW91c2Vkb3duID0gZnVuY3Rpb24oeCwgeSwgZSkgew0KCQkNCgl9DQoJDQoJdGhpcy5tb3VzZWxlYXZlID0gZnVuY3Rpb24oeCwgeSwgZSkgew0KCQkNCgl9DQp9KQ'))
		// ref.UIManager.codeEditor.refresh()
		// ref.UIManager.codeEditorBG.style.display = 'none'
		// ref.UIManager.codeEditor.addEventListener('keydown', function (event) {
			// if (event.key === 'Tab') {
				// event.preventDefault(); // Prevent the default behavior of the Tab key
				
				// // Insert a tab character at the current cursor position
				// var start = this.selectionStart;
				// var end = this.selectionEnd;
				// var value = this.value;
				
				// // Insert a tab character at the cursor position
				// this.value = value.substring(0, start) + '\t' + value.substring(end);
				
				// // Move the cursor position after the inserted tab
				// this.selectionStart = this.selectionEnd = start + 1;
			// }
		// });
		
	}
	
	
	
}

propertiesMenu.prototype.hide = function(){
	this.element.style.display = 'none';
	this.isHidden = true;
}

propertiesMenu.prototype.show = function(){
	this.element.style.display = 'block';
	this.isHidden = false;
}




propertiesMenu.prototype.updateCollisionFilter = function(){
	if(this.focus == this.FOCUS_COLLISION_FILTER){
		var ref = this;
		var elm = document.getElementById('collision-filter');
		elm.innerHTML = ''
		var tbl = document.createElement('table');
		
		var tr = tbl.insertRow();
		tr.insertCell().appendChild(document.createTextNode('Name'));
		tr.insertCell().appendChild(document.createTextNode('groupIndex'));
		tr.insertCell().appendChild(document.createTextNode('categoryBits'));
		tr.insertCell().appendChild(document.createTextNode('maskBits'));
		
		for(i = 0; i < this.sceneManager.bodies.length; i++){
			var body = this.sceneManager.bodies[i];
			for(j = 0; j < body.shapes.length; j++){
				var shape = body.shapes[j];
				var tr = tbl.insertRow();
				if(shape.isSelected) tr.style.backgroundColor = '#3f51b550';
				else if(body.isSelected) tr.style.backgroundColor = '#3f51b525';
				{
					var td = tr.insertCell();
					var span = document.createElement('span');
					span.innerText = `${shape.name}`;
					td.appendChild(span);				
				}
				{
					var td = tr.insertCell();
					var input = document.createElement('input');
					input.type = 'text';
					input.setAttribute('size', '2');
					input.setAttribute('i', i);
					input.setAttribute('j', j);
					input.value = shape.groupIndex;
					input.onchange = function(){
						var i = this.getAttribute('i'), j = this.getAttribute('j');
						var _shape = ref.sceneManager.bodies[i].shapes[j];
						_shape.groupIndex = parseInt(this.value);
					}
					td.appendChild(input);
				}
				{
					var td = tr.insertCell();
					var input = document.createElement('input');
					input.type = 'text';
					input.setAttribute('size', '2');
					input.setAttribute('i', i);
					input.setAttribute('j', j);
					input.value = shape.categoryBits;
					input.onchange = function(){
						var i = this.getAttribute('i'), j = this.getAttribute('j');
						var _shape = ref.sceneManager.bodies[i].shapes[j];
						_shape.categoryBits = parseInt(this.value);
					}
					td.appendChild(input);			
					}			{
					var td = tr.insertCell();
					var input = document.createElement('input');
					input.type = 'text';
					input.setAttribute('size', '2');
					input.setAttribute('i', i);
					input.setAttribute('j', j);
					input.value = shape.maskBits;
					input.onchange = function(){
						var i = this.getAttribute('i'), j = this.getAttribute('j');
						var _shape = ref.sceneManager.bodies[i].shapes[j];
						_shape.maskBits = parseInt(this.value);
					}
					td.appendChild(input);			
				}
				
			}
		}
		elm.appendChild(tbl);
	}
}


propertiesMenu.prototype.updateSelectionProperty = function(){
	if(this.focus == this.FOCUS_SELECTION){
		this.updateBodyProperties();
		this.updateJointProperties();
		this.updateFixtureProperties();
		this.updateSpriteProperties();
		this.updateParticleProperties();
		{
			var btns =  document.getElementById('object-property-head').querySelectorAll("div");
			var b_l = this.sceneManager.selectedBodies.length;
			var j_l = this.sceneManager.selectedJoints.length;
			var p_l = this.sceneManager.selectedParticles.length;
			if(b_l > 0) btns[1].style.color = '#ffffff';
			else btns[1].style.color = '#ffffff80';
			if(j_l > 0) btns[2].style.color = '#ffffff';
			else btns[2].style.color = '#ffffff80';
			if(p_l > 0) btns[3].style.color = '#ffffff';
			else btns[3].style.color = '#ffffff80';
			
		}
	}
}

propertiesMenu.prototype.updateSettingsProperties = function(){
	this.settingsProperties[0].checked = this.viewport.renderer.showGrid;
	this.settingsProperties[1].value = this.viewport.renderer.gridColor;
	this.settingsProperties[2].value = this.viewport.renderer.backgroundColor;
	this.settingsProperties[3].value = this.viewport.navigator.cell_size;
	this.settingsProperties[4].value = this.viewport.navigator.range;
	this.settingsProperties[5].checked = this.viewport.renderer.bodyCenter;
	this.settingsProperties[6].checked = this.viewport.renderer.DEBUG;
}

propertiesMenu.prototype.updategameviewProperties = function(){
	if(this.focus == this.FOCUS_WORLD){
		var sceneManager = this.sceneManager;
		var world = sceneManager.world;
		this.gameviewProperties[0].value = world.gravity[0];
		this.gameviewProperties[1].value = world.gravity[1];
		this.gameviewProperties[2].checked = world.allowSleep;
		this.gameviewProperties[3].checked = world.debugDraw;
		this.gameviewProperties[4].value = world.drawScale;
		this.gameviewProperties[5].checked = world.drawSprites;
		
		this.gameviewProperties[7].innerText = sceneManager.bodies.length;
		this.gameviewProperties[8].innerText = sceneManager.joints.length;
		this.gameviewProperties[9].innerText = sceneManager.particles.length;	    
	}
	
}

propertiesMenu.prototype.updateParticleProperties = function(){
	var sceneManager = this.sceneManager;
	if(sceneManager.selectedParticles.length > 0){
		var cachedP = sceneManager.selectedParticles[0];
		document.getElementById('particle-properties').style.display = 'block';
		this.particleProperties[0].value = cachedP.name;
		this.particleProperties[1].value = cachedP.userData;
		this.particleProperties[2].value = cachedP.position[0].toFixed(2);
		this.particleProperties[3].value = cachedP.position[1].toFixed(2);
		this.particleProperties[4].value = cachedP.rotation.toFixed(2) + "°";
		this.particleProperties[9].value = cachedP.color[0];
		this.particleProperties[10].value = cachedP.color[1];
		this.particleProperties[11].value = cachedP.color[2];
		this.particleProperties[12].value = cachedP.color[3];
		this.particleProperties[13].value = cachedP.strength;
		this.particleProperties[14].value = cachedP.lifetime;
		this.particleProperties[15].value = cachedP.stride;
		this.particleProperties[16].value = cachedP.radius;
		this.particleProperties[17].value = cachedP.angularVelocity;
		this.particleProperties[18].value = cachedP.linearVelocity[0];
		this.particleProperties[19].value = cachedP.linearVelocity[1];
		if(cachedP.shape.type == 0){ 
			this.particlePropertyRows[6].style.display = 'table-row';
			this.particleProperties[6].value = cachedP.shape.radius.toFixed(2)
		}
		else{
			this.particlePropertyRows[6].style.display = 'none';
		}
		if(cachedP.shape.type == 1){ 
			this.particlePropertyRows[7].style.display = 'table-row';
			this.particlePropertyRows[8].style.display = 'table-row';
			this.particleProperties[7].value = cachedP.shape.width.toFixed(2);
			this.particleProperties[8].value = cachedP.shape.height.toFixed(2);
		}
		else{
			this.particlePropertyRows[7].style.display = 'none';
			this.particlePropertyRows[8].style.display = 'none';
		}	
		if(cachedP.shape.type == 2){ 
			this.particlePropertyRows[5].style.display = 'table-row';
		}
		else{
			this.particlePropertyRows[5].style.display = 'none';
		}
		for(var f = 0; f < cachedP.flags.length; f++){
			if( cachedP.flags[f] == null ) this.particleFlagsList[f].checked = false;
			else this.particleFlagsList[f].checked = true;
		}
		var types = ["Circle","Box","Polygon"]
		this.particleProperties[33].innerText = types[cachedP.shape.type];
		var f = null;
		for(i = 0; i < cachedP.flags.length; i++){
			f |= cachedP.flags[i];
		}
		this.particleProperties[34].innerText = 'Flags : ' + f;
	}
	else {
		document.getElementById('particle-properties').style.display = 'none';
	}
}

propertiesMenu.prototype.updateSpriteProperties = function(){
	var sceneManager = this.sceneManager;
	if(sceneManager.selectedBodies.length > 0){
		
		document.getElementById('sprite-properties').style.display = 'block';
		
		if(sceneManager.selectedBodies[0].sprites.length > 0){
			
			this.spriteProperties[13].innerHTML = '';
			for(i = 0; i < sceneManager.selectedBodies[0].sprites.length; i++){
				var option = document.createElement('option');
				option.value = i;
				option.innerHTML = sceneManager.selectedBodies[0].sprites[i].src;
				this.spriteProperties[13].appendChild(option);
			}
			this.spriteProperties[13].value = sceneManager.selectedBodies[0].selectedSprite;
			var m = sceneManager.selectedBodies[0].selectedSprite;
			var body = sceneManager.selectedBodies[0];
			var s = body.sprites[m];
			this.spriteProperties[1].value = s.width.toFixed(2);
			this.spriteProperties[2].value = s.height.toFixed(2);
			this.spriteProperties[3].value = s.x.toFixed(2);
			this.spriteProperties[4].value = s.y.toFixed(2);
			this.spriteProperties[5].value = s.rotation.toFixed(2)+"°";
			this.spriteProperties[6].value = s.opacity;
			this.spriteProperties[14].innerText = s.src;
			this.spriteProperties[9].value = s.zIndex;
			
			if(s.sprite == null) this.spriteProperties[14].style.color = '#ff000080';
			else this.spriteProperties[14].style.color = '#00ff0080';
			
			if(s.flip[0] == 1) this.spriteProperties[7].checked = false;
			else this.spriteProperties[7].checked = true;
			
			if(s.flip[1] == 1) this.spriteProperties[8].checked = false;
			else this.spriteProperties[8].checked = true;
		}
		else{
			this.spriteProperties[1].value = '';
			this.spriteProperties[2].value = '';
			this.spriteProperties[3].value = '';
			this.spriteProperties[4].value = '';
			this.spriteProperties[5].value = '';
			this.spriteProperties[6].value = 0;
			this.spriteProperties[14].innerText = '';
			this.spriteProperties[9].value = '';
			this.spriteProperties[13].innerHTML = '';
			this.spriteProperties[7].checked = false;
			this.spriteProperties[8].checked = false;
		}
	}
	else{
		document.getElementById('sprite-properties').style.display = 'none';
	}
}
propertiesMenu.prototype.updateBodyProperties = function(){
	var sceneManager = this.sceneManager;
	
	if(sceneManager.selectedBodies.length > 0 && sceneManager.state == sceneManager.STATE_DEFAULT_MODE){
		document.getElementById('body-properties').style.display = 'block';
		var b = sceneManager.selectedBodies[0];
		
		this.bodyProperties[0].disabled = false;
		this.bodyProperties[1].value = b.name;
		this.bodyProperties[2].value = b.userData;
		this.bodyProperties[3].value = b.position[0].toFixed(2);
		this.bodyProperties[4].value = b.position[1].toFixed(2);
		this.bodyProperties[5].value = b.rotation.toFixed(2) + '°';
		this.bodyProperties[6].value = b.scaleXY[0].toFixed(2);
		this.bodyProperties[7].value = b.scaleXY[1].toFixed(2);
		this.bodyProperties[8].value = b.linearVelocity[0];
		this.bodyProperties[9].value = b.linearVelocity[1];
		this.bodyProperties[10].value = b.angularVelocity;
		this.bodyProperties[11].value = b.linearDamping;
		this.bodyProperties[12].value = b.angularDamping;
		this.bodyProperties[13].checked = b.isBullet;
		this.bodyProperties[14].checked = b.isFixedRotation;
		this.bodyProperties[15].checked = b.isActive;
		this.bodyProperties[16].checked = b.isAwake;
		this.bodyProperties[17].value = b.gravityScale;
		this.bodyProperties[18].style.disable = false;
		this.bodyProperties[19].value = b.bodyType;
	}
	else{
		document.getElementById('body-properties').style.display = 'none';
	}
	
}


propertiesMenu.prototype.updateJointProperties = function(){
	var sceneManager = this.sceneManager;
	var j = sceneManager.selectedJoints[0];
	
	if(sceneManager.selectedJoints.length > 0){
		
		var jointNames = ["Distance", "Weld", "Revolute", "Wheel",  "Pulley", "Gear", "Prismatic", "Rope",  "Area", "Friction", "Mouse", "Motor"];
		
		document.getElementById('joint-properties').style.display = 'block';
		for(i = 0; i < this.jointPropertyRows.length; i++){
			this.jointPropertyRows[i].style.display = 'none';
		}
		
		this.jointProperties[1].value = j.name;
		this.jointProperties[2].value = j.userData;
		this.jointProperties[3].checked = j.collideConnected;
		this.jointProperties[31].innerText = jointNames[j.jointType];
		
		//rows
		this.jointPropertyRows[0].style.display = 'table-row';
		this.jointPropertyRows[1].style.display = 'table-row';
		this.jointPropertyRows[2].style.display = 'table-row';
		this.jointPropertyRows[3].style.display = 'table-row';
		this.jointPropertyRows[6].style.display = 'table-row';
		
		if(j.jointType != Joint.JOINT_AREA && j.jointType != Joint.JOINT_GEAR){
			this.jointProperties[6].value = j.localAnchorA[0].toFixed(2);
			this.jointProperties[7].value = j.localAnchorA[1].toFixed(2);
			this.jointProperties[8].value = j.localAnchorB[0].toFixed(2);
			this.jointProperties[9].value = j.localAnchorB[1].toFixed(2);
			
			//raws
			this.jointPropertyRows[9].style.display = 'table-row';
			this.jointPropertyRows[10].style.display = 'table-row';
		}
		if(j.jointType == Joint.JOINT_FRICTION || j.jointType == Joint.JOINT_MOTOR || j.jointType == Joint.JOINT_MOUSE){
			this.jointProperties[25].value = j.maxForce;
			//raws
			this.jointPropertyRows[24].style.display = 'table-row';
			if(j.jointType == Joint.JOINT_FRICTION || j.jointType == Joint.JOINT_MOTOR){
				this.jointProperties[26].value = j.maxTorque;
				//raws
				this.jointPropertyRows[25].style.display = 'table-row';
			}
			if(j.jointType == Joint.JOINT_MOTOR){
				this.jointProperties[27].value = j.angularOffset;
				this.jointProperties[28].value = j.linearOffset[0];
				this.jointProperties[29].value = j.linearOffset[1];
				this.jointProperties[30].value = j.correctionFactor;
				//raws
				this.jointPropertyRows[26].style.display = 'table-row';
				this.jointPropertyRows[27].style.display = 'table-row';
				this.jointPropertyRows[28].style.display = 'table-row';
			}
		}
		if(j.jointType == Joint.JOINT_DISTANCE || j.jointType == Joint.JOINT_WHEEL || j.jointType == Joint.JOINT_MOUSE || j.jointType == Joint.JOINT_AREA){
			this.jointProperties[4].value = j.frequencyHZ;
			this.jointProperties[5].value = j.dampingRatio;
			
			//raws
			this.jointPropertyRows[7].style.display = 'table-row';
			this.jointPropertyRows[8].style.display = 'table-row';
			if(j.jointType == Joint.JOINT_WHEEL){
				this.jointProperties[14].checked = j.enableMotor;
				this.jointProperties[15].value = j.motorSpeed;
				this.jointProperties[16].value = j.maxMotorTorque;
				
				//raws
				this.jointPropertyRows[15].style.display = 'table-row';
				this.jointPropertyRows[16].style.display = 'table-row';
				this.jointPropertyRows[17].style.display = 'table-row';
			}
		}
		if(j.jointType == Joint.JOINT_REVOLUTE || j.jointType == Joint.JOINT_PRISMATIC || j.jointType == Joint.JOINT_WELD){
			this.jointProperties[10].value = j.referenceAngle.toFixed(2);
			
			//raws
			this.jointPropertyRows[11].style.display = 'table-row';
		}
		if(j.jointType == Joint.JOINT_ROPE){
			this.jointProperties[24].value = j.frequencyHZ.toFixed(3);
			//raws
			this.jointPropertyRows[23].style.display = 'table-row';
		}
		if(j.jointType == Joint.JOINT_GEAR || j.jointType == Joint.JOINT_PULLEY){
			this.jointProperties[19].value = j.frequencyHZ;
			//raws
			this.jointPropertyRows[20].style.display = 'table-row';
			if(j.jointType == Joint.JOINT_PULLEY){
				this.jointProperties[20].value = j.groundAnchorA[0].toFixed(2);
				this.jointProperties[21].value = j.groundAnchorA[1].toFixed(2);
				this.jointProperties[22].value = j.groundAnchorB[0].toFixed(2);
				this.jointProperties[23].value = j.groundAnchorB[1].toFixed(2);
				
				//raws
				this.jointPropertyRows[21].style.display = 'table-row';
				this.jointPropertyRows[22].style.display = 'table-row';
			}
		}
		
		if(j.jointType == Joint.JOINT_REVOLUTE || j.jointType == Joint.JOINT_PRISMATIC){
			this.jointProperties[13].checked = j.enableLimit;
			this.jointProperties[14].checked = j.enableMotor;
			this.jointProperties[15].value = j.motorSpeed;
			this.jointProperties[16].value = j.maxMotorTorque;
			
			//raws
			this.jointPropertyRows[14].style.display = 'table-row';
			this.jointPropertyRows[15].style.display = 'table-row';
			this.jointPropertyRows[16].style.display = 'table-row';
			this.jointPropertyRows[17].style.display = 'table-row';
			if(j.jointType == Joint.JOINT_REVOLUTE){
				if(j.enableLimit){
					this.jointProperties[11].value = j.lowerAngle.toFixed(3);
					this.jointProperties[12].value = j.upperAngle.toFixed(3);
					//raws
					this.jointPropertyRows[12].style.display = 'table-row';
					this.jointPropertyRows[13].style.display = 'table-row';
				}
			}
			else if(j.jointType == Joint.JOINT_PRISMATIC){
				this.jointProperties[17].value = j.lowerTranslation.toFixed(3);
				this.jointProperties[18].value = j.upperTranslation.toFixed(3);
				//raws
				this.jointPropertyRows[18].style.display = 'table-row';
				this.jointPropertyRows[19].style.display = 'table-row';
			}
		}
		
	}
	else{
		document.getElementById('joint-properties').style.display = 'none';
	}
}

propertiesMenu.prototype.updateFixtureProperties = function(){
	var sceneManager = this.sceneManager;
	if(sceneManager.state == sceneManager.STATE_SHAPE_EDIT_MODE || sceneManager.state == sceneManager.STATE_BODY_EDIT_MODE){
		document.getElementById('fixture-properties').style.display = 'block';
		
		if(sceneManager.selectedShapes.length > 0){
			var f = sceneManager.selectedShapes[0];
			this.fixtureProperties[2].value = f.userData;
			this.fixtureProperties[3].value = f.position[0].toFixed(2);
			this.fixtureProperties[4].value = f.position[1].toFixed(2);
			this.fixtureProperties[5].value = f.rotation.toFixed(2) + '°';
			this.fixtureProperties[6].value = f.scaleXY[0].toFixed(2);
			this.fixtureProperties[7].value = f.scaleXY[1].toFixed(2);
			this.fixtureProperties[8].value = f.density;
			this.fixtureProperties[9].value = f.friction;
			this.fixtureProperties[10].value = f.restitution;
			this.fixtureProperties[11].value = f.maskBits;
			this.fixtureProperties[12].value = f.categoryBits;
			this.fixtureProperties[13].value = f.groupIndex;
			this.fixtureProperties[14].checked = f.isSensor;
			this.fixtureProperties[15].innerHTML = f.shapeType;
		}
		else{
			var f = sceneManager.selectedShapes[0];
			this.fixtureProperties[2].value = '';
			this.fixtureProperties[3].value = '';
			this.fixtureProperties[4].value = '';
			this.fixtureProperties[5].value = '';
			this.fixtureProperties[6].value = '';
			this.fixtureProperties[7].value = '';
			this.fixtureProperties[8].value = '';
			this.fixtureProperties[9].value = '';
			this.fixtureProperties[10].value = '';
			this.fixtureProperties[11].value = '';
			this.fixtureProperties[12].value = '';
			this.fixtureProperties[13].value = '';
			this.fixtureProperties[14].checked = false
			this.fixtureProperties[15].innerHTML = '';
		}
		
	}
	else{
		document.getElementById('fixture-properties').style.display = 'none';
	}
}

propertiesMenu.prototype.updateSceneCollection = function(e){
	if(this.focus == this.FOCUS_SCENE_COLLECTION){
		var ref = this;
		var element = document.getElementById("objects-list").getElementsByClassName('body')[0];
		var sceneManager = this.sceneManager;
		element.innerHTML = "";
		{
			var lih = document.createElement("li");
			lih.setAttribute("class", "list-head-");
			lih.innerHTML = `Bodies`;
			element.appendChild(lih);
			for(i = 0; i < sceneManager.bodies.length; i++){
				var b = sceneManager.bodies[i];
				var li = document.createElement("li");
				li.setAttribute("class", "list list_body");
				li.setAttribute("draggable", "true");
				li.setAttribute("value", i);
				li.ondragstart = function(e){
					e.dataTransfer.setData("send-body-index", this.value);
				};
				li.innerHTML = `
				<div class="element">
				<span ><p>[${i}]</p> name : ${sceneManager.bodies[i].name}</span>
				</div>
				`;
				if(b.isSelected){ 
					li.style.backgroundColor = "#ffffff10"; 
				};
				element.appendChild(li);
			}
		}
		{
			var lih = document.createElement("li");
			lih.setAttribute("class", "list-head-");
			lih.innerHTML = `Joints`;
			element.appendChild(lih);
			var jointNames = ["Distance", "Weld", "Revolute", "Wheel",  "Pulley", "Gear", "Prismatic", "Rope",  "Area", "Friction", "Mouse", "Motor"];
			for(i = 0; i < sceneManager.joints.length; i++){
				var b = sceneManager.joints[i];
				var li = document.createElement("li");
				li.setAttribute("class", "list list_joint");
				li.setAttribute("value", i);
				li.innerHTML = `
				<div class="element">
				<span>[${i}] name : ${sceneManager.joints[i].name}, type : ${jointNames[sceneManager.joints[i].jointType]}</span>
				</div>
				`;
				if(b.isSelected){ 
					li.style.backgroundColor = "#ffffff10"; 
				};
				element.appendChild(li);
			}
		}
		{
			var lih = document.createElement("li");
			lih.setAttribute("class", "list-head-");
			lih.innerHTML = `Particles`;
			element.appendChild(lih);
			for(i = 0; i < sceneManager.particles.length; i++){
				var b = sceneManager.particles[i];
				var li = document.createElement("li");
				li.setAttribute("class", "list list_particle");
				li.setAttribute("draggable", "true");
				li.setAttribute("value", i);
				li.ondragstart = function(e){
					e.dataTransfer.setData("send-particle-index", this.value);
				};
				li.innerHTML = `<span>[${i}] name : ${sceneManager.particles[i].name}</span>`;
				if(b.isSelected){ 
					li.style.backgroundColor = "#ffff0015"; 
				};
				element.appendChild(li);
			}
		}
		
		{
			var elm = element.getElementsByClassName('list_body');
			for(i = 0; i < elm.length; i++){
				elm[i].onclick = function(){
					var body = sceneManager.bodies[this.value];
					if(!body.isSelected){
						sceneManager.selectedBodies.push(body);
						body.isSelected = true;
					}
					ref.updateSceneCollection();	
				}
			}
		}
		
		{
			var elm = element.getElementsByClassName('list_joint');
			for(i = 0; i < elm.length; i++){
				elm[i].onclick = function(){
					var joint = sceneManager.joints[this.value];
					if(!joint.isSelected){
						sceneManager.selectedJoints.push(joint);
						joint.isSelected = true;
					}
					ref.updateSceneCollection();	
				}
			}
		}
		
		{
			var elm = element.getElementsByClassName('list_particle');
			for(i = 0; i < elm.length; i++){
				elm[i].onclick = function(){
					var p = sceneManager.particles[this.value];
					if(!p.isSelected){
						sceneManager.selectedParticles.push(p);
						p.isSelected = true;
					}
					ref.updateSceneCollection();	
				}
			}
		}
	}
}