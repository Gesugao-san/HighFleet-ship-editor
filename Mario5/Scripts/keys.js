/*
 * *****
 * WRITTEN BY FLORIAN RAPPL, 2012.
 * florian-rappl.de
 * mail@florian-rappl.de
 * *****
 */
 
var Input = Class.extend({
	init: function() {
		this.reset();
	},
	reset: function() {
		this.left = false;
		this.right = false;
		this.accelerate = false;
		this.up = false;
		this.down = false;
	},
	bind: function() {
	},
	unbind: function() {
	},
	accelerate : false,
	left : false,
	up : false,
	right : false,
	down : false,
});

var KeyBoard = Input.extend({
	init: function() {
		this._super();
	},
	bind: function() {
		var me = this;
		$(document).on('keydown', function(event) {	
			return me.handler(event, true);
		});
		$(document).on('keyup', function(event) {	
			return me.handler(event, false);
		});
	},
	unbind: function() {
		$(document).off('keydown');
		$(document).off('keyup');
	},
	handler: function(event, status) {
		switch(event.keyCode) {
			case 57392://CTRL on MAC
			case 17://CTRL
			case 65://A
				this.accelerate = status;
				break;
			case 40://DOWN ARROW
				this.down = status;
				break;
			case 39://RIGHT ARROW
				this.right = status;
				break;
			case 37://LEFT ARROW
				this.left = status;			
				break;
			case 38://UP ARROW
				this.up = status;
				break;
			default:
				return true;
		}
			
		event.preventDefault();
		return false;
	}
});