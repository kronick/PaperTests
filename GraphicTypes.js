var GlowingCircle = function(point, radius, falloff, color) {
	var clear = color.clone(); clear.alpha = 0;
	var gradient = new Gradient([clear, color, clear], 'radial');
	gradient.stops[0].rampPoint = radius/(radius+falloff);
	gradient.stops[1].rampPoint = radius/(radius+falloff);
	gradient.stops[2].rampPoint = 1;
	var gradientColor = new GradientColor(gradient, point,
													point.add([radius + falloff, 0]));
	var circle = new Path.Circle(point, radius + falloff);
	//this.circle.strokeColor = color;
	circle.fillColor = gradientColor;		

	// Fading stuff
	circle.faded = false;
	circle.fadeOn = true;
	circle.glowSpeed = 3000;
	var thisGuy = this;
	circle.fade = function() {
		if(circle.faded && circle.fadeOn) {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", 1, circle.glowSpeed, "linear", circle.fade);
		}
		else {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", .1, circle.glowSpeed, "linear", circle.fade);
		}
		
		circle.faded = !circle.faded;
	};
	circle.fade();
	
	circle.startPulse = function() {
		circle.fadeOn = true;
		circle.faded = true;
		circle.fade();
	}
	circle.stopPulse = function() {
		circle.fadeOn = false;
	}
	
	return circle;
}

var OrbitItem = window.paper.Layer.extend({
	expanded : false,
	dotScale : 1,
	scaleFactor : 1,

	initialize : function(overlord, text, radius, angle, size, bright) {		
		if(!bright) bright = 1;
		var oldActive = project.activeLayer;		// Save state
		this.base();
		this.overlord = overlord;

		this.basePoint = new Point(0,-radius).add(view.center);
		this.basePoint = this.basePoint.rotate(angle, view.center);
		//this.activate();
		
		var _color = new RgbColor(bright, bright, bright);
		this.dotGlow = new GlowingCircle(this.basePoint, size-1, size*1.5, _color);
		this.addChild(this.dotGlow);
						
		this.baseDot = new Path.Circle(this.basePoint, size);
		this.baseDot.fillColor =  _color;
		this.addChild(this.baseDot);
		
		// Text label
		this.label = new PointText(this.basePoint.add(new Point(0, -20)));
		var words = ["Day", "Ticket", "Mom", "hangover", "loud", "light", "word", "night", "dog", "vote"];
		this.label.content = words[Math.floor(Math.random()*words.length)];
		this.label.characterStyle = {
			font: "Helvetica",
			fontSize : 5,
			fillColor : 'white'
		}
		this.label.fontWeight = "bold";
		this.label.paragraphStyle.justification = 'center';
		this.label.visible = false;
		this.addChild(this.label);

		oldActive.activate();					// Restore state
	},
	
	update : function() {
		this.baseDot.scale(this.dotScale / this.scaleFactor);
		this.dotGlow.scale(this.dotScale / this.scaleFactor);
		//this.baseDot.scale(1);
		this.scaleFactor *= this.dotScale / this.scaleFactor;
	},
	
	mouseOver : function() {
		//this.baseDot.scale(2);
		//this.scaleFactor *= 2;
		this.expanded = true;
		//this.label.visible = true;
		//animationManager.register(this, "opacity", 1, 300, "linear", function() {}, function() {});
		this.dotGlow.startPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 4, 400, "easein", function() {});
		animationManager.register(this.label.characterStyle, "fontSize", 20, 300, "linear", function() {});
		
		// Walk up the scene hierarchy and find the layer that can tell which connectors stem from this node
		var _overlord = this.overlord;
		
		if(this.overlord.getConnectorsFromTimelineEvent) {
			var connectors = this.overlord.getConnectorsFromTimelineEvent(this, true);	
			for(var i=0; i<connectors.length; i++) {
				animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 0.2, 100, "linear", function(){});
			}
		}		
	},
	mouseOut : function() {
		//this.baseDot.scale(1/this.scaleFactor);
		//this.scaleFactor /= this.scaleFactor;
		this.expanded = false;
		//this.label.visible = false;
		//animationManager.register(this, "opacity", 0.5, 600, "linear", function() {});
		this.dotGlow.stopPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 1, 300, "linear", function() {});
		animationManager.register(this.label.characterStyle, "fontSize", 5, 100, "linear", function() {});
		
		if(this.overlord.getConnectorsFromTimelineEvent) {
			var connectors = this.overlord.getConnectorsFromTimelineEvent(this, true);		
			for(var i=0; i<connectors.length; i++) {
				animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 1, 100, "linear", function(){});
			}
		}		
	}
});


