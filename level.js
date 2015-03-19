var Level = game_manager.new_scene("level");

Level.entered = function(){	
	this.elapsed = 0;
	
	this.determine_palette();
	this.get_html_elements();
	this.expand();
	this.context.globalCompositeOperation = this.blendmode;
	this.level.css("display","flex");
	this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2);						   
	this.orb.new_answer();
	this.add_listeners();
};

Level.obscuring = function(){
	this.remove_listners();
};

Level.revealed = function(){
	this.add_listeners();
};

Level.exiting = function(){
	this.remove_listners();
	this.level.hide();
};	

Level.update = function() {
	if (this.pause.is(":hidden")) {
		this.orb.update(this.canvas, this.context);
		this.update_countdown();
	}
};

Level.draw = function() {
	//clear canvas
	var width = this.canvas.width;
	var height = this.canvas.height;
	this.context.clearRect(0,0,width,height);
	
	//draw orb
	this.orb.draw(this.context, this.color1, this.color2);
};

Level.determine_palette = function(){
	if (PALETTE === "purpteal") {
		this.blendmode = "multiply";
		this.color1 = utilities.RGB(PURPLE);
		this.color2 = utilities.RGB(TEAL);
		this.background = utilities.RGB(GRAY);
	} else if (PALETTE === "redblue") {
		this.blendmode = "screen";
		this.color1 = utilities.RGB(RED);
		this.color2 = utilities.RGB(BLUE);
		this.background = utilities.RGB(BLACK);
	} else if (PALETTE === "redgreen") {
		this.blendmode = "multiply";
		this.color1 = utilities.RGB(RED2);
		this.color2 = utilities.RGB(GREEN);
		this.background = utilities.RGB(ORANGE);
	}	
};

Level.get_html_elements = function(){
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

Level.expand = function(){
	this.level.width(this.window.width());
	this.level.height(this.window.height());		
	this.canvas.width = this.window.width();
	this.canvas.height = this.window.height();	
};

Level.add_listeners = function(){
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
		game_manager.pop_scene();
	}).bind(this));
};

Level.remove_listners = function(){
	this.body.off('keyup');
	this.resume_button.off("click");
	this.quit_button.off("click");
};

Level.update_countdown = function(){		
	this.elapsed += 1;
	var remaining = (GAME_LENGTH*60) - (this.elapsed/TICKS);
	var minutes = Math.floor(remaining/60);
	var seconds = Math.floor(remaining%60);
	this.countdown.html(minutes + ":" + ("0"+seconds).slice(-2));		
	
	if (this.elapsed/TICKS >= GAME_LENGTH*60) {
		this.update_pause();
		this.pause.show();
		this.resume_button.button("disable");
		this.body.off('keyup');
	}
};
	
Level.update_pause = function(){
	//destroy old hex graph
	this.hits_graph.empty();
	this.misses_graph.empty();
	
	//create new correct hex graph
	this.create_hex_graph(HEX_CORRECT_COLOR,"#hits_graph", this.orb.correct_guesses);
	
	//create new incorrect hex graph
	this.create_hex_graph(HEX_INCORRECT_COLOR,"#misses_graph", this.orb.incorrect_guesses);
};

Level.create_hex_graph = function(color, id, data){
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