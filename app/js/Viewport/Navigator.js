// to handle canvas panning and zooming
function Navigator(){
	// canvas manipulating parameters
	this.panning = [0, 0];						// canvas translation.[x, y]
	this.origin = [0, 0];						// canvas origin.[x, y]
	this.scale = 1;								// canvas scale (scaleX = scaleY)
	this.scaleLimits = [0.0005, 50];			// [min scale, max scale]
	this.grid = [0, 0];							// [range, cell_size]
	this.range = 1000;
	this.cell_size = 5;
}

Navigator.prototype.screenPointToWorld = function(x, y){
	return 	[
		(x / this.scale - this.panning[0] + this.origin[0]), 
		(y / this.scale - this.panning[1] + this.origin[1])
	];
};

Navigator.prototype.worldPointToScreen = function(x, y){
	return 	[
		(x + this.panning[0] - this.origin[0]) * this.scale, 
		(y + this.panning[1] - this.origin[1]) * this.scale
	];	
};

Navigator.prototype.checkPointInAABB = function(x, y, bounds){
	// world parametes to screen
	var width = bounds[2] * this.scale;
	var height = bounds[3] * this.scale;
	var position = this.worldPointToScreen(bounds[0], bounds[1]);
	// ------------------------- //
	return ((x >= position[0] - width / 2 && x <= position[0] + width / 2) & (y >= position[1] - height / 2 && y <= position[1] + height / 2));
};
Navigator.prototype.checkPointInCircle = function(a, b, x, y, r) {
	var dist_points = (a - x) * (a - x) + (b - y) * (b - y);
	r *= r;
	if (dist_points < r) {
		return true;
	}
	return false;
};