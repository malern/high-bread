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
				mechanics.playerBody,
				mechanics.playerBody.position,
				Matter.Vector.normalise(Matter.Vector.sub(clickPoint, mechanics.playerBody.position)),
			);
		}
*/
		if ((e.button == 0) || (e.button == 2)) {
			var id = e.button;

			mechanics.grappleTo(id, clickPoint);
		}
	});

	window.addEventListener('mouseup', (e) => {
		if ((e.button == 0) || (e.button == 2)) {
			var id = e.button;

			mechanics.grappleRemove(id);
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

	mechanics.startLevel();

	canvasRenderer.run(mechanics);
});