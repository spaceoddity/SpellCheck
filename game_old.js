var game = {};

game.state_manager = {
	state_stack : [],
	push_state : function(state) {
		if (this.state_stack.length > 0) {
			this.state_stack[this.state_stack.length-1].obscuring();
		}
		this.state_stack.push(game.create_state(state));
		this.state_stack[this.state_stack.length-1].entered();
	},
	pop_state : function() {
		this.state_stack[this.state_stack.length-1].exiting();		
		this.state_stack.pop();
		this.state_stack[this.state_stack.length-1].revealed();
	}
};

game.update = function () {
	game.state_manager.state_stack[game.state_manager.state_stack.length-1].update(TICKS);
};

game.draw = function () {
		requestAnimationFrame(game.draw);	
		game.state_manager.state_stack[game.state_manager.state_stack.length-1].draw();
};

game.settings = { level		   : function(){ 
									
									var blendmode;
									var color1;
									var color2;
									var background;
									
									if (PALETTE === "purpteal") {
										blendmode = "multiply";
										color1 = utilities.RGB(PURPLE);
										color2 = utilities.RGB(TEAL);
										background = utilities.RGB(GRAY);
									} else if (PALETTE === "redblue") {
										blendmode = "screen";
										color1 = utilities.RGB(RED);
										color2 = utilities.RGB(BLUE);
										background = utilities.RGB(BLACK);
									} else if (PALETTE === "redgreen") {
										blendmode = "multiply";
										color1 = utilities.RGB(RED2);
										color2 = utilities.RGB(GREEN);
										background = utilities.RGB(ORANGE);
									}
									
									return {										
										blendmode : blendmode,
										color1 : color1,
										color2 : color2,
										background : background,
									};
								 },
};

game.create_state = function(state) {
	switch (state) {
		case "load":
			return new load.Load();
 		case "main_menu":
			return new mainmenu.MainMenu();
		case "options_menu":
			return new optionsmenu.OptionsMenu();
		case "calibrate_menu":
			return new calibratemenu.CalibrateMenu();
		case "level":
			return new level.Level(game.settings.level());
	}
};

game.start = function () {
	$.widget( "ui.minute_spinner", $.ui.spinner, {
		_format: function(value) { return value + ' min'; },
		_parse: function(value) { return parseInt(value); }
	});
	
	game.state_manager.push_state("load");
	setInterval(game.update, 1000.0 / TICKS);
	requestAnimationFrame(game.draw);	
};