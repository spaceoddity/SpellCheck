var game_manager = {
	scene_stack : [],
	scenes : {},
	ticks : undefined,
};

game_manager.start = function(scene, ticks){
	//things?
	this.ticks = ticks;
	this.push_scene(scene);
	setInterval(this._update, 1000.0/this.ticks).bind(this);
	requestAnimationFrame(this._draw).bind(this);
};

game_manager.push_scene = function(scene){
	if (this.scene_stack.length > 0) {
		this.scene_stack[this.scene_stack.length-1].obscuring();
	}
	this.scene_stack.push(new this.scenes[scene]());
	this.scene_stack[this.scene_stack.length-1].entered();
};

game_manager.pop_scene = function(){
	this.scene_stack[this.scene_stack.length-1].exiting();		
	this.scene_stack.pop();
	this.scene_stack[this.scene_stack.length-1].revealed();	
};

game_manager.change_scene = function(){};

game_manager.new_scene = function(name){
	
	this.scenes[name] = function(){
		this.name = name;
		
		this.entered = function(){};
		this.obscuring = function(){};
		this.revealed = function(){};
		this.exiting = function(){};
		this.update = function(){};
		this.draw = function(){};
	};
	
	return this.scenes[name];
};

game_manager._draw = function(){};

game_manager._update = function(){
	this.scene_stack[this.scene_stack.length-1].update(this.ticks);
};



