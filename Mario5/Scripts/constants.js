﻿/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */

var AUDIOPATH  = 'Content/audio/';
var BASEPATH   = 'Content/';
var DIV        = '<div />';
var CANVAS     = '<canvas />';
var CLS_FIGURE = 'figure';
var CLS_MATTER = 'matter';
var CLS_TOOL   = 'tool';

/*
 * -------------------------------------------
 * DIRECTIONS ENUM
 * -------------------------------------------
 */
var directions = {
	none  : 0,
	left  : 1,
	up    : 2,
	right : 3,
	down  : 4
};

/*
 * -------------------------------------------
 * MARIO_STATES ENUM
 * -------------------------------------------
 */
var mario_states = {
	normal : 0,
	fire  : 1
};

/*
 * -------------------------------------------
 * GHOST_MODE ENUM
 * -------------------------------------------
 */
var ghost_mode = {
	sleep : 0,
	awake : 1
};

/*
 * -------------------------------------------
 * SIZE_STATES ENUM
 * -------------------------------------------
 */
var size_states = {
	small : 1,
	big   : 2
};

/*
* -------------------------------------------
* MUSHROOM_MODE EMUM
* -------------------------------------------
*/
var mushroom_mode = {
	mushroom: 0,
	plant: 1
};

/*
* -------------------------------------------
* DEATH_MODES ENUM
* -------------------------------------------
*/
var death_modes = {
	normal: 0,
	shell: 1
};

/*
 * -------------------------------------------
 * GROUND_BLOCKING BITFLAG-ENUM
 * -------------------------------------------
 */
var ground_blocking = {
	none   : 0,
	left   : 1,
	top    : 2,
	right  : 4,
	bottom : 8,
	all    : 15
};

/*
 * -------------------------------------------
 * IMAGES NAMESPACE
 * -------------------------------------------
 */
var images = {
	enemies : BASEPATH + 'mario-enemies.png',
	sprites : BASEPATH + 'mario-sprites.png',
	objects : BASEPATH + 'mario-objects.png',
	peach   : BASEPATH + 'mario-peach.png',
	ghost   : BASEPATH + 'mario-ghost.png'
};

/*
 * -------------------------------------------
 * CONSTANTS NAMESPACE
 * -------------------------------------------
 */
var constants = {
	interval        : 20,
	bounce          : 15,
	cooldown        : 20,
	gravity         : 2,
	start_lives     : 3,
	max_width       : 400,
	max_height      : 15,
	jumping_v       : 27,
	walking_v       : 5,
	mushroom_v      : 3,
	ballmonster_v   : 2,
	spiked_turtle_v : 1.5,
	small_turtle_v  : 3,
	big_turtle_v    : 2,
	shell_v         : 10,
	shell_wait      : 25,
	star_vx         : 4,
	star_vy         : 16,
	bullet_v        : 12,
	max_coins       : 100,
	pipeplant_count : 150,
	pipeplant_v     : 1,
	invincible      : 10800,
	invulnerable    : 1000,
	blinkfactor     : 5
};

/*
 * -------------------------------------------
 * C2U METHOD (CONSTANT TO URL)
 * -------------------------------------------
 */
var c2u = function(s) {
	return 'url(' + s + ')';
};

/*
 * -------------------------------------------
 * Q2Q METHOD (QUADER TO QUADER COLLISION CHECK)
 * -------------------------------------------
 */
var q2q = function(figure, opponent) {
	if (figure.x > opponent.x + 16)
		return false;
	else if (figure.x + 16 < opponent.x)
		return false;
	else if (figure.y + figure.state * 32 - 4 < opponent.y)
		return false;
	else if (figure.y + 4 > opponent.y + opponent.state * 32)
		return false;
	return true;
};

/*
 * -------------------------------------------
 * MATH.SIGN METHOD
 * -------------------------------------------
 */
Math.sign = function(x) {
	if (x > 0)
		return 1;
	else if (x < 0)
		return -1;
	return 0;
};

