/**
*
* params x coordinate of vertex
* params y coordinate of vertex
* params width for collision detection
* params height for collision detection
*/
function Vertex(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
	this.isSelected = false;
}

Vertex.prototype.move = function (dx, dy) {
	this.x += dx;
	this.y += dy;
};

Vertex.prototype.clone = function(){
	var v = clone(this);
	return v;
};