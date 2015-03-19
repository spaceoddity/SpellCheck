var OptionsMenu = game_manager.new_scene("options_menu");
	
OptionsMenu.entered = function() {
	this.get_html_elements();
	this.orb = new orb.Orb((this.window.width())/2, (this.window.height())/2);
	this.orb.new_answer();
	this.show();		
	this.bind_events();
	this.update_form();
	this.expand();
	this.update_background();
	this.update_blendmode();
};

OptionsMenu.show = function() {
	this.options_menu.css("display","flex");	
};
	
OptionsMenu.exiting = function() {
	this.release_events();
	this.options_menu.hide();
};
		
OptionsMenu.update = function() {
	var bounce_ratio;
	switch(true) {
		case (this.radio_bounce_norm.prop('checked')):
			bounce_ratio = ORB_BOUNCE_VALUES.NORMAL;
			break;
		case (this.radio_bounce_horz.prop('checked')):
			bounce_ratio = ORB_BOUNCE_VALUES.HORIZONTAL;
			break;
		case (this.radio_bounce_vert.prop('checked')):
			bounce_ratio = ORB_BOUNCE_VALUES.VERTICAL;
			break;
	}		
	
	var separation = this.vergence_slider.slider("value")*ORB_SCALE_STEP;
	var speed = this.speed_spinner.spinner("value")*ORB_SPEED_STEP;
	var scale = this.size_spinner.spinner("value");
	
	this.orb.update(this.canvas, this.context, {bounce_ratio:bounce_ratio, separation:separation, speed:speed, scale:scale});
};
		
OptionsMenu.draw = function() {
	var width = this.canvas.width;
	var height = this.canvas.height;
	
	var color1;
	var color2;
	switch(true) {
		case (this.radio_palette_rb.prop('checked')):
			color1 = utilities.RGB(RED);
			color2 = utilities.RGB(BLUE);
			break;
		case (this.radio_palette_pt.prop('checked')):
			color1 = utilities.RGB(PURPLE);
			color2 = utilities.RGB(TEAL);
			break;
		case (this.radio_palette_rg.prop('checked')):
			color1 = utilities.RGB(RED2);
			color2 = utilities.RGB(GREEN);
	}		
	
	//clear
	this.context.clearRect(0,0,width,height);
	
	//draw orb
	this.orb.draw(this.context, color1, color2);
};

OptionsMenu.expand = function() {
	this.options_menu.width(this.window.width());
	this.options_menu.height(this.window.height());
	this.canvas.width = this.window.width();
	this.canvas.height = this.window.height();
};
	
OptionsMenu.update_background = function() {
	var bg_color;
	switch(true) {
		case (this.radio_palette_rb.prop('checked')):
			bg_color = BLACK;
			break;
		case (this.radio_palette_pt.prop('checked')):
			bg_color = GRAY;
			break;
		case (this.radio_palette_rg.prop('checked')):
			bg_color = ORANGE;
			break;
	}
	this.options_menu.css("background", utilities.RGB(bg_color));
};
	
OptionsMenu.update_blendmode = function() {
	var blend;
	switch(true) {
		case (this.radio_palette_rb.prop('checked')):
			blend = "screen";
			break;
		case (this.radio_palette_pt.prop('checked') || this.radio_palette_rg.prop('checked')):
			blend = "multiply";
			break;
	}
	this.context.globalCompositeOperation = blend;		
};
	
OptionsMenu.get_html_elements = function() {
	this.window = $(window);
	this.body = $('body');
	this.options_menu = $("#options_menu");
	this.canvas = $("#options_canvas")[0];
	this.context = this.canvas.getContext('2d');
	
	$("#palette_radio").buttonset();
	this.radio_palette_rb = $("#pal_rad_1");
	this.radio_palette_pt = $("#pal_rad_2");
	this.radio_palette_rg = $("#pal_rad_3");
	
	$("#bounce_radio").buttonset();
	this.radio_bounce_norm = $("#bounce_rad_1");
	this.radio_bounce_horz = $("#bounce_rad_2");
	this.radio_bounce_vert = $("#bounce_rad_3");
	
	this.time_spinner = $("#time_spinner").minute_spinner();
	this.time_spinner.minute_spinner("option", "min", 1);
	
	//THIS
	this.size_spinner = $("#size_spinner").spinner();
	this.size_spinner.spinner("option", "min", 1);
	this.size_spinner.spinner("option", "max", Math.floor( this.window.height() / (ORB_WIDTH + ORB_LINE_WIDTH/2) ) );
	
	this.speed_spinner = $("#speed_spinner").spinner();
	this.speed_spinner.spinner("option", "min", 0);

	this.vergence_slider = $("#vergence_slider").slider();
	
	this.save_button = $("#options_save").button();
	this.cancel_button = $("#options_cancel").button();
};

