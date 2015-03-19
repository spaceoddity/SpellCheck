var game = {};

game.scene_manager = {
	scene_stack : [],
	push_scene : function(scene) {
		if (this.scene_stack.length > 0) {
			this.scene_stack[this.scene_stack.length-1].obscuring();
		}
		this.scene_stack.push(game.create_scene(scene));
		this.scene_stack[this.scene_stack.length-1].entered();
	},
	pop_scene : function() {
		this.scene_stack[this.scene_stack.length-1].exiting();		
		this.scene_stack.pop();
		this.scene_stack[this.scene_stack.length-1].revealed();
	}
};

game.update = function () {
	game.scene_manager.scene_stack[game.scene_manager.scene_stack.length-1].update(TICKS);
};

game.draw = function () {
		requestAnimationFrame(game.draw);	
		game.scene_manager.scene_stack[game.scene_manager.scene_stack.length-1].draw();
};

game.settings = {};

game.create_scene = function(scene) {
	switch (scene) {
		case "level":
			return new level.Level(game.layer);
	}
};

game.layer = {};

game.load_stuff = function() {
	game.layer.canvas = document.getElementById("myCanvas");
	game.layer.ctx = game.layer.canvas.getContext("2d");
};

game.start = function () {
	game.load_stuff();
	game.scene_manager.push_scene("level");
	setInterval(game.update, 1000.0 / TICKS);
	requestAnimationFrame(game.draw);	
};