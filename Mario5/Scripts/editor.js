/*
 * -------------------------------------------
 * EDITOR CLASS
 * -------------------------------------------
 */
var Editor = Level.extend({
	init: function(id) {
		var me = this;
		this.world = $('#' + id);
		this.grid = false;
		this.setPosition(0, 0);
		this.world
			.slimScroll({ height : 480 })
			.droppable({
				accept: '.block',
				drop: function(event, ui) {
					var $drag = $(ui.draggable);
					var x = Math.floor((ui.offset.left + $drag.width() / 2 - me.world.offset().left + me.world.scrollLeft()) / 32);
					var y = Math.floor((ui.offset.top + $drag.height() / 2 - me.world.offset().top + me.world.scrollTop()) / 32);
					me.addItem($drag.data('name'), x, y);
				},
			});
		this.reset();
		this.undoList = [];
	},
	reset: function() {
		this._super();
		$(CANVAS).addClass('grid').appendTo(this.world);
		var data = [];

		for(var i = 100; i--; ) {
			var t = [];

			for(var j = 15; j--; )
				t.push('');

			data.push(t);
		}

		this.load({
			height: 15,
			width: 100,
			background: 1,
			id: 0,
			data: data
		});
	},
	adjustRaw: function() {
		var overlap = this.raw.width - this.raw.data.length;

		if (overlap > 0) {
			for(var i = overlap; i--; ) {
				var t = [];

				for(var j = 15; j--; )
					t.push('');

				this.raw.data.push(t);
			}
		} else if (overlap < 0)
			this.raw.data.splice(this.raw.width);

		return this.raw;
	},
	save: function() {
		return JSON.stringify(this.raw);
	},
	changeWidth: function(w) {
		this.raw.width = w;
		var data = this.adjustRaw();
		this.load(data);
	},
	setSize: function(w, h) {
		this._super(w, h);
		this.generateGrid();
	},
	setImage: function(index) {
		if (this.raw)
			this.raw.background = index;


		this._super(index);
	},
	generateGrid: function() {
		var c = $('.grid', this.world).get(0).getContext('2d');
		c.canvas.width = this.width;
		c.canvas.height = this.height;
		c.clearRect(0, 0, c.canvas.width, c.canvas.height);

		if (this.grid) {
			for(var i = 32; i < this.width; i += 32) {
				c.moveTo(i, 0);
				c.lineTo(i, 480);
			}

			for(var i = 32; i < 480; i += 32) {
				c.moveTo(0, i);
				c.lineTo(9600, i);
			}

			c.lineWidth = 0.5;
			c.strokeStyle = '#FF00FF';
			c.stroke();
		}
	},
	setItem: function(value, x, y, noUndo) {
		this.setItems([value], [x], [y], noUndo);
	},
	setItems: function(values, xs, ys, noUndo) {
		var t = [];

		for(var i = 0, n = xs.length; i < n; i++) {
			t.push({
				name: this.raw.data[xs[i]][ys[i]],
				x: xs[i],
				y: ys[i]
			});

			this.raw.data[xs[i]][ys[i]] = values[i];
		}

		if (!noUndo)
			this.pushUndoList(t);
	},
	addItem: function(name, x, y, noUndo) {
		if (x < 0 || x >= this.raw.width)
			return;

		if (name === 'mario' && this.mario) {
			var oldx = this.mario.i;
			var oldy = this.mario.j;
			this.mario.view.remove();
			this.setItems(['', 'mario'], [oldx, x], [oldy, y]);
			new (reflection[name])(32 * x, 448 - 32 * y, this);
			return;
		}

		this.removeView(x, y);
		var t = new (reflection[name])(32 * x, 448 - 32 * y, this);

		if (t.onDrop && t.onDrop(x, y))
			return;

		var names = [];
		var xarr = [];
		var yarr = [];

		if (t.width_blocks && t.height_blocks && t.master) {
			var w2 = t.width_blocks / 2;
			var h2 = t.height_blocks / 2;
			name = t.master;

			for(var xi = Math.ceil(x - w2); xi < Math.ceil(x + w2); xi++) {
				if (xi < 0 || xi >= this.raw.width)
					continue;

				for(var yi = Math.ceil(y - h2); yi < Math.ceil(y + h2); yi++) {
					names.push(name);
					xarr.push(xi);
					yarr.push(yi);
					this.removeView(xi, yi);
					new (reflection[name])(32 * xi, 448 - 32 * yi, this);
				}
			}
		} else {
			names.push(name);
			xarr.push(x);
			yarr.push(y);
		}

		this.setItems(names, xarr, yarr, noUndo);
	},
	removeItem: function(x, y, noUndo) {
		this.removeView(x, y);
		this.setItem('', x, y, noUndo);
	},
	removeView: function(x, y) {
		if (this.obstacles[x][y]) {
			this.obstacles[x][y].view.remove();
			this.obstacles[x][y] = undefined;
		} else {
			for(var i = this.figures.length; i--; ) {
				var gp = this.figures[i].getGridPosition();

				if (gp.i === x && gp.j === y) {
					this.figures[i].view.remove();
					this.figures.splice(i, 1);
				}
			}
		}
	},
	pushUndoList: function(action) {
		this.undoList.push(action);
	},
	popUndoList: function() {
		return this.undoList.pop();
	},
	undo: function() {
		if (this.undoList.length) {
			var action = this.popUndoList();

			for(var i = 0, n = action.length; i < n; i++) {
				var x = action[i].x;
				var y = action[i].y;

				if (action[i].name)
					this.addItem(action[i].name, x, y, true);
				else
					this.removeItem(x, y, true);
			}
		}
	},
	start: function() {
		//Left blank intentionally...
		//This is just to override (and disable) the parent start();
	},
	pause: function() {
		//Left blank intentionally...
		//This is just to override (and disable) the parent pause();
	},
	toggleGrid: function() {
		this.grid ? this.gridOff() : this.gridOn();
	},
	gridOn: function() {
		this.grid = true;
		this.generateGrid();
	},
	gridOff: function() {
		this.grid = false;
		this.generateGrid();
	},
	setParallax: function() {
		//Left blank intentionally...
		//This is just to override (and disable) the parent setParallax();
	},
});

