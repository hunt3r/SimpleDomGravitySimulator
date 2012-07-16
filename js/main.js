var app = {};
app.models = {};
app.views = {};
app.Constants = { 
	INTERVAL : 120,
	GALAXY : {
		WIDTH : 640,
		HEIGHT : 480
	},
	ELEMENTS : [ 
		{
			DENSITY : 11.34,
			COLOR : "#CA226B",
			LABEL : "Lead"
		},
		{
			DENSITY : 7.874,
			COLOR : "#3B9C9C",
			LABEL : "Iron"
		},
		{
			WOOD : 2.8,
			COLOR : "#ADDFFF",
			LABEL : "Aluminum"
		}
	]
};

app.utils = {
	randomInt : function randomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;  
	},
	nullToDefault : function nullToDefault(value, defaultVal) {
		return (value) ? value : defaultVal;
	}
};


/**
 * A body is an object that exists in a space
 */
app.models.Body = (function() {
	function Body(id, _properties) {
		var self = this;
		self.$ = null;
		self.id = id;
		var height = app.utils.randomInt(20,70);
		var width  = height;
		var xi = app.utils.randomInt(1,20);
		var yi = app.utils.randomInt(1,30);
		
		var properties = _properties;

		console.log(properties.LABEL);
		// Privileged getter/setters
		self.setXi = function setXi(_x) { xi = app.utils.nullToDefault(_x, 1); }; 
		self.getXi = function getXi() { return xi; };
		self.setYi = function setYi(_y) { yi = app.utils.nullToDefault(_y, 1); }; 
		self.getYi = function getYi() { return yi; };

		self.getHeight = function getHeight() { return height; };
		self.getWidth  = function getWidth()  { return width; };
		self.setHeight = function setHeight(_height) { height = app.utils.nullToDefault(_height, 1); };
		self.setWidth  = function setWidth(_width)  { width = app.utils.nullToDefault(_width, 1); };
		self.getProperties = function getProperties() { return properties; };
		self.getMomentum = function getMomentum() {
			return (Math.abs(self.getXi()) + math.abs(self.getYi())) * self.getProperties.DENSITY; 
		}
		//Init the dom element and set the jQuery object
		self.initDOM();

		//Privileged getter/setters for operating on DOM element
		self.setTop	   = function setTop(_top) { self.$.css({top: _top}); };
		self.setLeft   = function setLeft(_left) { self.$.css({left: _left}); };
		self.getPosition = function getPosition() { return self.$.position(); };

		self.bindEvents();
	}
	

	Body.prototype.reflect = function() {
		var self = this;
		
		self.setXi(self.getXi() * -1);
		self.setYi(self.getYi() * -1);
		
	};

	Body.prototype.bindEvents = function() {
		var self = this;
		console.log("Binding events on: " + self.id);

		//Move yourself on command!
		$(app).bind("MOVE", function(e) { 
			self.move()
		});

		self.$.bind("COLLISSION", function(e) {
			self.reflect();
		});

	};

	Body.prototype.move = function() {
		var self = this;

		self.$.css({
				left: self.getPosition().left + self.getXi(), 
				top: self.getPosition().top + self.getYi()
		});

	};

	Body.prototype.initDOM = function initDOM() {
		var self = this;
		console.log("Creating body: " + self.id);
		self.$ = $('<div/>', {
			id: self.id
		});

		self.$.css({
			width : self.getWidth(),
			height: self.getHeight(),
			border: "1px solid",
			background: self.getProperties().COLOR,
			position: "absolute"
		});

		self.$.text(self.id);


	};


	
	return Body;

})();

/**
 * A Galaxy contains objects
 */
