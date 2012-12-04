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
	circle.stopState = false;
	circle.glowSpeed = 3000;
	var thisGuy = this;
	circle.fade = function() {
		if(circle.faded && circle.fadeOn) {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", 1, circle.glowSpeed, "inout", circle.fade);
		}
		else {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", circle.stopState ? 1 : .1, circle.glowSpeed, "inout", circle.fade);
		}
		
		circle.faded = !circle.faded;
	};
	circle.fade();
	
	circle.startPulse = function() {
		circle.fadeOn = true;
		circle.faded = true;
		circle.fade();
	}
	circle.stopPulse = function(stop) {
		circle.fadeOn = false;
		circle.stopState = stop;
		
	}
	
	return circle;
}

var HTMLTextItem = function(_id, _content, _position, _align,  _class) {
	// Builds an returns an extended jQuery object
	// --------------------------------------------
	// As animation features are added to the Paper.js scenegraph,
	// they will be mirrored here in jQuery to provide a common interface
	
	var el = $("<div />", {
		id : _id,
		html : _content,
		class : _class + " Positionable"
	});
	
	el.appendTo(canvasContainer);	// Defined in InjectPaper.js
	var off = {x: 0, y: 0};
	if(_align.x == "left") 		  off.x = 0;
	else if(_align.x == "right")  off.x = -el.width();
	else if(_align.x == "center") off.x = -el.width()/2;

	if(_align.y == "top") 		  	 off.y = 0;
	else if(_align.y == "baseline")  off.y = -el.height();
	else if(_align.y == "center") 	 off.y = -el.height()/2;
	el.offset({left: _position.x+off.x, top: _position.y+off.y});
	
	el.moveTo = el.offset;
	
	el.setRotationCenter = function(center) {
		el.css({transformOrigin : (center.x-el.offset().left) + 'px ' + (center.y-el.offset().top) + 'px'});
	}
	
	el.rotate = function(angle, duration) {
		if(typeof center == undefined) center = {x: 0, y: 0};
		if(typeof duration == undefined) duration = 300;
		el.transition({rotate:  "+=" + angle}, duration);
	}
	el.translate = function(_x, _y, duration) {
		// Absolute -- Moves transformOrigin with it
		el.offset({left: el.offset().left + _x, top: el.offset().top + _y});
		
		/*
		// Relative
		if(typeof duration == undefined) duration == 300;
		el.transition({x: "+="+_x, y: "+="+_y}, duration);
		*/
	}
	return el;
}

