var MainMenu = Scene.new_scene("main_menu");

MainMenu.entered = function() {
	this.get_html_elements();
	this.bind_events();
	this.main_menu.css("display","flex");
};
	
MainMenu.obscuring = function() {
	this.main_menu.hide();
};
	
MainMenu.revealed = function() {
	this.main_menu.show();
};
			
MainMenu.get_html_elements = function() {
	this.main_menu = $("#main_menu");
	this.start_button = $("#start_button").button();
	this.options_button = $("#options_button").button();
	this.calibrate_button = $("#calibrate_button").button();
	this.instructions_button = $("#instructions_button").button();
};

MainMenu.bind_events = function() {
	this.start_button.bind("click", function(){
		Scene.push_scene("level");			
	});
	this.options_button.bind("click", function(){
		Scene.push_scene("options_menu");
	});
	this.calibrate_button.bind("click", function(){
		Scene.push_scene("calibrate_menu");
	});
};