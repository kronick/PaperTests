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
	circle.fadeOn = false;
	var thisGuy = this;
	circle.fade = function() {
		if(circle.faded && circle.fadeOn) {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", 1, 600, "linear", circle.fade);
		}
		else {
			animationManager.stop(circle);
			animationManager.register(circle, "opacity", .1, 600, "linear", circle.fade);
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

	initialize : function(text, radius) {			
		this.base();

		this.basePoint = new Point(0,radius).add(view.center);
		this.basePoint = this.basePoint.rotate(Math.random() * 360, view.center);
		//this.activate();
		
		this.dotGlow = new GlowingCircle(this.basePoint, 5, 6, new RgbColor(1,1,1));
		this.addChild(this.dotGlow);
						
		this.baseDot = new Path.Circle(this.basePoint, 6);
		console.log("Based dot created at: " + this.basePoint);
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
		this.label.visible = true;
		this.addChild(this.label);
		
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
		animationManager.register(this, "dotScale", 5, 300, "linear", function() {});
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

var BackgroundScene = window.paper.Layer.extend({
	initialize : function() {
		this.base();
		
		var centerLayer = new Layer();
		centerLayer.activate();
		
		var profile = new Raster('profile');
		profile.position = view.center;
		profile.scale(0.4);
		profile.opacity = 1;
		profile.scaleFactor = 1;
		
		var centerCircle = new Path.Circle(view.center, 60);
		centerCircle.strokeColor = 'rgb(251,191,205)';
		centerCircle.strokeWidth = 4;
		centerCircle.clipMask = true;
		
		centerLayer.opacity = 0.999; // Workaround to stop mask from clipping everything
		
		var outerLayer = new Layer();
		outerLayer.activate();
		
		// Use a group to style similar objects together
		var circlesGroup = new Group();
		var outerCircle = new Path.Circle(view.center, 400);
		var c1 = new Path.Circle(view.center, 380);
		var c2 = new Path.Circle(view.center, 310);
		var c3 = new Path.Circle(view.center, 260);
		var c4 = new Path.Circle(view.center, 255);
		var c5 = new Path.Circle(view.center, 250);
		
		var l1 = new Path.Line(new Point(view.center.x - 260, view.center.y), new Point(view.center.x-260, view.size.height));
		var l2 = new Path.Line(new Point(view.center.x - 255, view.center.y), new Point(view.center.x-255, view.size.height));
		var l3 = new Path.Line(new Point(view.center.x - 250, view.center.y), new Point(view.center.x-250, view.size.height));				
		
		circlesGroup.addChildren([outerCircle, c1, c2, c3, c4, c5, l1, l2, l3]);
		circlesGroup.strokeColor = 'rgb(251,191,205)';
		circlesGroup.strokeWidth = 1.5;
		outerCircle.strokeWidth = 20;	// Must set after group to override
		
		
		var linesLayer = new Layer();
		linesLayer.activate();
		for(var i=0; i<12; i++) {
			var _l = new Path.Line(view.center + new Point(0,390), view.center + new Point(0,410));
			_l.strokeColor = 'black';
			_l.strokeWidth = 5;
			_l.rotate(i/12 * 360, view.center);
		}
		
		
		var connectionsLayer = new Layer();
		connectionsLayer.activate();
		// Generate some along the inner circle and connect them randomly
		var n_points = Math.floor(Math.random() * 16 + 6);
		var n_lines = n_points * 2;
		var pointsList = [];
		for(var i=0; i<n_points; i++) {
			// Choose random orbit level
			var _d = Math.floor(Math.random() * 3) * 5;
			var _o = new OrbitItem("asdf", 250 + _d);
			pointsList.push(_o.basePoint);
			connectionsLayer.addChild(_o);
		}
	
		connectionsLayer.activate();
		for(var i=0; i<n_lines; i++) {
			var i1 = Math.floor(Math.random() * n_points);
			var i2 = Math.floor(Math.random() * n_points);
			var _l = new Path.Line(pointsList[i1], pointsList[i2]);
			//console.log(i1 + ": " + pointsList[i1] + ", " + i2 + ": " + pointsList[i2]);
			_l.strokeColor = 'rgb(251,191,205)';
			_l.opacity = 0.8;
		}
		console.log(n_points + ", " + n_lines);
		
		console.log("Moved? " + centerLayer.moveAbove(connectionsLayer));			
	}
});
function drawBackgroundScenery() {
	
}