// Create an object to handle animations
var animationManager = {
	animations : [],
	deadAnimations : [], // Used to avoid race condition when animations die outside of update()
	newAnimations : [],  // Ditto
	
	update : function(dT) {			
		var survivors = [];			
		
		// Copy over new animations
		this.animations = this.animations.concat(this.newAnimations);
		this.newAnimations = [];
		for(var i=0; i<this.animations.length; i++) {
			// TODO: Major error handling!
			var _a = this.animations[i];
			
			// See if this is on the dead list
			var dead = false;
			for(var j=0; j<this.deadAnimations.length; j++) {
				if(_a === this.deadAnimations[j])
					dead = true;
			}
			if(dead) continue;
			
			var progress =  (new Date().getTime() - _a["startTime"]) / _a["duration"];
			if(progress <= 1 && progress >= 0) {
				// TODO: Assume linear easing for now
				var newVal = progress * (_a["target"] - _a["startVal"]) + _a["startVal"];
				_a["object"][_a["property"]] = newVal;
				// Assume object has update function
				if(_a["object"].update) _a["object"].update();
			}
			if(progress >= 1) {
				// Call completion method
				_a["complete"]();
			}
			else {
				// Keep it around if it's not completed
				survivors.push(_a);
			}
		}
		// Only keep incomplete animations around
		this.animations = survivors;
		this.deadAnimations = [];
	},
	
	stop : function(object) {
		// Stop all pending animations for a given object
		for(var i=0; i<this.animations.length; i++) {
			if(this.animations[i]["object"] === object) {
				this.deadAnimations.push(this.animations[i]);
			}
		}	
		//this.survivingAnimations = survivors;
	},
	
	clear : function() {
		animations = [];
		// Probably need to do more to avoid memory leaks?
	},
	
	register : function(object, property, target, duration, easing, complete) {
		// TODO: Default parameters
		var _a = {"object" 	  : object,
				  "property"  : property,
				  "target"	  : target,
				  "duration"  : duration,
				  "easing"	  : easing,
				  "complete"  : complete,
				  "startTime" : new Date().getTime(),
				  "startVal"  : object[property]
				  };
		this.newAnimations.push(_a);
	}
	
}	

