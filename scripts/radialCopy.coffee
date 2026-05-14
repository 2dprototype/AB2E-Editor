radius = 200;
resolution = 10;
sceneManager = Editor.sceneManager
selectedBodies = sceneManager.selectedBodies
j = 0
while j < selectedBodies.length
	i = 0  
	while i < resolution
		b = selectedBodies[j].clone()
		x =  b.position[0] + (radius * (Math.cos( i * 2 * Math.PI / resolution)))
		y =  b.position[1] + (radius * (Math.sin( i * 2 * Math.PI / resolution)))
		b.setPosition(x, y)
		sceneManager.addBody b

		i++
	j++