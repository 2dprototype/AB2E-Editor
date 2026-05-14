
function decomposeToConvex(vertices){
	var polygon = new Polygon();
	for (var i = 0; i < vertices.length; i++){
		polygon.addPoint(vertices[i].x, vertices[i].y);
	}
	return polygon.decompose();
}