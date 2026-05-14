var terminal = (function () {
	// OUTPUT_TYPE
	var OUTPUT_INPUT = 1, 
	    OUTPUT_PASSWORD = 2, 
		OUTPUT_CONFIRM = 3;

	var cursorInterval = function (inputField, terminalObj) {
		var cursor = terminalObj._cursor
		setTimeout(function () {
			if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
				cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
				cursorInterval(inputField, terminalObj)
			} else {
				cursor.style.visibility = 'visible'
			}
		}, 500)
	}

	var firstPrompt = true;
	promptInput = function (terminalObj, message, PROMPT_TYPE, callback) {
	var shouldDisplayInput = (PROMPT_TYPE === OUTPUT_INPUT)
	
	var inputField = document.createElement('input')
		inputField.style.position = 'absolute'
		inputField.style.zIndex = '-100'
		inputField.style.outline = 'none'
		inputField.style.border = 'none'
		inputField.style.opacity = '0'
		inputField.style.fontSize = '0.2em'

		terminalObj._inputLine.textContent = ''
		terminalObj._input.style.display = 'block'
		terminalObj.html.appendChild(inputField)
		cursorInterval(inputField, terminalObj)

		if (message.length) terminalObj.println(PROMPT_TYPE === OUTPUT_CONFIRM ? message + ' (Y/N)' : message)

		inputField.onblur = function () {
			terminalObj._cursor.style.display = 'none'
		}

		inputField.onfocus = function () {
			inputField.value = terminalObj._inputLine.textContent
			terminalObj._cursor.style.display = 'inline'
		}

		terminalObj.html.onclick = function () {
			inputField.focus()
			}

		inputField.onkeydown = function (e) {
			if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
				e.preventDefault()
			} else if (shouldDisplayInput && e.which !== 13) {
				setTimeout(function () {
					terminalObj._inputLine.textContent = inputField.value
				}, 1)
			}
		}
		inputField.onkeyup = function (e) {
			if (PROMPT_TYPE === OUTPUT_CONFIRM || e.which === 13) {
				terminalObj._input.style.display = 'none'
				var inputValue = inputField.value
				if (shouldDisplayInput) terminalObj.println(inputValue)
				terminalObj.html.removeChild(inputField)
				if (typeof(callback) === 'function') {
					if (PROMPT_TYPE === OUTPUT_CONFIRM) {
						callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
					} else callback(inputValue)
				}
			}
		}
		if (firstPrompt) {
			firstPrompt = false
			setTimeout(function () { inputField.focus()	}, 50)
		} else {
			inputField.focus()
		}
	}

	var TerminalConstructor = function (id) {

		this.html = document.createElement('div');
		this.hidden = false;
		this.html.className = 'Terminal'
		if (typeof(id) === 'string') { this.html.id = id }

		this._innerWindow = document.createElement('div')
		this._output = document.createElement('p')
		this._inputLine = document.createElement('span') //the span element where the users input is put
		this._cursor = document.createElement('span')
		this._input = document.createElement('p') //the full element administering the user input, including cursor

		this._shouldBlinkCursor = true

		this.hide = function(){
			this.html.style.display = 'none';
			this.hidden = true;
		}
		
		this.show = function(){
			this.html.style.display = 'block';
			this.hidden = false;
		}

		this.scrollDown = function (element) {
			this.html.scroll(0, this.html.scrollHeight)
		}
		
		
		this.appendChild = function (element) {
			this._output.appendChild(element)
		}	
		
		this.println = function (message, color = "#ffffff80", prefix = '') {
			var text = ''
			if(typeof message == 'string') text = message.replace(/(?:\r\n|\r|\n)/gm, '<br>');
			else text = message
			var newLine = document.createElement('div')
			newLine.innerHTML = prefix + text;
			newLine.style.color = color;
			this._output.appendChild(newLine);
			this.scrollDown();
		}

		
		this.error = function (message, prefix = '') {
			var text = ''
			if(typeof message == 'string') text = message.replace(/(?:\r\n|\r|\n)/gm, '<br>');
			else text = message
			var newLine = document.createElement('div')
			newLine.innerHTML = prefix + text;
			newLine.style.color ="#f4433680"
			this._output.appendChild(newLine)
			this.scrollDown();
		}
		
		

		this.input = function (message, callback) {
			promptInput(this, message, OUTPUT_INPUT, callback)
		}

		this.password = function (message, callback) {
			promptInput(this, message, OUTPUT_PASSWORD, callback)
		}

		this.confirm = function (message, callback) {
			promptInput(this, message, OUTPUT_CONFIRM, callback)
		}

		this.clear = function () {
			this._output.innerHTML = ''
		}

		this.timer = function (milliseconds, callback) {
			setTimeout(callback, milliseconds)
		}

		this.setTextSize = function (size) {
			this._output.style.fontSize = size
			this._input.style.fontSize = size
		}

		this.setTextColor = function (col) {
			this.html.style.color = col
			this._cursor.style.background = col
		}

		this.setBackgroundColor = function (col) {
			this.html.style.background = col
		}

		this.setWidth = function (width) {
			this.html.style.width = width
		}
		
		this.setInputBackground = function (background) {
			this._input.style.background = background
		}

		this.setHeight = function (height) {
			this.html.style.height = height
		}
		
		this.setFontFamily = function (fontFamily) {
			this.html.style.fontFamily = fontFamily
		}

		this.blinkingCursor = function (bool) {
			bool = bool.toString().toUpperCase()
			this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
		}

		this._input.appendChild(this._inputLine)
		this._input.appendChild(this._cursor)
		this._innerWindow.appendChild(this._output)
		this._innerWindow.appendChild(this._input)
		this.html.appendChild(this._innerWindow)

		this.setBackgroundColor('#18191d')
		this.setTextColor('#38d95880')
		this.setTextSize('1em')
		this.setWidth('100%')
		this.setHeight('100%')

		this.html.style.fontFamily = 'monospace'
		this.html.style.boxShadow = "rgba(0, 0, 0, 0.47) 0px 1px 8px 3px"
		this.html.style.margin = '0'
		this.html.style.overflow = 'auto'
		this.html.style.position = 'absolute'
		this._innerWindow.style.padding = '10px'
		this._input.style.margin = '2px'
		this._output.style.margin = '2px'
		this._cursor.style.background = '#38d95880'
		this._cursor.style.color = '#ffffff00'
		this._cursor.innerHTML = '|' //put something in the cursor..
		this._cursor.style.display = 'none' //then hide it
		this._input.style.display = 'none'
	}

	return TerminalConstructor
}())