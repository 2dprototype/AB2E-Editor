function moveArray(array, old_index, new_index) {
    if (new_index >= array.length) {
        var k = new_index - array.length + 1;
        while (k--) {
            array.push(undefined);
        }
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    return array; 
};

function removeItemFromArrayAll(arr, value) {
	var i = 0;
	while (i < arr.length) {
		if (arr[i] === value) {
			arr.splice(i, 1);
		} else {
			++i;
		}
	}
	return arr;
}
function removeItemFromArray(arr, value) {
	var index = arr.indexOf(value);
	if (index > -1) {
		arr.splice(index, 1);
	}
	return arr;
}


function create_hash_sha1(str){
	var hash = crypto.createHash('sha1');
	hash.setEncoding('hex');
	hash.write(str);
	hash.end();
	return hash.read();
}


function getTimeDiffAndPrettyText(_oDatePublished) {
	// CREDITS : https://stackoverflow.com/questions/1787939/check-time-difference-in-javascript
	var oDatePublished = new Date(_oDatePublished);
	var oResult = {};
	var oToday = new Date();
	var nDiff = oToday.getTime() - oDatePublished.getTime();
	// Get diff in days
	oResult.days = Math.floor(nDiff / 1000 / 60 / 60 / 24);
	nDiff -= oResult.days * 1000 * 60 * 60 * 24;
	// Get diff in hours
	oResult.hours = Math.floor(nDiff / 1000 / 60 / 60);
	nDiff -= oResult.hours * 1000 * 60 * 60;
	// Get diff in minutes
	oResult.minutes = Math.floor(nDiff / 1000 / 60);
	nDiff -= oResult.minutes * 1000 * 60;
	// Get diff in seconds
	oResult.seconds = Math.floor(nDiff / 1000);
	// Render the diffs into friendly duration string
	// Days
	var sDays = '00';
	if (oResult.days > 0) {
		sDays = String(oResult.days);
	}
	if (sDays.length === 1) {
		sDays = '0' + sDays;
	}
	// Format Hours
	var sHour = '00';
	if (oResult.hours > 0) {
		sHour = String(oResult.hours);
	}
	if (sHour.length === 1) {
		sHour = '0' + sHour;
	}
	//  Format Minutes
	var sMins = '00';
	if (oResult.minutes > 0) {
		sMins = String(oResult.minutes);
	}
	if (sMins.length === 1) {
		sMins = '0' + sMins;
	}
	//  Format Seconds
	var sSecs = '00';
	if (oResult.seconds > 0) {
		sSecs = String(oResult.seconds);
		}
	if (sSecs.length === 1) {
		sSecs = '0' + sSecs;
	}
	//  Set Duration
	var sDuration = sDays + ':' + sHour + ':' + sMins + ':' + sSecs;
	oResult.duration = sDuration;
	// Set friendly text for printing
	if(oResult.days === 0) {
		if(oResult.hours === 0) {
			if(oResult.minutes === 0) {
				var sSecHolder = oResult.seconds > 1 ? 'Seconds' : 'Second';
				oResult.friendlyNiceText = oResult.seconds + ' ' + sSecHolder + ' ago';
				} 
			else { 
				var sMinutesHolder = oResult.minutes > 1 ? 'Minutes' : 'Minute';
				oResult.friendlyNiceText = oResult.minutes + ' ' + sMinutesHolder + ' ago';
			}
			} 
		else {
			var sHourHolder = oResult.hours > 1 ? 'Hours' : 'Hour';
			oResult.friendlyNiceText = oResult.hours + ' ' + sHourHolder + ' ago';
		}
		} 
	else { 
		var sDayHolder = oResult.days > 1 ? 'Days' : 'Day';
		oResult.friendlyNiceText = oResult.days + ' ' + sDayHolder + ' ago';
	}
	return oResult;
}


// function wrapFunc(raw) {
	// return `(function(){${raw}})`
// }

function runIsolated(code, scope = {}) {
	// List of sensitive globals to block by shadowing them with undefined
	const blocked = [
		'window', 'document', 'fs', 'path', 'require', 'process', 'os', 'crypto', 
		'ipcRenderer', 'CoffeeScript', 'JSZip', 'ini', 'YAML', 'JSON5', 'JSONC', 
		'CSON', 'jsonpack', 'toXML', 'fromXML', 'PSON', 'global', 'module', 'exports',
		'electron', 'cmd', 'terminal', 'App', 'Project', 'UIManager', 'SceneManager',
		'Viewport', 'InputHandler', 'Navigator', 'Renderer', 'SceneHistory'
	];
	
	const keys = Object.keys(scope);
	const values = Object.values(scope);
	
	// Enforce strict mode and isolate 'this'
	const isolatedCode = `"use strict"; 
		return (function() { 
			${code} 
		}).call(undefined);`;
	
	try {
		// Create a function where the first arguments are scope variables,
		// and the following are the blocked variables (which will be undefined)
		const func = new Function(...keys, ...blocked, isolatedCode);
		return func(...values);
	} catch (e) {
		throw e;
	}
}