var radius = 200;
var resolution = 10;


for (var j = 0; j < Editor.sceneManager.selectedBodies.length; j++){
	for (var i = 0; i < resolution; i++){
		var body = Editor.sceneManager.selectedBodies[j];
		var b = body.clone();
		var x = body.position[0] + (radius * Math.cos(i * 2 * Math.PI / resolution));
		var y = body.position[1] + (radius * Math.sin(i * 2 * Math.PI / resolution));
		b.setPosition(x, y);
		Editor.sceneManager.addBody(b);
	};
};