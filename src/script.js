(function () {

var doc = d3.select('html');
var body = d3.select('body');
var svg = d3.select('svg');

svg.attr('height', Math.max(800, window.innerHeight));

if (window.devicePixelRatio > 1.9) {
	svg.attr('width', 1000);
}


var floors = 80;
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
	.attr('y', 60)
	.attr('class', 'title');

var score = svg.append('text')
	.text('FLOOR 0')
	.attr('x', 15)
	.attr('y', 90)
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

if (isTouch()) {
	var buttons = d3.selectAll('.button');
	buttons.style('display', 'block');

	buttons.on('touchstart', function () {
		d3.event.preventDefault();

		var direction = this.className.split(' ')[1];

		if (direction === 'left') {
			keysActive[37] = true;
		} else if (direction === 'up') {
			keysActive[38] = true;
		} else if (direction === 'right') {
			keysActive[39] = true;
		} else if (direction === 'down') {
			keysActive[40] = true;
		}

		if (!active) {
			active = true;
			climber.attr('xlink:href', 'imgs/climber.gif');
		}
	});

	buttons.on('touchend', function () {
		keysActive[37] = keysActive[38] = keysActive[39] = keysActive[40] = false;

		if (active) {
			active = false;
			climber.attr('xlink:href', 'imgs/climber-still.png');
		}
	});

	setTimeout(function () {
		buttons.style('opacity', '0.1');
	}, 3000);
}

var distanceMoved = 8;

var probabilityScale = d3.scale.linear()
	.domain([0, towerHeight])
	.range([0.04, 0.3])
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

		clouds.forEach(function (cloud) {
			var startTop = Number(cloud.attr('data-top-start'));
			cloud.style('top', startTop + towerOffset / 3 + 'px');
		});
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

				var interval = setInterval(function () {
					y += 8;
					glass.attr('y', y);

					if (y > towerHeight + 64) {
						clearInterval(interval);
						deathPoints.splice(deathPoints.indexOf(glass), 1);
						glass.remove();
					}
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
	d3.select('.game-over').style('display', 'block');
	d3.select('.game-over-donald').style('display', 'block');
	d3.select('.game-over .floors').text(floor);

	d3.select('audio')
		.attr('src', 'music/gameover.mp3')
		.attr('loop', null);

	var twitter = body.select('.game-over .twitter')
		.append('a')
		.attr('href', 'https://twitter.com/share')
		.attr('class', 'twitter-share-button')
		.attr('data-size', 'large')
		.attr('data-text', 'I climbed ' + floor + ' floors up Trump Tower! How far will you get?')
		.attr('data-url', 'http://climbtrumptower.com/')
		.attr('data-hashtags', 'TrumpTower')
		.attr('data-show-count', 'false')
		.text('Tweet');


	if (window.ga) {
		window.ga('send', 'event', 'Game', 'completed', floor);
	}

	twttr.widgets.load();
}


var clouds = [];
for (var i = 0; i < 15; i++) {
	clouds.push(newCloud());
}

function newCloud() {
	var randomCloud = Math.floor(Math.random() * 2) + 1;
	var left = Math.random() * 1600 - 400;
	var top = Math.random() * 1500 - 1000;

	var cloud = body.insert('img', ':first-child')
		.attr('src', 'imgs/cloud-' + randomCloud + '.png')
		.attr('class', 'cloud')
		.style('width', 200 + Math.random() * 100 + 'px')
		.style('left', left + 'px')
		.style('top', top + 'px')
		.attr('data-top-start', top);


	var direction = Math.random() < 0.5 ? 'left' : 'right';

	if (left < 200) {
		direction = 'right';
	}

	if (left > 1000) {
		direction = 'left';
	}

	var frame = 0;

	function animator() {
		frame++;
		window.requestAnimationFrame(animator);

		if (frame % 6 !== 0) {
			return;
		}

		left += direction === 'right' ? 0.5 : -0.5;
		cloud.style('left', left + 'px');
	}

	window.requestAnimationFrame(animator);

	return cloud;
}

function isTouch() {
	return ('ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0);
}

})();