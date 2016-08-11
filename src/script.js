var doc = d3.select('html');
var svg = d3.select('svg');


var floors = 68;
var windowSize = 44;
var windowOffset = 10;

var towerHeight = floors * (windowSize + windowOffset) + windowOffset;

var tower = svg.append('g')
	.attr('transform', 'translate(0, -' + (towerHeight - 660) + ')');

tower.append('rect')
	.attr('width', 282)
	.attr('height', towerHeight)
	.attr('x', 104)
	.attr('y', 100)
	.attr('fill', '#585565');

for (var x = 0; x < 5; x++) {
	for (var y = 0; y < floors; y++) {
		tower.append('image')
			.attr('class', 'x-' + x + '-y-' + y)
			.attr('width', windowSize)
			.attr('height', windowSize)
			.attr('x', x * (windowSize + windowOffset) + 104 + windowOffset)
			.attr('y', y * (windowSize + windowOffset) + 100 + windowOffset)
			.attr('xlink:href', 'imgs/window.png');
	}
}



svg.append('text')
	.text('CLIMB TRUMP TOWER')
	.attr('x', 250)
	.attr('text-anchor', 'middle')
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

var deathPoints = [];

var dead = false;

setInterval(function () {
	if (dead) {
		return;
	}

	if (keysActive[37] || keysActive[39]) {
		offsetCenter += keysActive[37] ? -distanceMoved : distanceMoved;

		if (offsetCenter > 120) {
			offsetCenter = 120;
		}

		if (offsetCenter < -120) {
			offsetCenter = -120;
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

	var climberX = 219 + offsetCenter;
	var climberY = 710 - heightUpTower + towerOffset;

	climber
		.attr('x', climberX)
		.attr('y', climberY);

	var translateY = towerHeight - 660 - towerOffset;
	tower.attr('transform', 'translate(0, -' + translateY + ')');


	var floor = d3.scale.linear().domain([0, towerHeight]).range([floors, 0])(heightUpTower);


	var actualFloor = Math.max(0, floors - Math.floor(floor) - 1);
	score.text('FLOOR ' + actualFloor);

	// Sometimes blow out a window

	if (Math.random() < probabilityScale(heightUpTower) || (Date.now() - time > 1000 && !cops)) {
		cops++;
		var y = Math.floor(floor - Math.random() * 5 - 2);
		var x = Math.floor(Math.random() * 5);

		var window = svg.select('.x-' + x + '-y-' + y);

		if (!window.classed('cop')) {
			window
				.attr('xlink:href', 'imgs/window-cop-still.png')
				.classed('cop', true);

			setTimeout(function () {
				deathPoints.push(window);

				window.attr('xlink:href', 'imgs/window-cop.gif');

				var x = window.attr('x');
				var y = Number(window.attr('y'));

				var glass = tower.append('image')
					.attr('xlink:href', 'imgs/glass-falling.gif')
					.attr('width', windowSize)
					.attr('height', windowSize)
					.attr('x', x)
					.attr('y', y);

				deathPoints.push(glass);

				setInterval(function () {
					y += 8;
					glass.attr('y', y);
				}, 150);
			}, 2000);
		}
	}


	// Check for collisions

	deathPoints.forEach(function (point) {
		var pointX = point.attr('x');
		var pointY = point.attr('y') - translateY;

		var distance = Math.pow(Math.pow(pointX - climberX, 2) + Math.pow(pointY - climberY, 2), 0.5);

		if (distance < 35) {
			dead = true;
			die(actualFloor);
		}
	});
}, 150);

function die(floor) {
	var deathSign = svg.append('g');

	deathSign.append('rect')
		.attr('width', 400)
		.attr('height', 200)
		.attr('x', 50)
		.attr('y', 200)
		.attr('rx', 15)
		.attr('ry', 15)
		.attr('fill', 'rgba(0, 0, 0, 0.8)')
		.attr('stroke-width', 5)
		.attr('stroke', 'white');

	deathSign.append('text')
		.text('GAME OVER')
		.attr('x', 250)
		.attr('text-anchor', 'middle')
		.attr('y', 270)
		.attr('class', 'death');

	deathSign.append('text')
		.text('You climbed ' + floor + ' floors')
		.attr('x', 250)
		.attr('text-anchor', 'middle')
		.attr('y', 300)
		.attr('class', 'death-score');
}