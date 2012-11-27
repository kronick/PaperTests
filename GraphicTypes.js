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
	circle.glowSpeed = 600;
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

	initialize : function(text, radius, angle, size) {		
		var oldActive = project.activeLayer;		// Save state
		this.base();

		this.basePoint = new Point(0,-radius).add(view.center);
		this.basePoint = this.basePoint.rotate(angle, view.center);
		//this.activate();
		
		this.dotGlow = new GlowingCircle(this.basePoint, size-1, size, new RgbColor(1,1,1));
		this.addChild(this.dotGlow);
						
		this.baseDot = new Path.Circle(this.basePoint, size);
		this.baseDot.fillColor = 'white';
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
		animationManager.register(this, "dotScale", 2, 300, "linear", function() {});
		animationManager.register(this.label.characterStyle, "fontSize", 20, 300, "linear", function() {});
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
		animationManager.register(this.label.characterStyle, "fontSize", 5, 300, "linear", function() {});
	}
});


var PersonalityIndicator = window.paper.Layer.extend({
	expanded : false,
	dotScale : 1,
	scaleFactor : 1,

	initialize : function(text, inner, outer, percent, angle, color) {			
		this.base();

		var size = 8;
		this.statPoint = new Point(0,-(Math.map(percent, 0, 100, inner, outer))).add(view.center);
		this.statPoint = this.statPoint.rotate(angle, view.center);
		//this.activate();
		
		var translucent = new RgbColor(color).clone(); translucent.alpha *= 0.5;
		this.dotGlow = new GlowingCircle(this.statPoint, size-1, size, translucent);
		this.addChild(this.dotGlow);
						
		this.baseDot = new Path.Circle(this.statPoint, size);
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
	}
});

var PersonalityConnector = function(start, end, color, strength, type) {
	var p;
	if(type == "straight") {
		p = new Path.Line(start, end);
	}
	else if(type == "bezier") {
		var startSeg = new Segment(start, null, [(end.x-start.x)/2,0]);
		var endSeg = new Segment(end, [-(end.x-start.x)/2,0], null);
		p = new Path(startSeg, endSeg);
	}
	else if(type == "leaders") {
		var dir = end.x > start.x ? 1 : -1;
		var span = Math.abs(end.x-start.x) / 4;
		p = new Path(start, start.add([span*dir,0]), end.add([-span*dir,0]), end);
	}
	
	p.strokeColor = color;
	p.strokeColor.alpha = strength/100;
	p.strokeWidth = Math.map(strength, 10, 100, 0.5, 5);	
	
	return p;
}
var BackgroundScene = window.paper.Layer.extend({
	initialize : function(userData) {
		this.base();
		
		// EGO-CENTRIC CIRCLE
		// ----------------------------------------
		var egoLayer = new Layer();
		var egoGlow = new GlowingCircle(view.center, userData.egoSize-1, 20, new RgbColor(1,1,1,0.5));
		egoGlow.glowSpeed = 1200;
		var egoClipLayer = new Layer();
		egoLayer.addChild(egoClipLayer);
		egoClipLayer.activate();
		
		var profile = new Raster('profile');
		profile.position = view.center;
		profile.scale(0.5 * userData.egoSize / 100);
		profile.opacity = 1;
		profile.scaleFactor = 1;
		
		var egoCircle = new Path.Circle(view.center, userData.egoSize);
		egoCircle.clipMask = true;
		
		// OCTAGONAL RADAR PLOT
		// ----------------------------------------
		var octagonPlotLayer = new Layer();
		octagonPlotLayer.activate();
		var inner_octagon_radius = 100;
		var outer_octagon_radius = 250;
		var outerOctagon = new Path.RegularPolygon(view.center, 8, outer_octagon_radius)
		var innerOctagon = new Path.RegularPolygon(view.center, 8, inner_octagon_radius)		
		var octagonGroup = new Group([outerOctagon, innerOctagon]);
		octagonGroup.rotate(360/16);
		octagonGroup.strokeColor = 'white';
		octagonGroup.strokeWidth = 2;
		var statLines = [];
		for(var i=0; i<8; i++) {
			statLines[i] = new Path.Line(view.center.add([0,inner_octagon_radius]),
										 view.center.add([0,outer_octagon_radius]));
			statLines[i].rotate(i/8*360, view.center);
			statLines[i].strokeColor = '#AAA';
		}
		
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
			socialOrbits[i].strokeColor = i == 0 ? 'white' : '#AAA';
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
		borderLayer.strokeColor = 'white';
		var borderGlow = new GlowingCircle(view.center, border_out_radius, 20, new RgbColor(1,1,1,0.5));
		borderGlow.glowSpeed = 2000;
		
		var borderTicks = [];
		for(var i=0; i<48; i++) {
			borderTicks[i] = new Path.Line(view.center.add([0,border_in_radius]),
										view.center.add([0,i%4==0 ? border_out_radius :
											   			  			(border_in_radius+border_out_radius)/2]));
			borderTicks[i].rotate(i/48*360, view.center);
			borderTicks[i].strokeColor = '#AAA';
		}
		// TODO: Add in roman numerals
	
		// POPULATE PERSONALITY
		// ---------------------------------------
		octagonPlotLayer.activate();
		var personalityIndicators = [];
		for(var i=0; i<8; i++) {
			personalityIndicators[i] = new PersonalityIndicator("Blah", inner_octagon_radius, outer_octagon_radius,
																userData.personality[i], i/8 * 360, colorScheme[i]);
		}		
		// POPULATE SOCIAL OBRITS
		// ---------------------------------------
		socialOrbitsLayer.activate();
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
		
		for(var i=0; i<userData.timelineEvents.length; i++) {
			var _e = userData.timelineEvents[i];
			socialOrbitEvents[i] = new OrbitItem("asdf", socialOrbits[0].radius, Math.map(_e.time, _min, _max, 0, 360), 3);			
			
			// CONNECT TO PERSONALITY STATS
			// ------------------------------------
			var connectorStyle = "leaders"; // Try "leaders," "bezier" and "straight"
			for(var j=0; j<8; j++) {
				if(_e.personality[j] > 0) {
					var _l = new PersonalityConnector(socialOrbitEvents[i].basePoint, personalityIndicators[j].statPoint, new RgbColor(colorScheme[j]), _e.personality[j], connectorStyle);
					personalityConnectors.push(_l); 
				}
			}
		}
		
		//personalityConnectors[0].fullySelected = true;
		
		
		
		octagonPlotLayer.moveAbove(socialOrbitsLayer);
		egoLayer.moveAbove(project.layers[project.layers.length-1]);			
	}
});

var colorScheme = [
	'#ED1C24',
	'#FFF100',
	'#00A550',
	'#00ADEF',
	'#2E3092',
	'#EC008B',
	'#F7931D',	
	'#8F807C'
];