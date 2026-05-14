function InputHandler(){
	// mouse tracking variables
	this.lastRightMouseClickPos = [0, 0];
	this.pointerWorldPos = [0, 0, 0, 0];		// mouse_down and current position of cursor in world coordinate
	this.start = [0, 0];						// [mouse_on_down.x  , mouse_on_down.y  ]
	this.current = [0, 0];						// [mouse_on_up.x    , mouse_on_up.y    ]
	this.delta = [0, 0];						// [mouse_delta_pos.x, mouse_delta_pos.y]
	this.mouseSensitivity = 1;					// navigation speed, depends on scale of the viewport
	this.mouseStatus = [0, 0];					// [is_down, is_left = 1 or is_right = 2]
	this.selectionArea = [0, 0, 0, 0, 0];		// [x, y, width, height, is_active]
	this.selection = []							// array of selected objects
	
	this.CTRL_PRESSED = 0;
	this.SHIFT_PRESSED = 0;
	this.ALT_PRESSED = 0;
	this.SPACE_PRESSED = 0;
	
	this.B_KEY_PRESSED = false;
	this.J_KEY_PRESSED = false;
	this.P_KEY_PRESSED = false;
	
	this.LOCK_SCALE_ENABLED = false;
	
	this.SNAPPING_ENABLED = false;
	this.snappingData = [1, 0.1, 10];			// [snap_pos, delta_scale, delta_angle]
	this.transformTool = InputHandler.TRANSFORM_TOOL_TRANSLATION;
	this.pivotMode = InputHandler.PIVOT_LOCAL_MODE;

	this.inGameMode = 0;
}

InputHandler.LOCK_MODE = -1;
InputHandler.IS_LEFT_MOUSE_BUTTON = 1;
InputHandler.IS_RIGHT_MOUSE_BUTTON = 2;
InputHandler.PIVOT_LOCAL_MODE = 3;
InputHandler.PIVOT_SELECTION_MIDDLE = 4;
InputHandler.TRANSFORM_TOOL_SCALE = 5;
InputHandler.TRANSFORM_TOOL_ROTATION = 6;
InputHandler.TRANSFORM_TOOL_TRANSLATION = 7;

InputHandler.prototype.clearSelectionArea = function(){
	return this.selectionArea = [0, 0, 0, 0, 0];
};

InputHandler.prototype.isMouseDown = function(){
	return this.mouseStatus[0] == 1;
};

InputHandler.prototype.isRightClick = function(){
	return this.mouseStatus[1] == InputHandler.IS_RIGHT_MOUSE_BUTTON;
};

InputHandler.prototype.isLeftClick = function(){
	return this.mouseStatus[1] == InputHandler.IS_LEFT_MOUSE_BUTTON;
};

InputHandler.prototype.activateLockMode = function(){
	this.transformTool = InputHandler.LOCK_MODE;
};

InputHandler.prototype.activateTranslationTool = function(){
	this.transformTool = InputHandler.TRANSFORM_TOOL_TRANSLATION;
};

InputHandler.prototype.activateScaleTool = function(){
	this.transformTool = InputHandler.TRANSFORM_TOOL_SCALE;
};

InputHandler.prototype.activateRotationTool = function(){
	this.transformTool = InputHandler.TRANSFORM_TOOL_ROTATION;
};

InputHandler.prototype.activateLocalPivotMode = function(){
	this.pivotMode = InputHandler.PIVOT_LOCAL_MODE;
};

InputHandler.prototype.activateSelectionPivotMode = function(){
	this.pivotMode = InputHandler.PIVOT_SELECTION_MIDDLE;
};