/*
 * -------------------------------------------
 * TOOLBOX CLASS
 * -------------------------------------------
 */
var ToolBox = Level.extend({
	init: function(id, edit, css) {
		this.world = $('#' + id);
		this.edit = edit;
		this.setPosition(0, 0);
		this.reset();
		this.css = css || {};
		this.world.slimScroll({height: this.world.height()});
	},
	load: function(names) {
		var x = 0;
		this.obstacles = [];

		for(var ref in reflection) {
			if (!names || names.indexOf(ref) !== -1) {
				this.obstacles.push([]);
				var t = new (reflection[ref])(x, 0, this);
				t.view.addClass('block').draggable({
					stack: false,
					cursor: 'move',
					cursorAt: { top: t.height / 2, left: t.width / 2 },
					opacity: 0.8,
					distance: 0,
					appendTo: 'body',
					revert: false,
					helper: 'clone',
				}).data('name', ref).css(this.css);
				x += t.width + 2 * (t.x - x);
			}
		}
	},
	getGridHeight: function() {
		return 1;
	},
	getGridWidth: function() {
		return this.obstacles.length;
	},
	start: function() {
		//Left blank intentionally...
		//This is just to override (and disable) the parent start();
	},
	pause: function() {
		//Left blank intentionally...
		//This is just to override (and disable) the parent pause();
	},
});

/*
 * -------------------------------------------
 * TOOLBOXBASE CLASS
 * -------------------------------------------
 */
var ToolBoxBase = Base.extend({
	init: function(x, y, level) {
		this.view = $(DIV).addClass(CLS_TOOL).appendTo(level.world);
		this._super(x, y);
		this.level = level;
	},
	addToGrid: function(x, y) {
		this.level.obstacles[x / 32][14 - y / 32] = this;
	},
	onDrop: function(x, y) {
		//Do nothing here by default ...
	},
	setImage: function(img, x, y) {
		this.view.css({
			backgroundImage : img ? c2u(img) : 'none',
			backgroundPosition : '-' + (x || 0) + 'px -' + (y || 0) + 'px',
		});
		this._super(img, x, y);
	},
	setPosition: function(x, y) {
		this.view.css({
			left: x,
			bottom: y
		});
		this._super(x, y);
	},
	setSize: function(w, h) {
		this._super(w, h);
		this.view.css({
			width: w,
			height: h
		});
	},
});

/*
 * -------------------------------------------
 * SPECIALIZED TOOLBOX OBJECTS
 * -------------------------------------------
 */

var ToolBoxEraser = ToolBoxBase.extend({
	init: function(x, y, level) {
		this._super(x, y, level);
		this.view.css('border', '1px solid #000');
		this.setSize(32, 32);
	},
	onDrop: function(x, y) {
		this.level.setItem('', x, y);
		this.view.remove();
		return true;
	},
}, 'Eraser-1x1');

var ToolMulti = ToolBoxBase.extend({
	init: function(x, y, level, width_blocks, height_blocks, master) {
		this._super(x, y, level);
		this.master = master;
		this.width_blocks = width_blocks;
		this.height_blocks = height_blocks;
		this.setSize(width_blocks * 32, height_blocks * 32);
	},
	onDrop: function(x, y) {
		this.view.remove();
		return false;
	},
});

