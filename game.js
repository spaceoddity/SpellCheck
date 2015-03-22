Game = {};

//Load Scene------------------------------------------------------------------------
Game.Load = Scene.new_scene("load");

Game.Load.entered = function() {
		this.get_html_elements();
		this.load_menu.css("display","flex");
		this.expand();
		Scene.push_scene("main_menu");
};
		
Game.Load.obscuring = function() {
	this.load_menu.hide();
};
	
Game.Load.get_html_elements = function() {
	this.window = $(window);
	this.viewport = $("#viewport");
	this.load_menu = $("#loading");
};
	
Game.Load.expand = function() {
	this.viewport.height(this.window.height());
};
//TODO: load sounds and images
//----------------------------------------------------------------------------------	


//Level Scene------------------------------------------------------------------------
Game.Level = Scene.new_scene("level");

Game.Level.entered = function(){	
	this.elapsed = 0;
	
	this.determine_palette();
	this.get_html_elements();
	this.expand();
	this.context.globalCompositeOperation = this.blendmode;
	this.level.css("display","flex");
	this.orb = Object.create(Orb).init(this.window.width()/2, this.window.height()/2);
	this.orb.new_answer();
	this.add_listeners();
};

Game.Level.obscuring = function(){
	this.remove_listners();
};

Game.Level.revealed = function(){
	this.add_listeners();
};

Game.Level.exiting = function(){
	this.remove_listners();
	this.level.hide();
};	

Game.Level.update = function() {
	if (this.pause.is(":hidden")) {
		this.orb.update(this.canvas, this.context);
		this.update_countdown();
	}
};

Game.Level.draw = function() {
	//clear canvas
	var width = this.canvas.width;
	var height = this.canvas.height;
	this.context.clearRect(0,0,width,height);
	
	//draw orb
	this.orb.draw(this.context, this.color1, this.color2);
};

Game.Level.determine_palette = function(){
	if (S.PALETTE === "purpteal") {
		this.blendmode = "multiply";
		this.color1 = utilities.RGB(S.PURPLE);
		this.color2 = utilities.RGB(S.TEAL);
		this.background = utilities.RGB(S.GRAY);
	} else if (S.PALETTE === "redblue") {
		this.blendmode = "screen";
		this.color1 = utilities.RGB(S.RED);
		this.color2 = utilities.RGB(S.BLUE);
		this.background = utilities.RGB(S.BLACK);
	} else if (S.PALETTE === "redgreen") {
		this.blendmode = "multiply";
		this.color1 = utilities.RGB(S.RED2);
		this.color2 = utilities.RGB(S.GREEN);
		this.background = utilities.RGB(S.ORANGE);
	}	
};

Game.Level.get_html_elements = function(){
	this.window = $(window);
	this.body = $('body');
	this.level = $("#level");
	this.level.css("background", this.background);
	this.canvas = $("#canvas")[0];
	this.context = this.canvas.getContext('2d');
	this.countdown = $("#countdown");
	this.pause = $("#pause")
	$("#pause_tabs").tabs();
	this.hits_graph = $("#hits_graph");
	this.misses_graph = $("#misses_graph");
	this.resume_button = $("#resume_button").button().button("enable");
	this.quit_button = $("#quit_button").button();	
};

Game.Level.expand = function(){
	this.level.width(this.window.width());
	this.level.height(this.window.height());		
	this.canvas.width = this.window.width();
	this.canvas.height = this.window.height();	
};

Game.Level.add_listeners = function(){
	this.body.on('keyup', (function(event){
		var input = "";
		switch(event.keyCode) {
			case 37:
				input = "left";
				break;
			case 38:
				input = "up";
				break;
			case 39:
				input = "right";
				break;
			case 40:
				input = "down";
				break;
		};
		if (input.length > 0) {
			this.orb.check_input(input);
		}
		if (event.keyCode === 27) {
			this.pause.toggle();
			if (this.pause.is(":visible")) {
				this.update_pause();
			}
		}
	}).bind(this));
	
	this.resume_button.on("click", (function(){
		this.pause.toggle();
	}).bind(this));
	
	this.quit_button.on("click", (function(){
		this.pause.toggle();
		Scene.pop_scene();
	}).bind(this));
};

Game.Level.remove_listners = function(){
	this.body.off('keyup');
	this.resume_button.off("click");
	this.quit_button.off("click");
};