var OrbitItem = window.paper.Layer.extend({
	expanded : false,
	dotScale : 1,
	scaleFactor : 1,

	initialize : function(overlord, text, radius, angle, size, bright) {		
		if(!bright) bright = 1;
		var oldActive = project.activeLayer;		// Save state
		this.base();								// like super()
		this.overlord = overlord;					// "parent" has another meaning in Paper.js 

		this.basePoint = new Point(0,-radius).add(view.center);
		this.basePoint = this.basePoint.rotate(angle, view.center);
		//this.activate();
		
		//var _color = new RgbColor(bright, bright, bright);
		var _color = new RgbColor("#464646");
		this.dotGlow = new GlowingCircle(this.basePoint, size-1, size*1.5, new RgbColor('white'));
		this.addChild(this.dotGlow);
		this.dotGlow.visible = false;
						
		
		this.dotGroup = new Group();
		this.baseDot = new Path.Circle(this.basePoint, size);
		this.baseDot.fillColor =  _color;
		this.dotGroup.addChild(this.baseDot);
		
		// Create a random number of rings
		this.rings = [];
		var n_rings = Math.randomInt(0,3);
		for(var i=0; i<n_rings; i++) {
			var _p = this.basePoint.add([Math.randomFloat(-1,1), Math.randomFloat(-1,1)]);
			var _r = new Path.Circle(_p, size * Math.randomFloat(1.1,2.5));
			_r.strokeWidth = 0.5;
			_r.strokeColor = _color;
			
			$.extend(_r, Rotateable);
			_r.rotationSpeed = Math.randomFloat(-0.1, 0.1);
			_r.rotationCenter = this.basePoint;
			_r.startRotation();
						
			var thisthis = this;
			_r.update = function() {

			};
			
			this.dotGroup.addChild(_r);
			this.rings.push(_r);				
		}
		
		this.addChild(this.dotGroup);

		
		// Text label
		this.label = new PointText(this.basePoint.add(new Point(0, -20)));
		var words = ["&ldquo;Who drank my Dunkin?&rdquo;",
  					 "&ldquo;Lolz, I'm dumb&rdquo;",
  					 "&ldquo;I was all like, YOLO!~!!!!&rdquo;",
					];
		this.label.content = words[Math.floor(Math.random()*words.length)];
		this.label.visible = false;
		
		this.labelDiv = new HTMLTextItem("", this.label.content,
										 this.basePoint,
										 {x: "center", y: "baseline"},
										 'orbitLabel').hide();	// HTMLTextItem is an extended jQuery object
										 						// so .hide() and other jQuery methods
										 						// work on it just fine
		
		this.addChild(this.label);

		oldActive.activate();					// Restore state
	},
	
	update : function() {
		this.dotGroup.scale(this.dotScale / this.scaleFactor);
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
		//this.dotGlow.startPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 4, 400, "easein", function() {});
		animationManager.register(this.label.characterStyle, "fontSize", 20, 300, "linear", function() {});
		this.labelDiv.fadeIn(300);
		
		
		// Walk up the scene hierarchy and find the layer that can tell which connectors stem from this node
		var _overlord = this.overlord;
		
		if(this.overlord.getConnectorsFromTimelineEvent) {
			var connectors = this.overlord.getConnectorsFromTimelineEvent(this, true);	
			for(var i=0; i<connectors.length; i++) {
				//animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 0, 100, "linear", function(){});
			}
		}		
	},
	mouseOut : function() {
		//this.baseDot.scale(1/this.scaleFactor);
		//this.scaleFactor /= this.scaleFactor;
		this.expanded = false;
		//this.label.visible = false;
		//animationManager.register(this, "opacity", 0.5, 600, "linear", function() {});
		//this.dotGlow.stopPulse();
		animationManager.stop(this);
		animationManager.register(this, "dotScale", 1, 300, "linear", function() {});
		animationManager.register(this.label.characterStyle, "fontSize", 5, 100, "linear", function() {});
		this.labelDiv.fadeOut(300);
		
		if(this.overlord.getConnectorsFromTimelineEvent) {
			var connectors = this.overlord.getConnectorsFromTimelineEvent(this, true);		
			for(var i=0; i<connectors.length; i++) {
				//animationManager.stop(connectors[i]);
				animationManager.register(connectors[i], "opacity", 1, 100, "linear", function(){});
			}
		}		
	}
});


