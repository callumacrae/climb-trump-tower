var doc = d3.select('html');
var svg = d3.select('svg');


var floors = 68;
var windowSize = 40;
var windowOffset = 14;

var towerHeight = floors * (windowSize + windowOffset) + windowOffset;

var tower = svg.append('g')
	.attr('transform', 'translate(0, -' + (towerHeight - 660) + ')');

tower.append('rect')
	.attr('width', 392)
	.attr('height', towerHeight)
	.attr('x', 50)
	.attr('y', 100)
	.attr('fill', 'lightgray');

for (var x = 0; x < 7; x++) {
	for (var y = 0; y < floors; y++) {
		tower.append('rect')
			.attr('width', windowSize)
			.attr('height', windowSize)
			.attr('x', x * (windowSize + windowOffset) + 50 +  + windowOffset)
			.attr('y', y * (windowSize + windowOffset) + 100 + windowOffset)
			.attr('fill', '#666');
	}
}


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
	.attr('xlink:href', 'imgs/climber.gif');

doc
	.on('keydown', function () {
		var keyCode = d3.event.keyCode;

		if (typeof keysActive[keyCode] !== 'undefined') {
			d3.event.preventDefault();
			keysActive[keyCode] = true;
		}
	})
	.on('keyup', function () {
		var keyCode = d3.event.keyCode;

		if (typeof keysActive[keyCode] !== 'undefined') {
			keysActive[keyCode] = false;
		}
	});

var distanceMoved = 8;

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

	if (heightUpTower > 600) {
		towerOffset = heightUpTower - 600;
	}

	if (heightUpTower < 0) {
		heightUpTower = 0;
	}

	climber
		.attr('x', 221 + offsetCenter)
		.attr('y', 710 - heightUpTower + towerOffset);

	tower.attr('transform', 'translate(0, -' + (towerHeight - 660 - towerOffset) + ')');
}, 150);