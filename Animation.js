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
				if(typeof _a["target"] === 'object' && _a["target"] != null) {
					// An array was passed in (like a point)
					var objectVal = {};
					for(key in _a["target"]) {
						var val = this.easedValue(_a["easing"],
											 	   progress,
											 	   _a["target"][key],
											 	   _a["startVal"][key]);
						console.log("Key is '" + key + "' value is " + val);											 	   
						objectVal[key] = val;
						//console.log(_a["object"] + "." + _a["property"] + "." + key);
						//console.log(_a["object"][_a["property"]][key]);
					}
					_a["object"][_a["property"]] = objectVal;
					console.log("Animating: " + _a["object"]);
					
					console.log("animation target is:");
					console.log(_a["target"]);
				}
				else {
					// A single value was passed in
					_a["object"][_a["property"]] = this.easedValue(_a["easing"],
																   progress,
																   _a["target"],
																   _a["start"]);
					if(_a["target"].x) console.log(_a["target"].x + "!!!");
				}
				
				var newVal;
				if(_a["easing"] == "linear")
					newVal = progress * (_a["target"] - _a["startVal"]) + _a["startVal"];
				else if(_a["easing"] = "inout") 
					newVal = -(Math.cos(progress*(Math.PI))-1)/2 * (_a["target"] - _a["startVal"]) + _a["startVal"];
					
				_a["object"][_a["property"]] = newVal;
				// Assume object has update function
				if(_a["object"].update) _a["object"].update();
			}
			if(progress >= 1) {
				// Call completion method
				if(_a["complete"])
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
				  //console.log(_a["target"]);
		this.newAnimations.push(_a);
	},
	
	easedValue : function(easing, progress, target, start) {
		if(easing == "linear")
			return progress * (target - start) + start;
		else if(easing = "inout") 
			return -(Math.cos(progress*(Math.PI))-1)/2 * (target - start) + start;	
		else return null;	
	}
	
}	

var Moveable = {
	translation : {x: 0, y: 0},
	translationTarget : {x: 0, y: 0},
	canMove : true,
	updateMotion : function() {
		if(this.translationTarget.x != this.translation.x || this.translationTarget.y != this.translation.y) {
			var dP = {x: this.translationTarget.x - this.translation.x,
					  y: this.translationTarget.y - this.translation.y};
			//this.translate(dP);
			this.translation.x += dP.x;
			this.translation.y += dP.y;
			console.log("Translating " + this + " by ");
			console.log(dP);
			console.log("Target: ");
			console.log(this.translationTarget);
			console.log(this.translationTarget.x);
			console.log("Translation: " + this.translation);
		}
	}
}