var PersonalityIndicator = window.paper.Layer.extend({
	expanded : false,
	dotScale : 1,
	scaleFactor : 1,

	initialize : function(overlord, text, inner, outer, percent, angle, color, index) {			
		this.base();
		
		$.extend(true, this, Moveable);
		$.extend(true, this, Rotateable);
		
		this.overlord = overlord;
		
		var size = 8;
		this.statPoint = new Point(0,-(Math.map(percent, 0, 100, inner, outer))).add(view.center);
		this.statPoint = this.statPoint.rotate(angle, view.center);
		

		
		//this.positionTarget = this.statPoint.clone();
		//this.translation = {x: view.center.x, y: view.center.y};
		//this.translationTarget = {x: view.center.x, y: view.center.y};
		
		/*
		NOT YET WORKING!!!!
		var thisthis = this;
		window.setTimeout(function() {animationManager.register(thisthis, "translationTarget", {x: thisthis.statPoint.x, y: thisthis.statPoint.y}, 500, "inout")}, 2000);
		*/
		
		//animationManager.register(this, "dotScale", 4, 10000, "inout");
		//this.activate();
						
		//this.baseDot = new Path.Circle(this.statPoint, size);
		var translucent = new RgbColor(1,1,1).clone(); translucent.alpha *= 1;
		this.dotGlow = new GlowingCircle(this.statPoint, size-1, size, translucent);
		this.addChild(this.dotGlow);
		//this.dotGlow.visible = false;		
		
		this.baseShape = new Path.RegularPolygon(this.statPoint, 3, size*2);
		this.baseShape.rotate(angle, this.statPoint);
		this.baseShape.fillColor = color;
		this.addChild(this.baseShape);
		
		//this.baseShape.rotation = 0;
		//this.baseShape.rotationTarget = 0;
		//this.baseShape.rotationPeriod = Math.randomInt(2000,6000);
		//this.baseShape.rotationDirection = Math.chance(0.5) ? 1 : -1;
		this.baseShape.visible = false;
		
		
		
		var _r = this.baseShape;
		$.extend(_r, Rotateable);
		_r.rotationCenter = this.statPoint;
		_r.rotationSpeed = Math.chance(0.5) ? 1 : -1 * Math.randomFloat(0.15,0.5);
		//animationManager.registerOnFrame(_r, _r.updateRotation);
		
		this.baseDot = new Path.Circle(this.statPoint, size);
		this.baseDot.fillColor = new RgbColor("#464646");
		this.addChild(this.baseDot);
		
		//console.log(outer);
		this.label = new HTMLTextItem("indicator" + index, text, view.center.add([outer, 0]), {x: "right", y: "center"}, "personalityLabel");
		this.label.setRotationCenter(view.center);
		this.label.rotate(angle, 0);
	},
	
	update : function() {
		this.scale(this.dotScale / this.scaleFactor);
		this.scaleFactor *= this.dotScale / this.scaleFactor;
		
		this.updateMotion();
	},
	
	mouseOver : function() {
		//this.baseDot.scale(2);
		//this.scaleFactor *= 2;
		this.expanded = true;
		//this.label.visible = true;
		//animationManager.register(this, "opacity", 1, 300, "linear", function() {}, function() {});
		this.dotGlow.startPulse();
		//animationManager.stop(this);
		animationManager.register(this, "dotScale", 2, 300, "inout", function() {});
		
		if(this.overlord.getConnectorsToPersonality) {
			var otherConnectors = this.overlord.getConnectorsToPersonality(this,true);		
			for(var i=0; i<otherConnectors.length; i++) {
				//animationManager.stop(otherConnectors[i]);
				animationManager.register(otherConnectors[i], "opacity", 0, 300, "inout", function(){});
			}
			
			var myConnectors = this.overlord.getConnectorsToPersonality(this,false);		
			for(var i=0; i<myConnectors.length; i++) {
				//animationManager.stop(myConnectors[i]);
				if(myConnectors[i].canFatten)
					animationManager.register(myConnectors[i], "strokeWidth", 10, 300, "inout", function(){});
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
		//animationManager.stop(this);
		animationManager.register(this, "dotScale", 1, 300, "inout", function() {});
		
		if(this.overlord.getConnectorsToPersonality) {
			var otherConnectors = this.overlord.getConnectorsToPersonality(this,true);		
			for(var i=0; i<otherConnectors.length; i++) {
				//animationManager.stop(otherConnectors[i]);
				animationManager.register(otherConnectors[i], "opacity", 1, 300, "inout", function(){});
			}
			
			var myConnectors = this.overlord.getConnectorsToPersonality(this,false);		
			for(var i=0; i<myConnectors.length; i++) {
				//animationManager.stop(myConnectors[i]);
				if(myConnectors[i].canFatten)
					animationManager.register(myConnectors[i], "strokeWidth", 1, 300, "inout", function(){});
			}	
		}						
	}
});

function segmentBuilder(start, end, type) {
	var segs = [];
	if(type == "straight") {
		segs = [start, end];
	}
	else if(type == "bezier") {
		var dirFlag = Math.abs(end.x-start.x) > Math.abs(end.y - start.y);
		var startSeg = new Segment(start, null, [dirFlag ? (end.x-start.x)/2 : 0, dirFlag ? 0 : (end.y-start.y)/2]);
		var endSeg = new Segment(end, [dirFlag ? -(end.x-start.x)/2 : 0, dirFlag ? 0 : -(end.y-start.y)/2], null);
		segs = [startSeg, endSeg];
	}
	else if(type == "leaders") {
		var dirFlag = Math.abs(end.x-start.x) > Math.abs(end.y - start.y);
		var axis = dirFlag ? "x" : "y";
		var side = end[axis] > start[axis] ? 1 : -1;
		var span = Math.abs(end[axis]-start[axis]) / 4;
		if(dirFlag)
			segs = [new Segment(start), new Segment(start.add([span*side,0])),
					new Segment(end.add([-span*side,0])), new Segment(end)];
		else
			segs = [new Segment(start), new Segment(start.add([0,span*side])),
					new Segment(end.add([0,-span*side])), new Segment(end)];
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
			segs = [new Segment(start), new Segment(start.add([(majorSpan-minorSpan)/2*side,0])),
					new Segment(end.add([-(majorSpan-minorSpan)/2*side,0])), new Segment(end)];
		else
			segs = [new Segment(start), new Segment(start.add([0,(majorSpan-minorSpan)/2*side])),
					new Segment(end.add([0,-(majorSpan-minorSpan)/2*side])), new Segment(end)];
	}	
	
	return segs;
}

var PersonalityConnector = function(start, end, color, strength, type) {
	var p;

	p = new Path(segmentBuilder(start, end, type));	
	
	p.type = type;
	p.start = start;
	p.end = end;
	p.color = color;
	p.strength = strength;	
	
	p.strokeColor = color;

	//p.strokeColor.alpha = strength/100;
	//EG Playing with other thickness distributions.
	//if(Math.random() < 0.1) p.strokeWidth = 1.0;
	//else p.strokeWidth = 1.0; //Math.map(strength, 10, 100, 0.5, 5);	
	p.strokeWidth = 1;
	p.strokeCap = 'round';
	p.canFatten = true;
	
	p.setPoints = function(newStart, newEnd) {
		var newSegs = segmentBuilder(newStart, newEnd, p.type);
		for(var i=0; i<p.segments.length; i++) {
			p.segments[i] = newSegs[i];
		}
	}
	
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
		
		/*
		var egoBgSteps = [];
		for(var i=0; i<5; i++) {	
			var _g = new Path.RegularPolygon(view.center, 4, userData.egoSize + 20*i - 20);
			_g.rotate(45);
			_g.fillColor = "#dddddd";
			_g.opacity = 0.75;
			egoBgSteps.push(_g);
		}
		*/
				
		var egoGlowBg = new GlowingCircle(view.center, userData.egoSize-1, 30, new RgbColor("#dddddd"));	
		egoGlowBg.stopPulse(true);

					
		var egoGlow = new GlowingCircle(view.center, userData.egoSize-1, 30, new RgbColor("#FFCE32"));
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
		egoCircle.fillColor = "#FFCE32";
		//egoCircle.clipMask = true;
		
		
		// OCTAGONAL RADAR PLOT
		// ----------------------------------------
		var octagonPlotLayer = new Layer();
		octagonPlotLayer.activate();
		var inner_octagon_radius = 100;
		var outer_octagon_radius = 240;
		
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
			statLines[i].strokeColor = 'rgb(0,0,0)';
			octagonGroup.addChild(statLines[i]);
		}
		
		octagonGroup.visible = true;
		*/
		
		// SOCIAL ORBITS
		// ----------------------------------------
		var socialOrbitsLayer = new Layer();
		var socialOrbits = [];
		var n_orbits = 5;
		var orbit_start_radius = outer_octagon_radius + 10;
		var orbit_end_radius = outer_octagon_radius + 50;
		for(var i=0; i<n_orbits; i++) {
			var _r = Math.map(i, 0, n_orbits-1, orbit_start_radius, orbit_end_radius);
			socialOrbits[i] = new Path.Circle(view.center, _r);
			socialOrbits[i].strokeColor = '#464646';
			socialOrbits[i].strokeWidth = i == 0 ? 2 : 1;
			socialOrbits[i].radius = _r;
		}
		
		//socialOrbits[0].fillColor = "#111";
		
		// BORDER
		// ----------------------------------------
		var borderLayer = new Layer();
		var border_in_radius = orbit_end_radius + 10;
		var border_out_radius = border_in_radius + 20;
		//var outerBorder = new Path.Circle(view.center, border_out_radius);
		//outerBorder.strokeWidth = 2; innerBorder.strokeWidth = 2;

		var borderGlow = new GlowingCircle(view.center, border_in_radius, 20, new RgbColor(1,1,1));
		borderGlow.glowSpeed = 2000;
		
		var innerBorder = new Path.Circle(view.center, border_in_radius);
		innerBorder.strokeColor = '#464646';
		innerBorder.strokeWidth = 4;
		
		var borderTicks = [];
		for(var i=0; i<12; i++) {
			borderTicks[i] = new Path.Line(view.center.add([0,border_in_radius + 10]),
										view.center.add([0,border_out_radius]));
			borderTicks[i].rotate(i/12*360, view.center);
			borderTicks[i].strokeColor = '#464646';
			borderTicks[i].strokeWidth = 2;
		}
		// TODO: Add in roman numerals
		
		var backgroundLayers = new Layer();
		backgroundLayers.addChildren([borderLayer, socialOrbitsLayer, octagonPlotLayer, egoLayer]);
		backgroundLayers.opacity = 0.5;
	
		// POPULATE PERSONALITY
		// ---------------------------------------
		octagonPlotLayer.activate();
		
		var indicatorLayer = new Layer();
		this.personalityIndicators = [];
		var catNames = ["Solecistic", "Pupil", "Stargazer", "Neurotic", "Feminine", "Blashphemer", "Doomdigger", "Extrovert"];
		for(var i=0; i<8; i++) {
			this.personalityIndicators[i] = new PersonalityIndicator(this, catNames[i], inner_octagon_radius, outer_octagon_radius,
																userData.personality[i], i/8 * 360, colorScheme[i], i);
			indicatorLayer.addChild(this.personalityIndicators[i]);		
		}		
		
		
		// ROTATE THE INNER CIRCLE
		// -----------------------------------------
		var tickStep = false;
		$.extend(indicatorLayer, Rotateable);
		indicatorLayer.rotationCenter = view.center;
		indicatorLayer.rotationSpeed = tickStep ? 0.01 : 0.001;
		var thisthis = this;
		
		animationManager.registerOnFrame(indicatorLayer, function(dT) {
			if(tickStep && new Date().getTime() % 1000 < 800) dT = 0;
			indicatorLayer.updateRotation(dT);
			for(var i=0; i<thisthis.personalityIndicators.length; i++) {
				thisthis.personalityIndicators[i].label.rotate(dT * indicatorLayer.rotationSpeed, 0);
				var connectors = thisthis.getConnectorsToPersonality(thisthis.personalityIndicators[i]);
				for(var j=0; j<connectors.length; j++) {
					connectors[j].setPoints(connectors[j].start,											thisthis.personalityIndicators[i].statPoint.rotate(indicatorLayer.rotation, view.center));
					
				}
			}
		});				
		
		
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
		var connectorStyle = "45s"; // Try "leaders," "bezier," "45s" and "straight"
		for(var i=0; i<userData.timelineEvents.length; i++) {
			var _e = userData.timelineEvents[i];
			socialOrbitEvents[i] = new OrbitItem(this, "asdf", socialOrbits[0].radius, Math.map(_e.time, _min, _max, 0, 360), 3);	
			
			// CONNECT TO PERSONALITY STATS
			// ------------------------------------
			for(var j=0; j<8; j++) {
				if(_e.personality[j] > 0) {
					var _l = new PersonalityConnector(socialOrbitEvents[i].basePoint, this.personalityIndicators[j].statPoint, new RgbColor(colorScheme[j]), _e.personality[j], connectorStyle);
					
					_l.timelineSource = socialOrbitEvents[i];
					_l.personality = this.personalityIndicators[j];
					personalityConnectors.push(_l); 
				}
			}
		}
		
		connectorLayer.moveBelow(indicatorLayer);
		
		// Friends' events		
		for(var i=0; i<userData.friendEvents.length; i++) {
			var _e = userData.friendEvents[i];
			socialOrbitEvents[i] = new OrbitItem(this, "asdf", socialOrbits[_e.friend+1].radius, Math.map(_e.time, _min, _max, 0, 360), 1.5, 0.5);	
			
			
			// CONNECT TO PERSONALITY STATS
			// ------------------------------------
			for(var j=0; j<8; j++) {
				if(_e.personality[j] > 0) {
					var _l = new PersonalityConnector(socialOrbitEvents[i].basePoint, this.personalityIndicators[j].statPoint, new RgbColor(1,1,1,0.2), _e.personality[j], connectorStyle);
					
					_l.timelineSource = socialOrbitEvents[i];
					_l.personality = this.personalityIndicators[j];
					_l.canFatten = false;
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


//Blues/greens
var colorScheme = [
	'rgb(96,131,137)',
	'rgb(114,161,181)',
	'rgb(101,130,148)',
	'rgb(129,156,149)',
	'rgb(80,112,99)',
	'rgb(80,157,214)',	
	'rgb(87,157,184)',
	'rgb(130,182,198)'
];

/*
//Orange/reds
var colorScheme = [
	'rgb(140,12,11)',
	'rgb(223,96,26)',
	'rgb(247,146,56)',
	'rgb(129,2,0)',
	'rgb(141,60,7)',
	'rgb(247,165,49)',	
	'rgb(149,76,57)',
	'rgb(200,154,120)'
];
*/

/*
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
*/
