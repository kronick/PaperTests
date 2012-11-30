var GUIManager = {
	hovering : null,
	clicking : null,
	dragging : null,
	dragStart : null,
	focus : null	
};
var hitOptions = {
	segments: false,
	stroke: false,
	fill: true,
	tolerance: 5
};

GUIManager.init = function() {
	// Must be called after canvas, etc are initialized
	tool.onMouseMove = function(event) {
		if(!GUIManager.dragging) {
		    var hitResult = project.hitTest(event.point, hitOptions);
		    if (hitResult && hitResult.item) { 	
		    	// It's a hit!
		    	var alreadyHovering = GUIManager.hovering;
	
				var hoveringResponder = hitResult.item;
				while(!hoveringResponder.mouseOver && hoveringResponder.parent) hoveringResponder = hoveringResponder.parent;	
				
		    	var changeHover = GUIManager.hovering && !(GUIManager.hovering === hoveringResponder);		
				if(!alreadyHovering || changeHover) {
					if(changeHover) {
						// Trigger mouseOut
						// Walk up scene graph until something responds to mouseOut
						var item = GUIManager.hovering;
						while(!item.mouseOut && item.parent) item = item.parent;
						if(item.mouseOut) item.mouseOut(event);
						GUIManager.hovering = null;
					}
					// Trigger mouseOver
					// Walk up scene graph until something responds to mouseOver
					var item = hitResult.item;
					while(!item.mouseOver && item.parent) item = item.parent;	
					if(item.mouseOver) item.mouseOver(event);
					GUIManager.hovering = item;
				}
			}
			else {
				if(GUIManager.hovering) {
					// Trigger mouseOut
					var item = GUIManager.hovering;
					while(!item.mouseOut && item.parent) item = item.parent;
					if(item.mouseOut) item.mouseOut(event);		
					GUIManager.hovering = null;		
				}
			}
		}
	}
	tool.onMouseDown = function(event) {
	}
	tool.onMouseUp = function(event) {
	}
	tool.onMouseDrag = function(event) {
	}
}