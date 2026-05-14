function LineSegment(startx, starty, endx, endy){
	/*
				Line Segment 
		(sX, sY)------------------				
			|\				     |				|
			|	\				 |				|	
			|		\			 |			bounds height
			|			\		 |				|
			|				\	 |				|
			|					\|				|
			-------------------(eX, eY)			

			<--- bounds width --->

	*/

	this.sX = startx;
	this.sY = starty;
	this.eX = endx;
	this.eY = endy;

 	// to keep track of whether sX > eX
	this.signX = 1;
	if (endx > startx){
		this.signX *= -1;
	}

	// to keep track of whether sY > eY
	this.signY = 1;
	if (endy > starty){
		this.signY *= -1;
	}
}

/**
*
* returns perpendicular distance between point and the line segment
*/
LineSegment.prototype.distanceFromPoint = function(pX, pY){
	var distance = Math.abs((this.eX - this.sX) * (this.sY - pY) - (this.sX - pX) * (this.eY - this.sY));
	distance /= Math.pow( (this.eX - this.sX) * (this.eX - this.sX) + (this.eY - this.sY) * (this.eY - this.sY) , 0.5);
	return distance;
}

/**
*
* returns true if point's x coordinate lies in line segment bounds 
*/
LineSegment.prototype.checkInBoundsX = function(px){
	return (this.signX * px < this.signX * this.sX && this.signX * px > this.signX * this.eX);
}

/**
*
* returns true if point's y coordinate lies in line segment bounds 
*/
LineSegment.prototype.checkInBoundsY = function(py){
	return (this.signY * py < this.signY * this.sY && this.signY * py > this.signY * this.eY);
}

/**
*
* params bounds => [x, y, width, height]
* returns true if the line segment bounds contains the rectangle bounds
*/
LineSegment.prototype.checkInBoundsAABB = function(bounds){
	var lineBounds = [(this.eX + this.sX) / 2, (this.eY + this.sY) / 2, Math.abs(this.eX - this.sX), Math.abs(this.eY - this.sY)];
	
	if (lineBounds[0] + lineBounds[2] / 2 < bounds[0] - bounds[2] / 2) return false;
	if (lineBounds[0] - lineBounds[2] / 2 > bounds[0] + bounds[2] / 2) return false;
	if (lineBounds[1] + lineBounds[3] / 2 < bounds[1] - bounds[3] / 2) return false;
	if (lineBounds[1] - lineBounds[3] / 2 > bounds[1] + bounds[3] / 2) return false;

	return true;
}