OptionsMenu.bind_events = function() {
	this.body.on('keyup', function(event){
		if (event.keyCode === 27) {
			game_manager.pop_scene();
		}
	});
	
	this.vergence_slider.on("slidestop", (function(){
										this.orb.set_xy(this.window.width()/2, this.window.height()/2);
										this.orb.new_answer();
												}).bind(this)); 
	this.size_spinner.spinner({stop: (function(){
										this.size_slider();
										this.orb.set_xy(this.window.width()/2, this.window.height()/2);
										this.orb.new_answer();
												}).bind(this)}); 
	this.radio_palette_rb.on("click", (function(){
										this.update_background();
										this.update_blendmode();		 
												 }).bind(this));
	this.radio_palette_pt.on("click", (function(){
										this.update_background();
										this.update_blendmode();
												 }).bind(this));
	this.radio_palette_rg.on("click", (function(){
										this.update_background();
										this.update_blendmode();
												 }).bind(this));
	this.save_button.on("click", (function(){
		this.save_form();
		game_manager.pop_scene();
	}).bind(this));
	this.cancel_button.on("click", function(){
		game_manager.pop_scene();
	});		
};
	
OptionsMenu.release_events = function() {
	this.body.off('keyup');
	this.radio_palette_rb.off("click");
	this.radio_palette_pt.off("click");
	this.radio_palette_rg.off("click");
	this.save_button.off("click");
	this.cancel_button.off("click");
};
	
OptionsMenu.size_slider = function() {
	var old_value = this.vergence_slider.slider("value");
	
	this.vergence_slider.slider("destroy");
	this.vergence_slider = $("#vergence_slider").slider();
	var max_separation = Math.floor( (this.window.width() - (ORB_WIDTH*this.size_spinner.spinner("value") + 
	     ORB_LINE_WIDTH*this.size_spinner.spinner("value")) - ORB_LINE_WIDTH*this.size_spinner.spinner("value")) / ORB_SCALE_STEP);	
	
	
	
	
	
	this.vergence_slider.slider({min: -max_separation, max: max_separation})
						.slider('pips', {first: 'pip', last: 'pip', step: max_separation})
						.slider('float', {formatLabel: function(val){ if (val<0) {
																		  return val*(-1);  
																	  } else {
																		  return val;
																	  } } } );
	if (old_value > max_separation) {
		old_value = max_separation;
	} else if (old_value < -max_separation) {
		old_value = -max_separation;
	}
	this.vergence_slider.slider("value", old_value);
};
	
OptionsMenu.update_form = function() {
	switch(PALETTE) {
		case "redblue":
			this.radio_palette_rb.prop('checked', true);
			break;
		case "purpteal":
			this.radio_palette_pt.prop('checked', true);
			break;
		case "redgreen":
			this.radio_palette_rg.prop('checked', true);
	}
	$("#palette_radio").buttonset("refresh");	

	switch(ORB_BOUNCE) {
		case ORB_BOUNCE_VALUES.NORMAL:
			this.radio_bounce_norm.prop('checked', true);
			break;
		case ORB_BOUNCE_VALUES.HORIZONTAL:
			this.radio_bounce_horz.prop('checked', true);
			break;
		case ORB_BOUNCE_VALUES.VERTICAL:
			this.radio_bounce_vert.prop('checked', true);
			break;
	}
	$("#bounce_radio").buttonset("refresh");
	
	this.time_spinner.minute_spinner("value", GAME_LENGTH);
	this.size_spinner.spinner("value", ORB_SCALE);
	this.speed_spinner.spinner("value", Math.floor(ORB_SPEED/ORB_SPEED_STEP));
	this.vergence_slider.slider("value", Math.floor(ORB_SEPARATION/ORB_SCALE_STEP));
	this.size_slider();		
};
	
OptionsMenu.save_form = function() {
	switch(true) {
		case (this.radio_palette_rb.prop('checked')):
			PALETTE = "redblue";
			break;
		case (this.radio_palette_pt.prop('checked')):
			PALETTE = "purpteal";
			break;
		case (this.radio_palette_rg.prop('checked')):
			PALETTE = "redgreen";
			break;
	}
	
	switch(true) {
		case (this.radio_bounce_norm.prop('checked')):
			ORB_BOUNCE = ORB_BOUNCE_VALUES.NORMAL;
			break;
		case (this.radio_bounce_horz.prop('checked')):
			ORB_BOUNCE = ORB_BOUNCE_VALUES.HORIZONTAL;
			break;
		case (this.radio_bounce_vert.prop('checked')):
			ORB_BOUNCE = ORB_BOUNCE_VALUES.VERTICAL;
			break;
	}
	
	ORB_SCALE = this.size_spinner.spinner("value");
	ORB_SPEED = this.speed_spinner.spinner("value")*ORB_SPEED_STEP;
	GAME_LENGTH = this.time_spinner.minute_spinner("value");
	ORB_SEPARATION = this.vergence_slider.slider("value")*ORB_SCALE_STEP;
};