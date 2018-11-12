class Mechanics {
	constructor(engine) {
		this.engine = Matter.Engine.create();
		Matter.Engine.run(this.engine);
	}

	startLevel() {
		Matter.World.clear(this.engine.world);

		this.player = new Player(this);


		// add all of the bodies to the world
		Matter.World.add(this.engine.world, [
			this.player.body,

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
}





