//TODO: create a variable to store all the globals, like g.TICKS, g.GRAY
//TODO: local storage
//TODO: defaults
var i = 0;

var TICKS = 40;
var GRAY = [127,127,127];
var BLUE = [0,0,255];
var ORB_FONT_SIZE = 8;
var ORB_FONT = "monaco, Lucida Console, monospace";
var ORB_WIDTH = 50;
var ORB_LINE_WIDTH = 2;
var ORB_IRIS_WIDTH = 20;
var ORB_IRIS_LINE_WIDTH = 3;
var ORB_PUPIL_WIDTH = 4;
var ORB_SPEED_STEP = 20;
var ORB_SCALE_STEP = 15;
var ORB_ROTATION_SPEED = 90; //degrees per second
var ORB_BOUNCE_VALUES = {NORMAL: [1,1], HORIZONTAL: [1,0.1], VERTICAL: [0.1,1]};
var HEX_CORRECT_COLOR = "darkgreen";
var HEX_INCORRECT_COLOR = "darkred";

var RED2 = [255,0,0];
var ORANGE = [255,127,0];
var GREEN = [0,127,0];

var GAME_LENGTH = 1; //minutes
var ORB_SEPARATION = 0;
var ORB_SCALE = 7;
var ORB_SPEED = 0; //pixels per second
var ORB_BOUNCE = ORB_BOUNCE_VALUES.NORMAL;
var PALETTE = "purpteal";  // purpteal, redblue, redgreen
var PURPLE = [132,0,132];
var TEAL = [0,129,129];
var RED = [255,0,0];
var BLACK = [0,0,0];


var utilities = {};

utilities.randInt = function (min,max) {
	return Math.floor(Math.random()*(max-min+1)+min);
};

utilities.nearestMultiple = function(number, multiple, method) {
    switch (method) {
		case "floor":
			return Math.floor(number/multiple)*multiple;
		case "ceil":
			return Math.ceil(number/multiple)*multiple;
		case "round":
			return Math.round(number/multiple)*multiple;
	}
};

utilities.RGB = function (color) {
	return "rgb("+color[0]+","+color[1]+","+color[2]+")";
};