/*
 * -------------------------------------------
 * TOOLBOX MACRO OBJECTS (BASED ON ATOMIC OBJECTS)
 *
 * IMPLEMENTATIONS OF THE "TOOLMULTI" CLASS
 * -------------------------------------------
 */

var ToolMultiSoil2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 2, 2, 'soil');
		this.setImage(images.objects, 1071, 3);
	},
}, 'Soil-2x2');

var ToolMultiSoil3 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 3, 3, 'soil');
		this.setImage(images.objects, 1071, 3);
	},
}, 'Soil-3x3');

var ToolMultiSoil4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 4, 4, 'soil');
		this.setImage(images.objects, 1071, 3);
	},
}, 'Soil-4x4');

var ToolMultiGrassTop2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 2, 1, 'grass_top');
		this.setImage(images.objects, 1071, 136);
	},
}, 'Grass_Top-2x1');

var ToolMultiGrassTop4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 4, 1, 'grass_top');
		this.setImage(images.objects, 1071, 136);
	},
}, 'Grass_Top-4x1');

var ToolMultiGrassLeft2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'grass_left');
		this.setImage(images.objects, 1090, 172);
	},
}, 'Grass_Left-1x2');

var ToolMultiGrassLeft4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'grass_left');
		this.setImage(images.objects, 1090, 172);
	},
}, 'Grass_Left-1x4');

var ToolMultiGrassRight2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'grass_right');
		this.setImage(images.objects, 1125, 172);
	},
}, 'Grass_Right-1x2');

var ToolMultiGrassRight4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'grass_right');
		this.setImage(images.objects, 1125, 172);
	},
}, 'Grass_Right-1x4');

var ToolMultiSoilLeft2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'soil_left');
		this.setImage(images.objects, 1160, 172);
	},
}, 'Soil_Left-1x2');

var ToolMultiSoilLeft4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'soil_left');
		this.setImage(images.objects, 1160, 172);
	},
}, 'Soil_Left-1x4');

var ToolMultiSoilRight2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'soil_right');
		this.setImage(images.objects, 1090, 303);
	},
}, 'Soil_Right-1x2');

var ToolMultiSoilRight4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'soil_right');
		this.setImage(images.objects, 1090, 303);
	},
}, 'Soil_Right-1x4');

var ToolMultiPipeSoilLeft2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'pipe_left_soil');
		this.setImage(images.objects, 1125, 303);
	},
}, 'Pipe_Soil_Left-1x2');

var ToolMultiPipeSoilLeft4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'pipe_left_soil');
		this.setImage(images.objects, 1125, 303);
	},
}, 'Pipe_Soil_Left-1x4');

var ToolMultiPipeSoilRight2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'pipe_right_soil');
		this.setImage(images.objects, 1160, 303);
	},
}, 'Pipe_Soil_Right-1x2');

var ToolMultiPipeSoilRight4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'pipe_right_soil');
		this.setImage(images.objects, 1160, 303);
	},
}, 'Pipe_Soil_Right-1x4');

var ToolMultiPipeLeft2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'pipe_left');
		this.setImage(images.objects, 1090, 434);
	},
}, 'Pipe_Left-1x2');

var ToolMultiPipeLeft4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'pipe_left');
		this.setImage(images.objects, 1090, 434);
	},
}, 'Pipe_Left-1x4');

var ToolMultiPipeRight2 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 2, 'pipe_right');
		this.setImage(images.objects, 1125, 434);
	},
}, 'Pipe_Right-1x2');

var ToolMultiPipeRight4 = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 4, 'pipe_right');
		this.setImage(images.objects, 1125, 434);
	},
}, 'Pipe_Right-1x4');

/*
 * -------------------------------------------
 * HIGHFLEET BLOCKS
 * -------------------------------------------
 */
var bridge = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 4, 4, 'soil');
		this.setImage(images.objects, 10000, 1);
	},
}, 'bridge'); // bridge1x1

/*
 * -------------------------------------------
 * TOOLBOX OBJECTS (BASED ON REAL OBJECTS - BUT WITH DIFFERENT ICON)
 *
 * IMPLEMENTATIONS OF THE "TOOLMULTI" CLASS
 * -------------------------------------------
 */

var MultipleCoinBoxEdit = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 1, 'multiple_coinbox');
		this.setImage(images.objects, 956, 574);
	},
}, 'multiple_coinbox-1x1');

var CoinBoxEdit = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 1, 'coinbox');
		this.setImage(images.objects, 990, 574);
	},
}, 'coinbox-1x1');

var MushroomBoxEdit = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 1, 'mushroombox');
		this.setImage(images.objects, 956, 540);
	},
}, 'mushroombox-1x1');

var StarBoxEdit = ToolMulti.extend({
	init: function(x, y, level) {
		this._super(x, y, level, 1, 1, 'starbox');
		this.setImage(images.objects, 990, 540);
	},
}, 'starbox-1x1');
