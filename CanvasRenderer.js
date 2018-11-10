class CanvasRenderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.scale = 0.5;

		this.worldMatrix = createMatrix(0, 0, this.scale, 0);

		this.breadImg = new Image();
		this.breadImg.onload = () => {
			this.breadImg.isLoaded = true;
		}
		this.breadImg.src = 'bread.png';
	}

	drawBody(body) {
		this.ctx.strokeStyle = 'red';
		this.ctx.lineWidth = 1 / this.scale;

		this.ctx.beginPath();
		for (var vertex of body.vertices) {
			this.ctx.lineTo(vertex.x, vertex.y);
		}
		this.ctx.closePath();
		this.ctx.stroke();
	}

	drawConstraint(constraint) {
		var pointA = constraint.bodyA ? Matter.Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA;
		var pointB = constraint.bodyB ? Matter.Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB;

		this.ctx.strokeStyle = 'white';
		this.ctx.beginPath();
		this.ctx.moveTo(pointA.x, pointA.y);
		this.ctx.lineTo(pointB.x, pointB.y);
		this.ctx.stroke();

		this.ctx.fillStyle = 'white';
		this.ctx.fillRect(pointA - 5, pointA -5, 10, 10);
		this.ctx.fillRect(pointB - 5, pointB -5, 10, 10);
	}



	drawWorld(world) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);



var trackBody = world.bodies[0];

		var translateX = (this.canvas.width / 2) - (trackBody.position.x * this.scale);

		if (translateX < 600) {
			translateX = 600;
		}

		this.worldMatrix = createMatrix(translateX, (this.canvas.height / 2) - (trackBody.position.y * this.scale), this.scale, 0);


		this.ctx.setTransform(this.worldMatrix.a, this.worldMatrix.b, this.worldMatrix.c, this.worldMatrix.d, this.worldMatrix.e, this.worldMatrix.f);

		if (this.breadImg.isLoaded) {
			this.ctx.save();
			this.ctx.translate(world.bodies[0].position.x, world.bodies[0].position.y);
			this.ctx.rotate(world.bodies[0].angle);
			this.ctx.drawImage(this.breadImg, -(this.breadImg.width / 2), -(this.breadImg.height / 2));
			this.ctx.restore();
		}

		for (var body of world.bodies) {
			this.drawBody(body);
		}

		if (this.intersectingSegments) {
			this.ctx.strokeStyle = 'green';
			this.ctx.fillStyle = 'green';
			for (var segment of this.intersectingSegments) {
				this.ctx.beginPath();
				this.ctx.moveTo(segment.vertex1.x, segment.vertex1.y);
				this.ctx.lineTo(segment.vertex2.x, segment.vertex2.y);
				this.ctx.closePath();
				this.ctx.stroke();

				this.ctx.fillRect(segment.intersectPoint.x - 5, segment.intersectPoint.y -5, 10, 10);
			}
		}

		for (var constraint of world.constraints) {
			this.drawConstraint(constraint);
		}

		if (this.closestIntersect) {
			this.ctx.fillStyle = 'green';
			this.ctx.fillRect(this.closestIntersect.intersectPoint.x - 5, this.closestIntersect.intersectPoint.y -5, 10, 10);

			this.ctx.fillStyle = 'red';
			var attachPoint = Matter.Vector.add(this.closestIntersect.body.position, this.closestIntersect.bodyOffset);
			this.ctx.fillRect(attachPoint.x - 5, attachPoint.y -5, 10, 10);
		}
/*
		if (clickPoint) {
			this.ctx.fillStyle = 'green';
			this.ctx.fillRect(clickPoint.x - 5, clickPoint.y -5, 10, 10);
		}
*/
	}

	run(engine) {
this.engine = engine;
		var loop = () => {
			this.drawWorld(engine.world);
			requestAnimationFrame(loop);
		}

		loop();
	};


	translatePoint(point) {

		// https://stackoverflow.com/questions/34597160/html-canvas-mouse-position-after-scale-and-translate
		// first get the cross product of x axis and y axis
		var cross = this.worldMatrix.a * this.worldMatrix.d - this.worldMatrix.b * this.worldMatrix.c;

		// now get the inverted axis
		var m = [
			this.worldMatrix.d / cross,
			-this.worldMatrix.b / cross,
			-this.worldMatrix.c / cross,
			this.worldMatrix.a / cross
		];

		var xx = point.x - this.worldMatrix.e;	 // remove the translation 
		var yy = point.y - this.worldMatrix.f;	 // by subtracting the origin
		// return the point {x:?,y:?} by multiplying xx,yy by the inverse matrix
		return {
			x: xx * m[0] + yy * m[2],
			y: xx * m[1] + yy * m[3],
		}

/*
		var invMatrix = this.ctx.getTransform().invertSelf();

		return {
			x: point.x * invMatrix.a + point.y * invMatrix.c + invMatrix.e,
			y: point.x * invMatrix.b + point.y * invMatrix.d + invMatrix.f,
		};
		*/
	}
}

function createMatrix(x, y, scale, rotate) {

	var a = Math.cos(rotate) * scale;
	var b = Math.sin(rotate) * scale;

	return {
		a: a,
		b: b,
		c: b * -1,
		d: a,
		e: x,
		f: y,
	};
}
