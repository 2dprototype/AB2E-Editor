function fileExporter(sceneManager, app){
    this.sceneManager = sceneManager;
	this.app = app;
}

fileExporter.prototype.importAsZip = function(filepath){
	var sceneManager = this.sceneManager;
	var app = this.app;
	var _dir = path.dirname(filepath);
	var file_name = path.parse(filepath).name;
	var base_name = path.basename(filepath);
	var dir = path.join(_dir, file_name);
	
	fs.readFile(filepath, function(err, data) {
		if (!err) {
			if(!fs.existsSync(dir)) fs.mkdirSync(dir);
			var zip = new JSZip();
			zip.loadAsync(data).then(function(contents) {
				Object.keys(contents.files).forEach(function(filename) {

					zip.file(filename).async('nodebuffer').then(function(content) {
						var dest = path.join(dir, filename);
						fs.writeFileSync(dest, content);
						if(filename == 'info.ini' && fs.existsSync(dest)){
							var ini_file = fs.readFileSync(dest, 'utf8');
							var ini_data = ini.parse(ini_file);
							if(ini_data.target != null){
								var ab2e_file_path = path.join(dir, ini_data.target);
								if(fs.existsSync(ab2e_file_path)){
									var ab2e_file = fs.readFileSync(ab2e_file_path);
									var ab2e_data = parse(ab2e_file, '.json');
									app.setCurrentFile(path.resolve(ab2e_file_path));
									sceneManager.newScene();
									sceneManager.loadSceneData(ab2e_data);
								}
								else{
								    app.UIManager.alert(`"${base_name}" has extracted successfuly! But could not find "${ini_data.target}".\nTo import "${base_name}" again. Or load "${ab2e_file_path}".`);
								}
							}
						}
					});
					
				});
		   });
		}
	});
}


fileExporter.prototype.saveAsZip = function(filepath){
	var scene = this.sceneManager.saveScene();
	var u_scene = this.app.sceneManager.getSceneData();
	var json_scene = JSON.stringify(u_scene, null, 4);
	var filename = this.app.currentFile.nameonly + '.ab2e';
	var zip = new JSZip();
	for (var k = 0; k < scene.bodies.length; k++){
	    for (var j = 0; j < scene.bodies[k].sprites.length; j++){
		    var sprite = scene.bodies[k].sprites[j];
			var img_data = fs.readFileSync(path.join(this.app.currentFile.dir, sprite.src));
			zip.file(sprite.src, img_data);
		}
	}
	var ini_data = {
		target : filename,
		timestamp : new Date().getTime(),
		hash : create_hash_sha1(json_scene)
	}
	zip.file(filename, json_scene);
	zip.file('info.ini', ini.stringify(ini_data));
	zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(fs.createWriteStream(filepath)).on('finish', function () {
		console.log(`File has saved to... ${filepath}`);
	});  
}

fileExporter.prototype.exportAs_ab2e = function(filepath){
	var scene = this.sceneManager.exportWorld();
	var zip = new JSZip();
	var resource = zip.folder("resource");
	for (var k = 0; k < scene.sprites.length; k++){
		var sprite = scene.sprites[k];
		var img_data = fs.readFileSync(path.join(this.app.currentFile.dir, sprite.src));
		resource.file(sprite.src, img_data);
		sprite.src = 'resource/' + sprite.src;
	}
	var json_scene = JSON.stringify(scene, null, 4);
	zip.file("scene.json", json_scene);
	zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true }).pipe(fs.createWriteStream(filepath)).on('finish', function () {
		console.log(`File has saved to... ${filepath}`);
	});    
}


// function to_xml(obj){
	// var _obj = {};
    // for (var key in obj){
		// if(obj.hasOwnProperty(key)){
			// var value = obj[key];
			// if(Array.isArray(value)){
				// _obj[key] = {
					// '@type' : 'array',
					// '#' : to_xml(value)
				// }
			// }
			// else if(typeof value == 'object'){
				// _obj[key] = to_xml(value);
			// }
			// else{
				// _obj[key] = {
					// '@type' : typeof value,
					// '#' : value
				// }
			// }
		// }
	// }
	// return _obj
// }


// function from_xml(obj){
	// var _obj = {};
    // for (var key in obj){
		// if(obj.hasOwnProperty(key)){
			// var value = obj[key];
			// var type = value['@type'];
			// if(type == 'string'){
				// _obj[key] = value['#'] || ''
			// }
			// else if(type == 'number'){
				// _obj[key] = value['#'] || ''
			// }
			// else if(type == 'boolean'){
				// _obj[key] = value['#'] || ''
			// }
			// else if(type == 'array'){
				// var arr = [];
				// for (i in value){
					// if(value.hasOwnProperty(i)){
						// if(i != '@type') arr.push(from_xml(value[i]));
					// }
				// }
				// _obj[key] = arr
			// }
			// else{
				// console.log(value);
				// _obj[key] = from_xml(value);
			// }

			
		// }
	// }
	// return _obj
// }

// function from_xml(obj){
	// var _obj = {};
    // for (var key in obj){
		// if(obj.hasOwnProperty(key)){
			// var value = obj[key];
			// if(typeof value == 'object'){
			   // _obj[key] = from_xml(value);
			   // if(value.hasOwnProperty('@type')){
			      // var type = value['@type'];
				  // var _value = value['#'] || '';
				  // if(type == 'string') _obj[key] = new String(_value);
				  // else if(type == 'number') _obj[key] = parseFloat(_value);
				  // else if(type == 'boolean') _obj[key] = ('true' == _value) ? true : false;
				  // else if(type == 'array'){
					// var arr = [];
					// for (var i in value){
						// if(value.hasOwnProperty(i)){
						    // if(typeof value[i] == 'object') arr[i] = from_xml(value[i]);
						// } 
					// }
					// _obj[key] = arr
				  // }
				  // else _obj[key] = null;				      
			   // }
			// }
			// else{
			    // _obj[key] = value;
			// }
		// }
	// }
	// return _obj
// }