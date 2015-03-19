CalibrateMenu = game_manager.new_scene("calibrate_menu");
	
CalibrateMenu.entered = function(){
	this.get_html_elements();
	
	//create dialog object
	this.dialog = Object.create(CalibrateDialog).init();

	this.bind_events();
	this.calibrate_menu.show();
};

CalibrateMenu.obscuring = function(){
	this.calibrate_menu.hide();
};

CalibrateMenu.revealed = function(){
	this.calibrate_menu.show();
};

CalibrateMenu.exiting = function(){
	this.calibrate_menu.hide();
	this.release_events();		
};

CalibrateMenu.get_html_elements = function(){
	this.body = $('body');
	this.calibrate_menu = $("#calibrate_menu");
	this.rb_button = $("#cal_rb_button").button();
	this.pt_button = $("#cal_pt_button").button();
	this.rg_button = $("#cal_rg_button").button();
};

CalibrateMenu.bind_events = function(){
	this.body.on('keyup', function(event){
		if (event.keyCode === 27) {
			game_manager.pop_scene();
		}
	});
	this.rb_button.on('click', (function(){
		game_manager.push_scene("calibrate_dialog","rb");
	}).bind(this));
	this.pt_button.on('click', (function(){
		game_manager.push_scene("calibrate_dialog","pt");
	}).bind(this));
	this.rg_button.on('click', (function(){
		game_manager.push_scene("calibrate_dialog","rg");
	}).bind(this));
};

CalibrateMenu.release_events = function(){
	this.body.off('keyup');
	this.rb_button.off('click');
	this.pt_button.off('click');
	this.rg_button.off('click');
};



CalibrateDialog = game_manager.new_scene("calibrate_dialog");
	
CalibrateDialog.entered = function(colors){
	this.state = undefined;
	this.fg = undefined;
	this.bg = undefined;
	
	this.get_html_elements();
	this.dialog.show();
	this.set_state(colors);
	this.step_one();
};

CalibrateDialog.get_html_elements = function(){
	this.dialog = $("#cal_dialog");
	this.span = $("#calib_span");
	this.slider = $("#calib_slider").slider();
	this.button = $("#cal_button").button();
	this.canvas = $("#cal_canvas")[0];
	this.context = this.canvas.getContext('2d');
};

CalibrateDialog.set_state = function(colors){
	var states = {
		rb : {
			step1 : {
				minmax : function(){return [0,127];},
				start : function(){return 127;},
				bg : function(){return BLUE;},
				fg : function(result){return [result,result,result];},
			},
			step2 : {
				minmax : function(){return [0,255];},
				start : function(){return 255;},
				bg : function(color1){return color1;},
				fg : function(result){return [result,0,0];},
				save : function(color1, color2){BLACK=color1; RED=color2;},					
			},
		},
		pt : {
			step1 : {
				minmax : function(){return [0,255];},
				start : function(){return 255;},
				bg : function(){return GRAY;},
				fg : function(result){return [result,0,result];},
			},
			step2 : {
				minmax : function(){return [0,255];},
				start : function(){return 255;},
				bg : function(){return GRAY;},
				fg : function(result){return [0,result,result];},
				save : function(color1, color2){PURPLE = color1; TEAL=color2;},
			},
		},
		rg : {
		},
	};

	//set the state depending on which palette was chosen
	this.state = states[colors];		
};
	
CalibrateDialog.step_one = function(){
	this.span.html("&nbsp;RED&nbsp;");
	this.span.css("background","rgb(255,0,0)");

	this.slider.slider("option", {
		"min" : this.state.step1.minmax()[0],
		"max" : this.state.step1.minmax()[1],
		"value" : this.state.step1.start(),
	});	

	this.fg = this.state.step1.fg;
	this.bg = this.state.step1.bg;
	
	this.button.off("click");
	this.button.button("option", "label", "Next");
	this.button.on("click", (function(){
		this.step1_result = this.state.step1.fg(this.slider.slider("value"));
		this.step_two();
	}).bind(this));
};	

CalibrateDialog.step_two = function(){
	this.span.html("&nbsp;GREEN/BLUE&nbsp;");
	this.span.css("background","rgb(0,0,255)");

	this.slider.slider("option", {
		"min" : this.state.step2.minmax()[0],
		"max" : this.state.step2.minmax()[1],
		"value" : this.state.step2.start(),
	});

	this.bg = this.state.step2.bg;		
	this.fg = this.state.step2.fg;
		
	this.button.off("click");
	this.button.button("option", "label", "Save");
	this.button.blur();
	this.button.on("click", (function(){
		step2_result = this.state.step2.fg(this.slider.slider("value"));
		this.state.step2.save(this.step1_result, step2_result);
		this.dialog.hide();
		game_manager.pop_scene();
	}).bind(this));	
};

CalibrateDialog.draw = function(){
	var ctx = this.context;
	var canvas = this.canvas;
	
	var bg = this.bg(this.step1_result);
	var fg = this.fg(this.slider.slider("value"))
	
	ctx.fillStyle = utilities.RGB(bg);
	ctx.fillRect(0,0, canvas.width, canvas.height);		
	
	ctx.strokeStyle = utilities.RGB(fg);		
	ctx.beginPath();		
	ctx.lineWidth = "4";		
	ctx.rect(35,20,30,30);
	ctx.rect(335,20,30,30);		
	ctx.stroke();		
	
	ctx.beginPath();
	ctx.lineWidth = "6";	
	ctx.rect(95,20,30,30);
	ctx.rect(275,20,30,30);
	ctx.stroke();	

	ctx.beginPath();		
	ctx.lineWidth = "8";		
	ctx.rect(155,20,30,30);	
	ctx.rect(215,20,30,30);		
	ctx.stroke();		
};