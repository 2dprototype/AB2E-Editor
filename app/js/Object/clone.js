function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Vertex) {
        copy = new Vertex();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    if (obj instanceof Shape) {
        copy = new Shape();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    if (obj instanceof Body) {
        copy = new Body();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }
	//sprites
    if (obj instanceof Sprite) {
        copy = new Sprite();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)){ copy[attr] = clone(obj[attr]); }
        }
        return copy;
    }
	//particles
    if (obj instanceof Particle) {
        copy = new Particle();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)){ copy[attr] = clone(obj[attr]); }
        }
        return copy;
    }
	//particleShape
	if (obj instanceof particleShape) {
        copy = new particleShape();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    // if (obj instanceof Joint){
    // 	copy = new Joint(obj.jointType);
    //     for (var attr in obj) {
    //     	if (attr == 'bodyA'){		// donot clone body
    //     		copy[attr] = obj[attr];
    //     		continue;
    //     	}
    //         if (obj.hasOwnProperty(attr) && attr != "name") copy[attr] = clone(obj[attr]);
    //     }
    //     return copy;
    // }

    if (obj instanceof Image){
    	copy = new Image();
    	copy.src = obj.src;
    	copy.width = obj.width;
    	copy.height = obj.height;
    	return copy;
    }
}








function clone_obj(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone_obj(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone_obj(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}