var PersonalityIndicator = window.paper.Layer.extend({
	expanded : false,
	dotScale : 1,
	scaleFactor : 1,

	initialize : function(overlord, text, inner, outer, percent, angle, color) {			
		this.base();
		
		this.overlord = overlord;
		
		var size = 8;
		this.statPoint = new Point(0,-(Math.map(percent, 0, 100, inner, outer))).add(view.center);
		this.statPoint = this.statPoint.rotate(angle, view.center);
		//this.activate();
		
		var translucent = new RgbColor(color).clone(); translucent.alpha *= 0.5;
		this.dotGlow = new GlowingCircle(this.statPoint, size-1, size, translucent);
		this.addChild(this.dotGlow);
		this.dotGlow.visible = false;
						
		//this.baseDot = new Path.Circle(this.statPoint, size);
		this.baseDot = new Path.RegularPolygon(this.statPoint, 3, size*2);
		this.baseDot.rotate(angle);
		this.baseDot.fillColor = color;
		this.addChild(this.baseDot);
		
		/*
		// Text label
		this.label = new PointText(this.basePoint.add(new Point(0, -20)));
		var words = ["Day", "Ticket", "Mom", "hangover", "loud", "light", "word", "night", "dog", "vote"];
		this.label.content = words[Math.floor(Math.random()*words.length)];
		this.label.characterStyle = {
			font: "Helvetica",
			fontSize : 5,
			fillColor : 'white'
		}
		this.label.fontWeight = "bold";
		this.label.paragraphStyle.justification = 'center';
		this.label.visible = false;
		this.addChild(this.label);
		*/
		
	},
	
	update : function() {
		this.baseDot.scale(this.dotScale / this.scaleFactor);
		this.dotGlow.scale(this.dotScale / this.scaleFactor);
		//this.baseDot.scale(1);
		this.scaleFactor *= this.dotScale / this.scaleFactor;
	},
	
	mouseOver : function() {
		//this.baseDot.scale(2);
		//this.scaleFactor *= 2;
		this.expanded = true;
		//this.label.visible = true;
		//animationManager.register(this, "opacity", 1, 300, "linear", function() {}, function() {});
		this.dotGlow.startPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 2, 300, "linear", function() {});
		
		if(this.overlord.getConnectorsToPersonality) {
			var connectors = this.overlord.getConnectorsToPersonality(this,true);		
			for(var i=0; i<connectors.length; i++) {
				animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 0.2, 300, "linear", function(){});
			}
		}				
	},
	mouseOut : function() {
		//this.baseDot.scale(1/this.scaleFactor);
		//this.scaleFactor /= this.scaleFactor;
		this.expanded = false;
		//this.label.visible = false;
		//animationManager.register(this, "opacity", 0.5, 600, "linear", function() {});
		this.dotGlow.stopPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 1, 300, "linear", function() {});
		
		if(this.overlord.getConnectorsToPersonality) {
			var connectors = this.overlord.getConnectorsToPersonality(this, true);		
			for(var i=0; i<connectors.length; i++) {
				animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 1, 300, "linear", function(){});
			}
		}						
	}
});

