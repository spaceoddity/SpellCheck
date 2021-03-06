var Orb = {
	init : function(center_x, center_y){
		//starting coordinates
		this.center_x = center_x;
		this.center_y = center_y;

		//set initial orb properties according to settings
		this.speed = ORB_SPEED;
		this.bounce_ratio = ORB_BOUNCE;
		this.separation = ORB_SEPARATION;
		this.scale = ORB_SCALE;
		this.outer_line_width = this.scale * ORB_LINE_WIDTH;
		this.font = "bold " + ORB_FONT_SIZE*this.scale+"px " + ORB_FONT;
		var cnvs = document.createElement("canvas");
		var ctx = cnvs.getContext("2d");
		ctx.font = this.font;
		this.outer_width = ctx.measureText("12345678").width;
		this.hex_points = this.calculate_hex_points();	
		
		this.rotation_counter = 0;
		
		this.underline_position = 0;
		
		//variables for movement
		this.x_dir = 1;
		this.y_dir = 1;
		
		//variables to store answers and guesses
		this.answer = "";
		this.correct_guesses = [];
		this.incorrect_guesses = [];
		
		//variables for wrong answer shake effect
		this.x_offset = 0;
		this.shaking = false;
		
		//variables for correct answer pulsate effect
		this.extra_thickness = 0;
		this.pulsating = false;
		
		//create functions that use closures
		this.shake = this.shake();
		this.pulsate = this.pulsate();

		return this;
	},
	
	calculate_hex_points : function(){
		var size = this.outer_width/2; 
 		var sides = 6;		
		var points = [];
		
		points.push([0 + size * Math.cos(0), 0 +  size *  Math.sin(0)]);          
		for (var i = 1; i < sides;i += 1) {
			points.push([0 + size * Math.cos(i * 2 * Math.PI / sides), 0 + size * Math.sin(i * 2 * Math.PI / sides)]);
		}
		return points;
	},

	pulsate : function() {
		var total = 0;
		var polarity = 1;
		var num_of_pulses = 1;
		var time = 0.3;
		var max = Math.round(this.outer_line_width*1.5);			
		var distance = num_of_pulses * max * 2;
		var speed = distance/time;
		var self = this;
		
		return function() {	
			self.pulsating = true;
			if (total >= distance) {
				total = 0;
				polarity = 1;
				self.extra_thickness = 0;
				self.pulsating = false;
				self.new_answer();
			} else {
				self.extra_thickness += (speed/TICKS*polarity);
				total += (speed/TICKS);
				if (self.extra_thickness >= max || self.extra_thickness <= 0) {
					self.extra_thickness = (self.extra_thickness > 0) ? max : 0;
					polarity *= (-1);
					total = utilities.nearestMultiple(total,max,"round");
				}
			}
		};
	},

	shake : function() {
		var total = 0;
		var polarity = 1;
		var num_of_shakes = 2;
		var time = 0.3;
		var self = this;
		
		return function(){
			var turn_point = self.outer_width/6;
			var distance = turn_point*4*num_of_shakes;
			var speed = distance/time;			
			self.shaking = true;
			
			if (total + (speed/TICKS) >= distance) {
				total = 0;
				polarity = 1;
				self.x_offset = 0;
				self.shaking = false;
			} else {		
				self.x_offset += (speed/TICKS*polarity);
				total += (speed/TICKS);
				if (self.x_offset >= turn_point || self.x_offset <= -turn_point) {
					self.x_offset = turn_point * polarity;
					polarity *= (-1);
					total = utilities.nearestMultiple(total,turn_point,"floor");
				}
			}
		};
	},
	
	draw : function(ctx, color1, color2){	
		this.draw_word(ctx,color1, this.word[0], 1);
		this.draw_word(ctx,color2, this.word[1], -1);
		if (this.pulsating || this.shaking) {
			this.draw_word(ctx,color1, this.word[1], 1);
			this.draw_word(ctx,color2, this.word[0], -1);			
		}
		this.draw_underline(ctx, color1, 1);		
		this.draw_underline(ctx, color2, -1);
		this.draw_outer_hex(ctx, color1, 1);
		this.draw_outer_hex(ctx, color2, -1);
	},	

	draw_underline : function(ctx,color,polarity){
		ctx.strokeStyle = color;		
		ctx.lineWidth = this.outer_line_width/2;
		var letter_width = ctx.measureText("m").width;
		var letter_height = ctx.measureText("m").width;		
		var word_width = ctx.measureText(this.word[0]).width;
		var word_length = this.word[0].length;
		var underline = letter_width * this.underline_position;
		
		var x = (this.center_x - word_width/2 + underline) + polarity*(this.separation/2) + this.x_offset;
		var y = this.center_y+letter_height;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x+letter_width, y);
		ctx.stroke();
	},
	
	draw_outer_hex : function(ctx, color, polarity){
		ctx.strokeStyle = color;
		ctx.lineWidth = this.outer_line_width + this.extra_thickness;
 
		var x = this.center_x + polarity*(this.separation/2) + this.x_offset; 
		var y = this.center_y;
		var rotation = this.rotation_counter * Math.PI/180;
		var points = this.hex_points;
		
		ctx.save();
		ctx.translate(x,y);
		ctx.rotate(rotation);
		ctx.beginPath();		
		ctx.moveTo(points[0][0], points[0][1]);          
		for (i=1; i<points.length; i++) {
			ctx.lineTo(points[i][0], points[i][1]);
		}		
		ctx.closePath();		
		ctx.stroke();
		ctx.restore();
	},	

	draw_word : function(ctx, color, word, polarity){	
		ctx.fillStyle = color;
		ctx.font = this.font;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		
		x = this.center_x + polarity*(this.separation/2) + this.x_offset;
		y = this.center_y;
		
		ctx.fillText(word,x,y);
	},
	
	bounce : function(axis) {
		if (axis === "x") {
			this.x_dir = this.x_dir * (-1);
		} else if (axis === "y") {
			this.y_dir = this.y_dir * (-1);
		}
	},
	
	update : function(canvas, ctx, options) {
		if (options !== undefined) {
			for (var key in options) {
				switch (key) {
					case "speed":
					case "bounce_ratio":
					case "separation":
						this[key] = options[key];
						break;						
					case "scale":
						this[key] = options[key];
						this.font = "bold " + ORB_FONT_SIZE*this.scale+"px " + ORB_FONT;
						this.outer_line_width = this.scale * ORB_LINE_WIDTH;
						this.hex_points = this.calculate_hex_points();
						break;					
				}
			}
		}
				
		this.speed_x = this.speed*this.bounce_ratio[0] * this.x_dir;
		this.speed_y = this.speed*this.bounce_ratio[1] * this.y_dir;		
		this.check_bounds(canvas);
		
		this.rotation_counter += ORB_ROTATION_SPEED/TICKS;
		if (this.rotation_counter >= 360) {
			this.rotation_counter -= 360;
		}
		
		if (this.underline_position > this.word[0].length-1) {
			this.underline_position = this.word[0].length-1;
		}
		
		this.move();
		
		if (this.shaking) {
			this.shake();
		}
		
		if (this.pulsating) {
			this.pulsate();
		}
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
	},	

	new_answer : function() {	
		var word = Word.new_word()
		
		this.answer = word[0];
		this.word = [word[1], word[2]];
	},
	
	set_xy : function(new_x, new_y) {
		this.center_x = new_x;
		this.center_y = new_y;
	},
	
	check_input : function(input) {
		//if not currently shaking or pulsating, check answers
		if (!this.shaking && !this.pulsating) {
			if (input === "up" || input === "down") {
				if ((this.answer === "spelled" && input === "up") || (this.answer === "misspelled" && input === "down")) {
					this.correct_guesses.push([this.center_x, this.center_y]);
					this.pulsate();
				} else {
					this.incorrect_guesses.push([this.center_x, this.center_y]);
					this.shake();
				}
			}	
			if (input === "right") {
				this.underline_position += 1;
				if (this.underline_position > this.word[0].length-1) {
					this.underline_position = 0;
				}			
			}
			if (input === "left") {
				this.underline_position -= 1;
				if (this.underline_position < 0) {
					this.underline_position = this.word[0].length-1;
				}
			}
		}
	},	
};

