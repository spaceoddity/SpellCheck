//TODO: load sounds and images

var Load = Scene.new_scene("load");

Load.entered = function() {
	this.get_html_elements();
	this.load_menu.css("display","flex");
	this.expand();
	Scene.push_scene("main_menu");
};
	
Load.obscuring = function() {
	this.load_menu.hide();
};
	
Load.get_html_elements = function() {
	this.window = $(window);
	this.viewport = $("#viewport");
	this.load_menu = $("#loading");
};
	
Load.expand = function() {
	this.viewport.height(this.window.height());
};