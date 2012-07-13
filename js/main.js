var app = {};
app.models = {};
app.views = {};
app.Constants = { INTERVAL : 30 };

app.utils = {
	randomInt : function randomInt(min, max) {
	  return Math.floor(Math.random() * (max - min + 1)) + min;  
	}
};


/**
 * A body is an object that exists in a space
 */
app.models.Body = (function() {
	function Body(id) {
		var self = this;
		self.height = app.utils.randomInt(20,70);
		self.width	= self.height;
		self.xi = app.utils.randomInt(1,5);
		self.yi = app.utils.randomInt(1,6);
		self.id = id;

		self.init();
	}

	Body.prototype.init = function() {
		var self = this;
		console.log("Creating body: " + self.id);
		self.$ = $('<div/>', {
			id: self.id
		});

		self.$.css({
			width : self.width,
			height: self.height,
			border: "1px solid",
			background: "#ccc",
			position: "absolute"
		});


	}
	return Body;

})();

/**
 * A Galaxy contains objects
 */
app.models.Galaxy = (function() {

	function Galaxy(id, parent, width, height) {
		var self = this;

		//Local vars
		self.height = height;
		self.width  = width;
		self.$parent = $(parent);
		self.id = id;
		self.bodies = [];

		self.init();
	}

	Galaxy.prototype.init = function() {
		var self = this;
		
		console.log("creating new Galaxy");

		self.$ = $('<div/>', {
			id: self.id
		});

		self.$.css({
			width : self.width,
			height: self.height,
			border: "1px solid",
			margin: "1em",
			position: "relative"
		});

		self.$.appendTo(self.$parent);

		setInterval(function() { self.gravitate() }, app.Constants.INTERVAL);
	};

	Galaxy.prototype.gravitate = function() {
		var self = this;
		console.log("running gravity routine");
		for(var i = 0; i < self.bodies.length; i++) {
			var body = self.bodies[i];
			var pos = body.$.position();

			if(pos.left >= (self.width - body.$.width()) ||
				pos.left< 0) {
				body.xi = body.xi * -1;
			}

			if(pos.top >= (self.height - body.$.height()) ||
				pos.top < 0) {
				body.yi = body.yi *-1;
			}

			// DO MORE COOL STUFF HERE, like detect other objects, increase
			// speed, etc...

			body.$.css({left: pos.left + body.xi, top: pos.top + body.yi});
		}
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
	var galaxy = new app.models.Galaxy("galaxy", "#main", 640, 480);
		
	for(var i = 0; i < app.utils.randomInt(2, 10); i++) {
		var body = new app.models.Body("body-"+i);
		galaxy.addBody(body);
	}

})(window.jQuery);