var PersonalityConnector = function(start, end, color, strength, type) {
	var p;
	if(type == "straight") {
		p = new Path.Line(start, end);
	}
	else if(type == "bezier") {
		var dirFlag = Math.abs(end.x-start.x) > Math.abs(end.y - start.y);
		var startSeg = new Segment(start, null, [dirFlag ? (end.x-start.x)/2 : 0, dirFlag ? 0 : (end.y-start.y)/2]);
		var endSeg = new Segment(end, [dirFlag ? -(end.x-start.x)/2 : 0, dirFlag ? 0 : -(end.y-start.y)/2], null);
		p = new Path(startSeg, endSeg);
	}
	else if(type == "leaders") {
		var dirFlag = Math.abs(end.x-start.x) > Math.abs(end.y - start.y);
		var axis = dirFlag ? "x" : "y";
		var side = end[axis] > start[axis] ? 1 : -1;
		var span = Math.abs(end[axis]-start[axis]) / 4;
		if(dirFlag)
			p = new Path(start, start.add([span*side,0]), end.add([-span*side,0]), end);
		else
			p = new Path(start, start.add([0,span*side]), end.add([0,-span*side]), end);
	}
	else if(type == "45s") {
		// Like leaders, but limit angles to 45 degrees
		var dirFlag = Math.abs(end.x-start.x) > Math.abs(end.y - start.y);
		var majorAxis = dirFlag ? "x" : "y";
		var minorAxis = dirFlag ? "y" : "x";
		var side = end[majorAxis] > start[majorAxis] ? 1 : -1;
		var majorSpan = Math.abs(end[majorAxis]-start[majorAxis]);
		var minorSpan = Math.abs(end[minorAxis]-start[minorAxis]);
		if(dirFlag)
			p = new Path(start, start.add([(majorSpan-minorSpan)/2*side,0]), end.add([-(majorSpan-minorSpan)/2*side,0]), end);
		else
			p = new Path(start, start.add([0,(majorSpan-minorSpan)/2*side]), end.add([0,-(majorSpan-minorSpan)/2*side]), end);
	}	
	
	p.strokeColor = color;

	p.strokeColor.alpha = strength/100;
	//EG Playing with other thickness distributions.
	if(Math.random() < 0.1) p.strokeWidth = 1.0;
	else p.strokeWidth = 1.0; //Math.map(strength, 10, 100, 0.5, 5);	
	
	return p;
}
var BackgroundScene = window.paper.Layer.extend({
	initialize : function(userData) {
		this.base();
		
		// Sacrifice a path to the weird scale transform bug
		// Otherwise the first item that gets scaled will get messed up...
		var _sacrifice = new Path.Circle(view.center, 1);
		_sacrifice.scale(0.1);
		_sacrifice.remove();		
		
		// EGO-CENTRIC CIRCLE
		// ----------------------------------------
		var egoLayer = new Layer();
		var egoGlow = new GlowingCircle(view.center, userData.egoSize-1, 30, new RgbColor(1,1,1,1.0));
		egoGlow.glowSpeed = 2400;	//EG we can base this on the ego size...smaller/faster or bigger/faster?
		
		var egoClipLayer = new Layer();
		egoLayer.addChild(egoClipLayer);
		egoClipLayer.activate();
		
		var profile = new Raster('profile');
		profile.position = view.center;
		profile.scale(0.5 * userData.egoSize / 100);
		profile.opacity = 0.8;
		profile.scaleFactor = 1;
		profile.visible = false;
		
		var egoCircle = new Path.Circle(view.center, userData.egoSize);
		egoCircle.fillColor = "white";
		//egoCircle.clipMask = true;
		
		
		// OCTAGONAL RADAR PLOT
		// ----------------------------------------
		var octagonPlotLayer = new Layer();
		octagonPlotLayer.activate();
		var inner_octagon_radius = 100;
		var outer_octagon_radius = 250;
		/*
		var outerOctagon = new Path.RegularPolygon(view.center, 8, outer_octagon_radius)
		var innerOctagon = new Path.RegularPolygon(view.center, 8, inner_octagon_radius)
  		
		var octagonGroup = new Group([outerOctagon, innerOctagon]);
		octagonGroup.rotate(360/16);
		octagonGroup.strokeColor = 'rgb(200,200,200)';
		octagonGroup.strokeWidth = 2;
		var statLines = [];
		for(var i=0; i<8; i++) {
			statLines[i] = new Path.Line(view.center.add([0,inner_octagon_radius]),
										 view.center.add([0,outer_octagon_radius]));
			statLines[i].rotate(i/8*360, view.center);
			statLines[i].strokeColor = 'rgb(200,200,200)';
			octagonGroup.addChild(statLines[i]);
		}
		
		octagonGroup.visible = false;
		*/
		// SOCIAL ORBITS
		// ----------------------------------------
		var socialOrbitsLayer = new Layer();
		var socialOrbits = [];
		var n_orbits = 6;
		var orbit_start_radius = outer_octagon_radius + 10;
		var orbit_end_radius = outer_octagon_radius + 90;
		for(var i=0; i<n_orbits; i++) {
			var _r = Math.map(i, 0, n_orbits-1, orbit_start_radius, orbit_end_radius);
			socialOrbits[i] = new Path.Circle(view.center, _r);
			socialOrbits[i].strokeColor = i == 0 ? 'rgb(100,100,100)' : 'rgb(50,50,50)';
			socialOrbits[i].strokeWidth = i == 0 ? 2 : 1;
			socialOrbits[i].radius = _r;
		}
		
		// BORDER
		// ----------------------------------------
		var borderLayer = new Layer();
		var border_in_radius = orbit_end_radius + 30;
		var border_out_radius = border_in_radius + 20;
		var outerBorder = new Path.Circle(view.center, border_out_radius);
		var innerBorder = new Path.Circle(view.center, border_in_radius);
		outerBorder.strokeWidth = 2; innerBorder.strokeWidth = 2;
		borderLayer.strokeColor = 'rgb(100,100,100)';
		var borderGlow = new GlowingCircle(view.center, border_out_radius, 20, new RgbColor(1,1,1,0.5));
		borderGlow.glowSpeed = 2000;
		
		var borderTicks = [];
		for(var i=0; i<48; i++) {
			borderTicks[i] = new Path.Line(view.center.add([0,border_in_radius]),
										view.center.add([0,i%4==0 ? border_out_radius :
											   			  			(border_in_radius+border_out_radius)/2]));
			borderTicks[i].rotate(i/48*360, view.center);
			borderTicks[i].strokeColor = 'rgb(50,50,50)';
		}
		// TODO: Add in roman numerals
		
		var backgroundLayers = new Layer();
		backgroundLayers.addChildren([borderLayer, socialOrbitsLayer, octagonPlotLayer, egoLayer]);
		backgroundLayers.opacity = 0.5;
	
		// POPULATE PERSONALITY
		// ---------------------------------------
		octagonPlotLayer.activate();
		
		var indicatorLayer = new Layer();
		var personalityIndicators = [];
		for(var i=0; i<8; i++) {
			personalityIndicators[i] = new PersonalityIndicator(this, "Blah", inner_octagon_radius, outer_octagon_radius,
																userData.personality[i], i/8 * 360, colorScheme[i]);
		}		
		
		// POPULATE SOCIAL OBRITS
		// ---------------------------------------
		//socialOrbitsLayer.activate();
		var socialOrbitEvents = [];
		var personalityConnectors = [];		
		// First find min/max
		var _min = Number.MAX_VALUE;
		var _max = Number.MIN_VALUE;
		for(var i=0; i<userData.timelineEvents.length; i++) {
			var _t = userData.timelineEvents[i].time;
			if(_t < _min) _min = _t;
			if(_t > _max) _max = _t;
		}
		
		var connectorLayer = new Layer();
		var connectorStyle = "bezier"; // Try "leaders," "bezier," "45s" and "straight"
		for(var i=0; i<userData.timelineEvents.length; i++) {
			var _e = userData.timelineEvents[i];
			socialOrbitEvents[i] = new OrbitItem(this, "asdf", socialOrbits[0].radius, Math.map(_e.time, _min, _max, 0, 360), 3);	
			
			// CONNECT TO PERSONALITY STATS
			// ------------------------------------
			for(var j=0; j<8; j++) {
				if(_e.personality[j] > 0) {
					var _l = new PersonalityConnector(socialOrbitEvents[i].basePoint, personalityIndicators[j].statPoint, new RgbColor(colorScheme[j]), _e.personality[j], connectorStyle);
					
					_l.timelineSource = socialOrbitEvents[i];
					_l.personality = personalityIndicators[j];
					personalityConnectors.push(_l); 
				}
			}
		}
		
		connectorLayer.moveBelow(indicatorLayer);
		
		// Friends' events		
		for(var i=0; i<userData.friendEvents.length; i++) {
			var _e = userData.friendEvents[i];
			socialOrbitEvents[i] = new OrbitItem(this, "asdf", socialOrbits[_e.friend+1].radius, Math.map(_e.time, _min, _max, 0, 360), 3, 0.5);	
			
			// CONNECT TO PERSONALITY STATS
			// ------------------------------------
			for(var j=0; j<8; j++) {
				if(_e.personality[j] > 0) {
					var _l = new PersonalityConnector(socialOrbitEvents[i].basePoint, personalityIndicators[j].statPoint, new RgbColor(0.5,0.5,0.5), _e.personality[j], connectorStyle);
					
					_l.timelineSource = socialOrbitEvents[i];
					_l.personality = personalityIndicators[j];
					personalityConnectors.push(_l); 
				}
			}
		}

		
		
		
		octagonPlotLayer.moveAbove(socialOrbitsLayer);
		egoLayer.moveAbove(project.layers[project.layers.length-1]);		
		
		// Add getter/setter methods to "private" members
		this.getConnectorsFromTimelineEvent = function(ev, invert) {
			var result = [];
			for(var i=0; i<personalityConnectors.length; i++) {
				var equals = personalityConnectors[i].timelineSource == ev;
				if(invert ? !equals : equals) 	// JAVASCRIPT Y U NO XOR???!!
					result.push(personalityConnectors[i]);
			}
			return result;
		};
		
		this.getConnectorsToPersonality = function(ev, invert) {
			var result = [];
			for(var i=0; i<personalityConnectors.length; i++) {
				var equals = personalityConnectors[i].personality == ev;
				if(invert ? !equals : equals) 	// JAVASCRIPT Y U NO XOR???!!
					result.push(personalityConnectors[i]);
			}
			return result;
		};		
	}
});

var colorScheme = [
	'rgb(239,236,106)',
	'rgb(130,186,121)',
	'rgb(244,118,57)',
	'rgb(229,64,139)',
	'rgb(93,169,194)',
	'rgb(227,94,96)',	
	'rgb(202,115,169)',
	'rgb(115,202,196)'
];