var Word = {
	new_word : function(){
		var word = this.words[utilities.randInt(0,this.words.length-1)];
		var answer;
		if (utilities.randInt(1,100) > 50) {
			answer = "spelled";
		} else {
			answer = "misspelled";
			word = this.transpose(word);
		}		
		word = this.split(word);
		return [answer, word[0], word[1]];
	},

	transpose : function(word){
		var start;
		var new_word = word;
		
		do {
			start = utilities.randInt(0,word.length-2);
		} while (word[start] === word[start+1]);
		
		new_word = utilities.replaceAt(new_word, start, word[start+1]);
		new_word = utilities.replaceAt(new_word, start+1, word[start]);
		
		return new_word;
	},
	
	split : function(word){
		var split_word;
		var pattern;
		var five = ["xooxo", "oxoox", "xoxxo", "oxxox"];
		var six = ["xooxxo", "oxxoox"];		
		var parse = function(wrd, pttrn){
			var word1 = "";
			var word2 = "";
			for (i=0; i < wrd.length; i++) {
				if (pttrn[i] === "x") {
					word1 += wrd[i];
					word2 += " ";
				} else if (pttrn[i] === "o") {
					word1 += " ";
					word2 += wrd[i];
				}
			}
			return [word1, word2];
		};
			
		if (word.length === 5) {
			pattern = five[utilities.randInt(0, five.length-1)];
			split_word = parse(word, pattern);
		} else if (word.length === 6) {
			pattern = six[utilities.randInt(0, six.length-1)];
			split_word = parse(word, pattern);
		}
		
		return split_word;
	},
	
	words : [
		"staple", "zebra",  "donkey", "shrimp", "turkey", "tiger",  "horse",  "roach",  "sailor", "monkey", "rabbit", "eagle",
		"beaver", "animal", "woman",  "skunk",  "waiter", "kitten", "shark",  "snake",  "birds",  "daisy",  "people", "bushes",
		"priest", "whale",  "lizard", "goose",  "snail",  "grass",  "child",  "actor",  "writer", "puppy",  "human",  "parrot",
		"squid",  "trees",  "doggy",  "doctor", "goats",  "sheep",  "mouse",  "rhino",  "lions",  "bears",  "farmer", "parent",
		"worms",  "ducks",  "wolves", "walrus", "insect", "beetle", "author", "judge",            "uncle",  "turtle", "frogs",
		"panda",  "moose",  "oyster", "poodle", "baker",  "lawyer", "jaguar",           "koala",  "llama",  "gopher", "clams",
		"barber", "nurse",  "gerbil", "falcon", "toads",  "cattle", "hyena",  "bobcat", "coach",  "pirate", "dancer", "hornet",
		"spider", "baboon", "badger", "coyote", "camel",  "bunny",  "police", "pillow", "table",  "towel",  "shoes",  "knife", 
		"music",  "phone",  "paper",  "couch",  "socks",  "plate",  "radio",  "clock",  "pencil", "teapot",           "napkin",
		"butter", "chair",  "candle", "hammer", "pants",  "water",  "cookie", "bottle", "truck",  "string", "spoon",
		"cream",  "staple", "school", "sphere", "jacket", "steam",  "fridge", "cycle",  "ticket", "burger", "future", "house",
		"doors",  "glove",  "bagel",  "chalk",  "cloud",  "wallet", "toilet", "silver", "pizza",  "honey",  "games",  "tomato",
	],
};