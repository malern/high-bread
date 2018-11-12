var clickPoint;
var canvasRenderer;
var mechanics;

// stop the context menu getting in the way
document.addEventListener('contextmenu', event => event.preventDefault());


window.addEventListener('load', function() {

	canvasRenderer = new CanvasRenderer(document.getElementById('canvas'));

	canvasRenderer.canvas.addEventListener('mousedown', (e) => {
		e.preventDefault();

		clickPoint = canvasRenderer.translatePoint({
			x: e.offsetX,
			y: e.offsetY,
		});

		console.log('click at world point: ', clickPoint);
/*
		if (e.button == 0) {
			// jump
			Matter.Body.applyForce(
				mechanics.player.body,
				mechanics.player.body.position,
				Matter.Vector.normalise(Matter.Vector.sub(clickPoint, mechanics.player.body.position)),
			);
		}
*/
		if ((e.button == 0) || (e.button == 2)) {
			var id = e.button;

			mechanics.player.grappleTo(id, clickPoint);
		}
	});

	window.addEventListener('mouseup', (e) => {
		if ((e.button == 0) || (e.button == 2)) {
			var id = e.button;

			mechanics.player.grappleRemove(id);
		}
	});

	window.addEventListener('wheel', (e) => {
		console.log(e);
		var scaleFactor = 1.1;
		var clicks = (e.deltaY / 40) * -1;
		var scaleAmount = Math.pow(scaleFactor, clicks);
		canvasRenderer.scale *= scaleAmount;
	});

	window.addEventListener('keypress', (event) => {
		switch(event.key) {
			// restart
			case 'r':
				mechanics.startLevel();
			break;
		}
	});

	mechanics = new Mechanics();

	var grappleControllerActivated = [];

	function handleGamepadAxis(grappleId, axesX, axesY) {
		if (Matter.Vector.magnitude({x: axesX, y: axesY}) > 0.5) {
			if (mechanics.player.grappleExists(grappleId)) { return; }
			grappleControllerActivated[grappleId] = true;
			mechanics.player.grappleTo(grappleId, {
				x: mechanics.player.body.position.x + axesX,
				y: mechanics.player.body.position.y + axesY,
			});
		}
		else {
			if (grappleControllerActivated[grappleId]) {
				mechanics.player.grappleRemove(grappleId);
				grappleControllerActivated[grappleId] = false;
			}
		}
	}

	Matter.Events.on(mechanics.engine, 'beforeUpdate', function() {
		if (!'getGamepads' in navigator) { return; }

		for (var gamepad of navigator.getGamepads()) {
			if (gamepad && gamepad.axes.length == 4) {
				handleGamepadAxis(0, gamepad.axes[0], gamepad.axes[1]);
				handleGamepadAxis(2, gamepad.axes[2], gamepad.axes[3]);

				// only check the first gamepad we find
				break;
			}
		}
	});

	mechanics.startLevel();

	canvasRenderer.run(mechanics);
});