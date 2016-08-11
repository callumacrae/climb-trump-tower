var doc = d3.select('html');
var svg = d3.select('svg');


var floors = 68;
var windowSize = 44;
var windowOffset = 10;

var towerHeight = floors * (windowSize + windowOffset) + windowOffset;

var tower = svg.append('g')
	.attr('transform', 'translate(0, -' + (towerHeight - 660) + ')');

tower.append('rect')
	.attr('width', 390)
	.attr('height', towerHeight)
	.attr('x', 50)
	.attr('y', 100)
	.attr('fill', '#585565');

for (var x = 0; x < 7; x++) {
	for (var y = 0; y < floors; y++) {
		tower.append('image')
			.attr('class', 'x-' + x + '-y-' + y)
			.attr('width', windowSize)
			.attr('height', windowSize)
			.attr('x', x * (windowSize + windowOffset) + 50 + windowOffset)
			.attr('y', y * (windowSize + windowOffset) + 100 + windowOffset)
			.attr('xlink:href', 'imgs/window.png');
	}
}



svg.append('text')
	.text('CLIMB TRUMP TOWER')
	.attr('x', 15)
	.attr('y', 40)
	.attr('class', 'title');

var score = svg.append('text')
	.text('FLOOR 0')
	.attr('x', 15)
	.attr('y', 70)
	.attr('class', 'score');


var keysActive = {
	37: false,
	38: false,
	39: false,
	40: false
};

var heightUpTower = 0;
var offsetCenter = 0;


var climber = svg.append('image')
	.attr('width', 50)
	.attr('height', 50)
	.attr('xlink:href', 'imgs/climber-still.png');

var active = false;

doc
	.on('keydown', function () {
		var keyCode = d3.event.keyCode;

		if (typeof keysActive[keyCode] !== 'undefined') {
			d3.event.preventDefault();
			keysActive[keyCode] = true;

			if (!active) {
				active = true;
				climber.attr('xlink:href', 'imgs/climber.gif');
			}
		}
	})
	.on('keyup', function () {
		var keyCode = d3.event.keyCode;

		if (typeof keysActive[keyCode] !== 'undefined') {
			keysActive[keyCode] = false;

			if (!keysActive[37] && !keysActive[38] && !keysActive[39] && !keysActive[40]) {
				if (active) {
					active = false;
					climber.attr('xlink:href', 'imgs/climber-still.png');
				}
			}
		}
	});

var distanceMoved = 8;

var probabilityScale = d3.scale.linear()
	.domain([0, 3000])
	.range([0.04, 0.2])
	.clamp(true);

var cops = 0;
var time = Date.now();

setInterval(function () {
	if (keysActive[37] || keysActive[39]) {
		offsetCenter += keysActive[37] ? -distanceMoved : distanceMoved;

		if (offsetCenter > 170) {
			offsetCenter = 170;
		}

		if (offsetCenter < -170) {
			offsetCenter = -170;
		}
	}

	// Can't do both. Suction pads, remember!
	else if (keysActive[38] || keysActive[40]) {
		heightUpTower += keysActive[38] ? distanceMoved : -distanceMoved;
	}

	var towerOffset = 0;

	if (heightUpTower > 450) {
		towerOffset = heightUpTower - 450;
	}

	if (heightUpTower < 0) {
		heightUpTower = 0;
	}

	climber
		.attr('x', 219 + offsetCenter)
		.attr('y', 710 - heightUpTower + towerOffset);

	tower.attr('transform', 'translate(0, -' + (towerHeight - 660 - towerOffset) + ')');


	var floor = d3.scale.linear().domain([0, towerHeight]).range([floors, 0])(heightUpTower);


	var actualFloor = Math.max(0, floors - Math.floor(floor) - 1);
	score.text('FLOOR ' + actualFloor);

	// Sometimes blow out a window

	if (Math.random() < probabilityScale(heightUpTower) || (Date.now() - time > 1000 && !cops)) {
		cops++;
		var y = Math.floor(floor - Math.random() * 5 - 2);
		var x = Math.floor(Math.random() * 7);

		var window = svg.select('.x-' + x + '-y-' + y);

		if (!window.classed('cop')) {
			window
				.attr('xlink:href', 'imgs/window-cop-still.png')
				.classed('cop', true);

			setTimeout(function () {
				window.attr('xlink:href', 'imgs/window-cop.gif');

				var x = window.attr('x');
				var y = Number(window.attr('y'));

				var glass = tower.append('image')
					.attr('xlink:href', 'imgs/glass-falling.gif')
					.attr('width', windowSize)
					.attr('height', windowSize)
					.attr('x', x)
					.attr('y', y);

				setInterval(function () {
					y += 8;

					glass.attr('y', y);
				}, 150);
			}, 2000);
		}
	}
}, 150);