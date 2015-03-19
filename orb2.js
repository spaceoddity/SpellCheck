orb = {};
orb.Orb = function(center_x, center_y, color1, color2){
	this.center_x = center_x;
	this.center_y = center_y;
	
	this.rotation_counter = 0;
	this.x_dir = 1;
	this.y_dir = 1;
};

orb.Orb.prototype = {	
	draw : function(ctx, color1, color2){
		this.draw_outer_hex(ctx,color1,1,0); //this last argument is for shaking
		this.draw_iris(ctx,color1,1,0);		
		this.draw_outer_hex(ctx,color2,-1,0);
		this.draw_pupil(ctx,color2,-1,0);
	},	

	draw_outer_hex : function(ctx, color, polarity, shake_offset){
		ctx.strokeStyle = color;
		
		var numberOfSides = 6;
		var rot = this.rotation_counter * Math.PI/180;
		
		ctx.beginPath();
		ctx.moveTo((this.center_x + polarity*(this.separation/2)) + this.outer_width/2 * Math.cos(0 + rot), this.center_y + this.outer_width/2 *  Math.sin(0 + rot));          
		 
		for (i = 1; i < numberOfSides;i += 1) {
			ctx.lineTo ((this.center_x + polarity*(this.separation/2)) + this.outer_width/2 * Math.cos(i * 2 * Math.PI / numberOfSides + rot ), this.center_y + this.outer_width/2 * Math.sin(i * 2 * Math.PI / numberOfSides + rot));
		}
		ctx.closePath();
		
		ctx.lineWidth = this.outer_line_width;
		ctx.stroke();			
	},	

	draw_iris : function(ctx, color, polarity, shake_offset){
		ctx.strokeStyle = color;		
		ctx.beginPath();
		ctx.arc(this.iris_x + polarity*(this.separation/2), this.iris_y, this.iris_width/2, 0, 2 * Math.PI);
		ctx.lineWidth = this.iris_line_width;
		ctx.stroke()		
	},
	
	draw_pupil : function(ctx, color, polarity, shake_offset){
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.pupil_x + polarity*(this.separation/2), this.pupil_y, this.pupil_width/2, 0, 2 * Math.PI);
		ctx.fill();		
	},
	
	bounce : function(axis) {
		if (axis === "x") {
			this.x_dir = this.x_dir * (-1);
		} else if (axis === "y") {
			this.y_dir = this.y_dir * (-1);
		}
	},
	
	update : function(canvas, speed, bounce, separation, scale) {
		this.speed_x = speed*bounce[0] * this.x_dir;
		this.speed_y = speed*bounce[1] * this.y_dir;
		this.separation = separation;
		this.outer_width = scale * ORB_WIDTH;
		this.outer_line_width = scale * ORB_LINE_WIDTH;
		this.iris_width = scale * ORB_IRIS_WIDTH;
		this.iris_line_width = scale * ORB_IRIS_LINE_WIDTH;
		this.pupil_width = scale * ORB_PUPIL_WIDTH;		
		
		this.check_bounds(canvas);
		
		this.rotation_counter += ORB_ROTATION_SPEED/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		this.move();
	},
	
	check_bounds : function(canvas) {
		var radius = ((this.outer_width/2)+this.outer_line_width/2);
		if (this.center_x + this.speed_x/TICKS + radius + this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS + radius - this.separation/2 >= canvas.width ||
			this.center_x + this.speed_x/TICKS - radius - this.separation/2  <= 0 ||
			this.center_x + this.speed_x/TICKS - radius + this.separation/2  <= 0){
				this.bounce("x");
		}
		if (this.center_y + this.speed_y/TICKS + radius >= canvas.height || this.center_y + this.speed_y/TICKS - radius <= 0) {
			this.bounce("y");
		}	
	},
	
	move : function() {
		this.center_x += this.speed_x/TICKS;
		this.center_y += this.speed_y/TICKS;
		this.iris_x += this.speed_x/TICKS;
		this.iris_y += this.speed_y/TICKS;
		this.pupil_x += this.speed_x/TICKS;
		this.pupil_y += this.speed_y/TICKS;
	},	

	set_answer : function(answer) {
		var x_offset = 0;
		var y_offset = 0;		
		
		switch (answer) {
			case "down":
				y_offset = 4;
				break;
			case "up":
				y_offset = (-4);
				break;
			case "right":
				x_offset = 4;
				break;
			case "left":
				x_offset = (-4);
				break;
		}

		this.random_iris();
		
		this.pupil_x = this.iris_x + (x_offset * this.scale);
		this.pupil_y = this.iris_y + (y_offset * this.scale);
	},

	random_iris : function() {
		this.iris_x = this.center_x + utilities.randInt((-7)*this.scale, 7*this.scale);
		this.iris_y = this.center_y + utilities.randInt((-7)*this.scale, 7*this.scale);
	},
};