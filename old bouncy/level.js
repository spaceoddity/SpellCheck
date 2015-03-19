var TICKS = 60;

var randInt = function (min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

var level = {};

level.Level = function(layer) {
	this.canvas = layer.canvas;
	this.ctx = layer.ctx;
	
	this.speed = 300;
	this.r = 120;    
	this.x = 300;
    this.y = 300;
	this.xyratio = [0.1, 1];
	this.color = "rgb(0,50,50)";
	this.rand_bounce = true;
}

level.Level.prototype = {

	entered : function() {
		this.canvas.width = document.documentElement.clientWidth - 20;
		this.canvas.height = document.documentElement.clientHeight - 20;
		
		this.bouncer = new level.Bouncer(this.r, [this.x,this.y], this.speed, this.xyratio, this.color, this.rand_bounce)
	},

	obscuring : function() {},

	revealed : function() {},

	exiting : function() {},

	update : function() {
		this.bouncer.update(this.canvas);
	},
	
	draw : function() {
		this.clear();
		this.bouncer.draw(this.ctx);
	},
	
	clear : function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
}

level.Bouncer = function(radius, xy, speed, xyratio, color, rand_bounce) {
	this.r = radius;
	this.x = xy[0];
	this.y = xy[1];
	this.speed = speed;
	this.speed_x = speed*xyratio[0];
	this.speed_y = speed*xyratio[1];
	this.color = color;
	this.rand_bounce = rand_bounce;
};

level.Bouncer.prototype = {

	draw : function(ctx) {
		this.circle(ctx);
		this.square(ctx);
	},

	circle : function(ctx) {
		ctx.beginPath();
		ctx.arc(Math.round(this.x), Math.round(this.y), this.r, 0, Math.PI*2, true);
		ctx.fillStyle = this.color;
		ctx.fill();
	},	
	
	square : function(ctx) {
		var side = (this.r*2/Math.sqrt(2))*0.5;
		var x = this.x - side/2;
		var y = this.y - side/2;
		ctx.fillStyle = "rgb(200,0,200)";
		ctx.fillRect(x,y,side,side);
	},
	
	bounce : function(axis) {
		if (axis === "x") {
			this.speed_x = -this.speed_x;
		} else if (axis === "y") {
			this.speed_y = -this.speed_y;
		}		
	},
	
	random_bounce : function(axis) {
		if (axis === "x") {
			this.speed_x = (this.speed_x > 0) ? -this.speed : this.speed;
			this.speed_y = (Math.random >= 0.5) ? -Math.random()*this.speed : Math.random()*this.speed;
		} else if (axis === "y") {
			this.speed_x = (Math.random() >= 0.5) ? -Math.random()*this.speed : Math.random()*this.speed;			
			this.speed_y = (this.speed_y > 0) ? -this.speed : this.speed;		
		}	
	},
	
	update : function(canvas) {
		this.check_bounds(canvas);
		this.move();
	},

	check_bounds : function(canvas) {
		if (this.x + this.speed_x/TICKS + this.r  >= canvas.width || this.x + this.speed_x/TICKS - this.r  <= 0 ) {
			if (this.rand_bounce) {
				this.random_bounce("x");
			} else {
				this.bounce("x");
			}
		}
		if (this.y + this.speed_y/TICKS + this.r >= canvas.height || this.y + this.speed_y/TICKS - this.r <= 0) {
			if (this.rand_bounce) {
				this.random_bounce("y");
			} else {
				this.bounce("y");
			}
		}	
	},
	
	move : function() {
		this.x += this.speed_x/TICKS;
		this.y += this.speed_y/TICKS;	
	},

};