Game.Level.update_countdown = function(){		
	this.elapsed += 1;
	var remaining = (S.GAME_LENGTH*60) - (this.elapsed/S.TICKS);
	var minutes = Math.floor(remaining/60);
	var seconds = Math.floor(remaining%60);
	this.countdown.html(minutes + ":" + ("0"+seconds).slice(-2));		
	
	if (this.elapsed/S.TICKS >= S.GAME_LENGTH*60) {
		this.update_pause();
		this.pause.show();
		this.resume_button.button("disable");
		this.body.off('keyup');
	}
};
	
Game.Level.update_pause = function(){
	//destroy old hex graph
	this.hits_graph.empty();
	this.misses_graph.empty();
	
	//create new correct hex graph
	this.create_hex_graph(S.HEX_CORRECT_COLOR,"#hits_graph", this.orb.correct_guesses);
	
	//create new incorrect hex graph
	this.create_hex_graph(S.HEX_INCORRECT_COLOR,"#misses_graph", this.orb.incorrect_guesses);
};

Game.Level.create_hex_graph = function(color, id, data){
	//use d3 to create hexbin
	var graph_width = this.window.width()*0.65;
	var graph_height = this.window.height()*0.65;
	
	var data_width = this.window.width();
	var data_height = this.window.height();

	var x = d3.scale.linear()
		.domain([0, data_width])
		.range([0, graph_width]);

	var y = d3.scale.linear()
		.domain([0, data_height])
		.range([0, graph_height]);		

	var points = data.map(function(xy){
		return [x(xy[0]),y(xy[1])];
	});

	var color = d3.scale.linear()
		.domain([0, 3])
		.range(["white", color])
		.interpolate(d3.interpolateLab);

	var hexbin = d3.hexbin()
		.size([graph_width, graph_height])
		.radius(25);

	var svg = d3.select(id).append("svg")
		.attr("width", graph_width)
		.attr("height", graph_height)
	  .append("g");

	svg.append("clipPath")
		.attr("id", "clip")
	  .append("rect")
		.attr("class", "mesh")
		.attr("width", graph_width)
		.attr("height", graph_height);
		
	svg.append("g")
		.attr("clip-path", "url(#clip)")
	  .selectAll(".hexagon")
		.data(hexbin(points))
	  .enter().append("path")
		.attr("class", "hexagon")
		.attr("d", hexbin.hexagon())
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.style("fill", function(d) { return color(d.length); });

	svg.append("svg:path")
		.attr("clip-path", "url(#clip)")
		.attr("d",hexbin.mesh())
		.style("stroke-width", 0.1)
		.style("stroke", "gray")
		.style("fill", "none");			
};
//TODO: add other page of pause menu
//TODO: make hexes proportional to canvas
//TODO: comment all of the code
//----------------------------------------------------------------------------------
	

Game.set_custom_widgets = function(){
	$.widget( "ui.minute_spinner", $.ui.spinner, {
		_format: function(value) { return value + ' min'; },
		_parse: function(value) { return parseInt(value); }
	});			
};

Game.set_default_values = function(){
	S.set_defaults({
		TICKS : 75,
		GRAY : [127,127,127],
		BLUE : [0,0,255],
		ORB_FONT_SIZE : 8,
		ORB_FONT : "monaco, Lucida Console, monospace",
		ORB_WIDTH : 50,
		ORB_LINE_WIDTH : 2,
		ORB_IRIS_WIDTH : 20,
		ORB_IRIS_LINE_WIDTH : 3,
		ORB_PUPIL_WIDTH : 4,
		ORB_SPEED_STEP : 20,
		ORB_SCALE_STEP : 15,
		ORB_ROTATION_SPEED : 45, //degrees per second
		ORB_BOUNCE_VALUES : {NORMAL: [1,1], HORIZONTAL: [1,0.1], VERTICAL: [0.1,1]},
		HEX_CORRECT_COLOR : "darkgreen",
		HEX_INCORRECT_COLOR : "darkred",

		RED2 : [255,0,0],
		ORANGE : [255,127,0],
		GREEN : [0,127,0],

		GAME_LENGTH : 1, //minutes
		ORB_SEPARATION : 0,
		ORB_SCALE : 7,
		ORB_SPEED : 0, //pixels per second
		PALETTE : "purpteal",  // purpteal, redblue, redgreen
		PURPLE : [132,0,132],
		TEAL : [0,129,129],
		RED : [255,0,0],
		BLACK : [0,0,0],	
	});
	
	S.set_defaults({ORB_BOUNCE : S.ORB_BOUNCE_VALUES.NORMAL});	
};

Game.start = function(){
	this.set_custom_widgets();
	this.set_default_values();
	Scene.start("load",S.TICKS);
};