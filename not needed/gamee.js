var THING = {
	defaults : {},
	
	storage_get : function(key) {
		var value = window.localStorage.getItem(key);
		return JSON.parse(value);
	},
	
	storage_set : function(key,value) {
		value = JSON.stringify(value);
		window.localStorage.setItem(key, value);
	},

	set_defaults : function(args){
		self = this;
		for (i in args) {
			this.defaults[i] = args[i];
			
			Object.defineProperty(this, i, {get: function () {
				self.storage_get(i);
			}});
			
			Object.defineProperty(this, i, {set: function (value) {
				self.storage_set(i,value);
			}});
		}
		this.validate_storage();
	},
	
	validate_storage : function(){
		for (i in defaults) {
			if (typeof(window.localStorage[i]) === 'undefined' || window.localStorage[i] === null) {
			window.localStorage.clear();		
				for (i in defaults) {
					storage.set(i,defaults[i]);
				}
				return;
			}
		}
	},
};

THING.set_defaults({
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
	//ORB_BOUNCE : ORB_BOUNCE_VALUES.NORMAL, //THIS DOESN'T WORK NOW
	PALETTE : "purpteal",  // purpteal, redblue, redgreen
	PURPLE : [132,0,132],
	TEAL : [0,129,129],
	RED : [255,0,0],
	BLACK : [0,0,0],
});

console.log(THING.defaults);