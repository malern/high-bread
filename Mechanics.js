class Mechanics {
	constructor(engine) {
		this.engine = Matter.Engine.create();
		Matter.Engine.run(this.engine);
		this.grappleConstraints = [];
	}

	startLevel() {
		this.grappleConstraints = [];
		Matter.World.clear(this.engine.world);

		this.playerBody = Matter.Bodies.rectangle(500, 200, 150, 150, {
			render: {
				strokeStyle: '#ffffff',
				sprite: {
					texture: 'bread.png'
				}
			},
			//collisionFilter: { mask: 2 },
			isPlayer: true,
		});


		// add all of the bodies to the world
		Matter.World.add(this.engine.world, [
			this.playerBody,

			// big box
			Matter.Bodies.rectangle(400, 200, 150, 150),

			// little boxes
			Matter.Bodies.rectangle(450, 50, 80, 80),
			Matter.Bodies.rectangle(450, 50, 80, 80),
			Matter.Bodies.rectangle(450, 50, 80, 80),
			Matter.Bodies.rectangle(450, 50, 80, 80),

			// ground
			Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true }),
			Matter.Bodies.rectangle(1600, 610, 2000, 100, { isStatic: true }),
			// walls
			Matter.Bodies.rectangle(0, 0, 100, 4000, { isStatic: true }),
			Matter.Bodies.rectangle(2500, 0, 100, 4000, { isStatic: true }),

			// platform
			Matter.Bodies.rectangle(1000, 0, 410, 100, { isStatic: true }),

		]);

		this.levelStartTime = Date.now();
	}

	grappleTo(grappleId, targetPoint) {
		// grapple
		var endRopePoint = Matter.Vector.add(Matter.Vector.mult(Matter.Vector.normalise(Matter.Vector.sub(clickPoint, this.playerBody.position)), 5000), this.playerBody.position);

		var closestIntersect = findClosestIntersect(this.playerBody.position, endRopePoint, this.engine.world.bodies);
		canvasRenderer.closestIntersect = closestIntersect;
		console.log(closestIntersect);

		if (this.grappleConstraints[grappleId]) {
			Matter.World.remove(this.engine.world, this.grappleConstraints[grappleId]);
			this.grappleConstraints[grappleId] = null;
		}

		if (closestIntersect) {
			this.grappleConstraints[grappleId] = Matter.Constraint.create({
				bodyA: this.playerBody,
				pointA: { x: 0, y: 0 },
				bodyB: closestIntersect.body,
				pointB: closestIntersect.bodyOffset,
				stiffness: 0.0006,
				length: 1,
				constantForce: 0.2,
			})
			console.log('added grappleConstraint', this.grappleConstraints[grappleId]);

			Matter.World.addConstraint(this.engine.world, this.grappleConstraints[grappleId]);
		}
	}

	grappleRemove(grappleId) {
		if (this.grappleConstraints[grappleId]) {
			Matter.World.remove(this.engine.world, this.grappleConstraints[grappleId]);
			this.grappleConstraints[grappleId] = null;
		}
	}
}




// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function isIntersecting(p1, p2, p3, p4) {
	function CCW(p1, p2, p3) {
		return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
	}
	return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
}


function getIntersectPoint(startPoint1, endPoint1, startPoint2, endPoint2) {
    // if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point
    var denominator, a, b, numerator1, numerator2, result = {
        x: null,
        y: null,
        onLine1: false,
        onLine2: false
    };
    denominator = ((endPoint2.y - startPoint2.y) * (endPoint1.x - startPoint1.x)) - ((endPoint2.x - startPoint2.x) * (endPoint1.y - startPoint1.y));
    if (denominator == 0) {
        return result;
    }
    a = startPoint1.y - startPoint2.y;
    b = startPoint1.x - startPoint2.x;
    numerator1 = ((endPoint2.x - startPoint2.x) * a) - ((endPoint2.y - startPoint2.y) * b);
    numerator2 = ((endPoint1.x - startPoint1.x) * a) - ((endPoint1.y - startPoint1.y) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    // if we cast these lines infinitely in both directions, they intersect here:
    result.x = startPoint1.x + (a * (endPoint1.x - startPoint1.x));
    result.y = startPoint1.y + (a * (endPoint1.y - startPoint1.y));
/*
        // it is worth noting that this should be the same as:
        x = startPoint2.x + (b * (endPoint2.x - startPoint2.x));
        y = startPoint2.x + (b * (endPoint2.y - startPoint2.y));
        */
    // if line1 is a segment and line2 is infinite, they intersect if:
    if (a > 0 && a < 1) {
        result.onLine1 = true;
    }
    // if line2 is a segment and line1 is infinite, they intersect if:
    if (b > 0 && b < 1) {
        result.onLine2 = true;
    }
    // if line1 and line2 are segments, they intersect if both of the above are true
    return result;
};

function findClosestIntersect(startPoint, endPoint, bodies) {
	var intersectingSegments = [];

	// find all the segments that intersect
	for (var body of bodies) {
		if (body.isPlayer) { continue; }
		for (var i = 0; i < body.vertices.length - 1; i++) {
			if (isIntersecting(startPoint, endPoint, body.vertices[i], body.vertices[i+1])) {
				intersectingSegments.push({
					body: body,
					vertex1: body.vertices[i],
					vertex2: body.vertices[i+1],
					intersectPoint: getIntersectPoint(startPoint, endPoint, body.vertices[i], body.vertices[i+1]),
				});
			}
		}

		if (isIntersecting(startPoint, endPoint, body.vertices[i], body.vertices[0])) {
			intersectingSegments.push({
				body: body,
				vertex1: body.vertices[i],
				vertex2: body.vertices[0],
				intersectPoint: getIntersectPoint(startPoint, endPoint, body.vertices[i], body.vertices[0]),
			});
		}
	}

	canvasRenderer.intersectingSegments = intersectingSegments;

	if (intersectingSegments.length < 1) { return null; }

	// find the closest point
	var minDistanceSegment = intersectingSegments[0];
	var minDistance = Math.pow(Math.abs(startPoint.x - intersectingSegments[0].intersectPoint.x), 2) + Math.pow(Math.abs(startPoint.y - intersectingSegments[0].intersectPoint.y), 2);

	for (var i = 1; i < intersectingSegments.length; i++) {
		var distance = Math.pow(Math.abs(startPoint.x - intersectingSegments[i].intersectPoint.x), 2) + Math.pow(Math.abs(startPoint.y - intersectingSegments[i].intersectPoint.y), 2);
		if (distance < minDistance) {
			minDistanceSegment = intersectingSegments[i];
			minDistance = distance;
		}
	}

	minDistanceSegment.bodyOffset = Matter.Vector.sub(minDistanceSegment.intersectPoint, minDistanceSegment.body.position);

	return minDistanceSegment;
}