app.models.Galaxy = (function() {

	function Galaxy(id, parent, _width, _height) {
		var self = this;
		self.id = id;
		self.bodies = [];

		//Member vars
		height = _height;
		width  = _width;
		self.$parent = $(parent);

		self.getHeight = function getHeight() { return height; };
		self.getWidth  = function getWidth()  { return width; };
		
		self.initDOM();

		//The main heartbeat of the applicaiton
		setInterval(function() { self.gravitate() }, app.Constants.INTERVAL);
	}

	Galaxy.prototype.initDOM = function initDOM() {
		var self = this;
		
		console.log("creating new Galaxy");

		self.$ = $('<div/>', {
			id: self.id
		});

		self.$.css({
			width : self.getWidth(),
			height: self.getHeight(),
			border: "1px solid",
			margin: "1em",
			position: "relative"
		});

		self.$.appendTo(self.$parent);

		
	};

	/**
	 * This function will check for a collission 
	 **/
	Galaxy.prototype.checkCollisions = function(target) {
		var self = this;
		var intersectors = [];

		var $target = target.$;
	    var tAxis = $target.offset();
	    var t_x = [tAxis.left, tAxis.left + $target.outerWidth() + Math.abs(target.getXi())];
	    var t_y = [tAxis.top, tAxis.top + $target.outerHeight() + Math.abs(target.getYi())];

		$.each(self.bodies, function() {
          var body = this;
          var thisPos = body.$.offset();
          var i_x = [thisPos.left, thisPos.left + body.$.outerWidth() + Math.abs(target.getXi())]
          var i_y = [thisPos.top, thisPos.top + body.$.outerHeight() + Math.abs(target.getYi())];

          if ( t_x[0] < i_x[1] && t_x[1] > i_x[0] &&
               t_y[0] < i_y[1] && t_y[1] > i_y[0]) {

          	intersectors.push(body);
          	

          }

    	});

    	$.each(intersectors, function() {
    		var body = this;
          	if(body.getXi() > 0 && target.getXi() < 0 || 
          		body.getXi() < 0 && target.getXi() > 0 ||
          		body.getYi() > 0 && target.getYi() < 0 ||
          		body.getYi() < 0 && target.getYi() > 0) {
       
    			body.$.trigger("COLLISSION");
    		}
    	});

	};

	Galaxy.prototype.checkBoundaries = function() {
		var self = this;
		$.each(self.bodies, function() {
			var body = this;
			if(body.getPosition().left >= (self.getWidth() - body.getWidth() - body.getXi()) 
				|| body.getPosition().left + body.getXi() < 0) {
				body.setXi(body.getXi() * -1);
				//body.setXi(body.getXi() + (body.getYi() > 0) ? 1 : -1);
			}

			if(body.getPosition().top >= (self.getHeight() - body.getHeight() - body.getYi()) 
				|| body.getPosition().top + body.getYi() < 0) {
				body.setYi(body.getYi() * -1);
				//body.setYi(body.getYi() + (body.getYi() > 0) ? 1 : -1);
			}
			self.checkCollisions(body);
		});

	};

	Galaxy.prototype.gravitate = function() {
		var self = this;
		self.checkBoundaries();
		

		//Publish to all observers to move themselves
		$(app).trigger("MOVE");
	};

	/**
	 * Adds a body object to a Galaxy
	 */
	Galaxy.prototype.addBody = function(body) {
		var self = this;
		self.$.append(body.$);
		self.bodies.push(body);
	}

	return Galaxy;
})();

(function($) {
	//Create the Galaxy
	var galaxy = new app.models.Galaxy("galaxy", 
		"#main", 
		app.Constants.GALAXY.WIDTH, 
		app.Constants.GALAXY.HEIGHT);
	
	//Add some random amount of bodies here
	for(var i = 0; i < app.utils.randomInt(2, 10); i++) {
		var body = new app.models.Body("b"+i, 
			app.Constants.ELEMENTS[app.utils.randomInt(0, 2)]);

		body.setTop(app.Constants.GALAXY.HEIGHT/1.5);
		body.setLeft(app.Constants.GALAXY.WIDTH/2);
		
		galaxy.addBody(body);
	}

})(window.jQuery);


