import shuffle from './util.js';
import MatterWorld from './world.js';

const { Render, Runner, Engine, Bodies, SAT, Body, Events } = Matter;
const btn = document.querySelector('.restart-btn');

let engine, runner, renderer, matterWorld;

function startGame() {
	engine = Engine.create();
	runner = Runner.create();
	const { world } = engine;
	matterWorld = new MatterWorld(world);
	const width = window.innerWidth;
	const height = window.innerHeight;
	const gridRow = 8;
	const gridCol = 10;
	renderer = Render.create({
		element: document.body,
		engine: engine,
		options: {
			width,
			height,
			wireframes: false,
		},
	});
	engine.world.gravity.y = 0.2;

	// Walls
	const walls = [
		Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
		Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }),
		Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
		Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
	];

	matterWorld.add(walls);
	mazeGeneration(
		gridRow,
		gridCol,
		matterWorld,
		width,
		height,
		engine,
		world,
		runner
	);
	Render.run(renderer);
	Runner.run(runner, engine);
}

function mazeGeneration(
	gridRow,
	gridCol,
	matterWorld,
	width,
	height,
	engine,
	world,
	renderer,
	runner
) {
	// Maze Generation
	// An Incorrect method.. Array elements copied by reference. Change one value whole thing changes.
	// Reason being using array.fill(value), if value is obj, they are copied by reference.
	// let gridArray = new Array(gridRow).fill(new Array(gridCol).fill(false))
	// gridArray[0][0] = true;
	// console.log(gridArray);
	let gridArray = Array(gridRow)
		.fill(null)
		.map(() => Array(gridCol).fill(false));
	let verticalArray = Array.from(Array(gridRow), () =>
		new Array(gridCol - 1).fill(false)
	);
	let horizontalArray = Array.from(Array(gridRow - 1), () =>
		new Array(gridCol).fill(false)
	);

	// Get a random grid position
	const randomRow = Math.floor(Math.random() * gridRow);
	const randomCol = Math.floor(Math.random() * gridCol);

	const traverseThroughGrid = (row, col) => {
		// check if we have visited the cell. Then return
		if (gridArray[row][col]) {
			return;
		}
		// set the cell as visited
		gridArray[row][col] = true;

		//get the neighbours
		const neighbours = shuffle([
			[row - 1, col, 'up'],
			[row, col + 1, 'right'],
			[row + 1, col, 'down'],
			[row, col - 1, 'left'],
		]);
		for (let neighbour of neighbours) {
			const [nextRow, nextCol, direction] = neighbour;
			//out of bounds
			if (
				nextRow < 0 ||
				nextRow >= gridRow ||
				nextCol < 0 ||
				nextCol >= gridCol
			) {
				continue;
			}
			// if we visited the neighbour
			if (gridArray[nextRow][nextCol]) {
				continue;
			}
			// vertical and horizontal walls.
			switch (direction) {
				case 'left':
					verticalArray[row][col - 1] = true;
					break;

				case 'right':
					verticalArray[row][col] = true;
					break;

				case 'up':
					horizontalArray[row - 1][col] = true;
					break;

				case 'down':
					horizontalArray[row][col] = true;
					break;

				default:
					break;
			}

			traverseThroughGrid(nextRow, nextCol);
		}
	};

	traverseThroughGrid(randomRow, randomCol);

	horizontalArray.forEach((row, rowIdx) => {
		row.forEach((show, colIdx) => {
			if (show) {
				return;
			} else {
				let xx = (width / gridCol) * colIdx + width / (2 * gridCol);
				let yy = (height / gridRow) * (1 + rowIdx);
				let body = Bodies.rectangle(xx, yy, width / gridCol, 10, {
					isStatic: true,
					label: 'wall',
					render: {
						fillStyle: 'green',
					},
					chamfer: 2,
				});
				matterWorld.add(body);
			}
		});
	});

	verticalArray.forEach((row, rowIdx) => {
		row.forEach((show, colIdx) => {
			if (show) {
				return;
			} else {
				let xx = (width / gridCol) * (1 + colIdx);
				let yy = (height / gridRow) * rowIdx + height / (2 * gridRow);
				let body = Bodies.rectangle(xx, yy, 10, height / gridRow, {
					isStatic: true,
					label: 'wall',
					render: {
						fillStyle: 'green',
					},
					chamfer: 2,
				});
				matterWorld.add(body);
			}
		});
	});

	// Goal Rectangle
	const goal = Bodies.rectangle(
		width - width / (2 * gridCol),
		height - height / (2 * gridRow),
		width / (2 * gridCol),
		height / (2 * gridRow),
		{
			isStatic: true,
			render: {
				fillStyle: 'blue',
			},
			chamfer: 5,
		}
	);

	matterWorld.add(goal);
	const ball = Bodies.circle(
		width / (2 * gridCol),
		height / (2 * gridRow),
		Math.min(width / (4 * gridCol), height / (4 * gridRow)),
		{
			render: {
				fillStyle: 'black',
				strokeStyle: 'red',
				lineWidth: 5,
			},
		}
	);

	matterWorld.add(ball);

	document.addEventListener('keydown', (event) => {
		// experimented with force and velocity. Force kicks ass with torque and multi directional motion
		const { x, y } = ball.velocity;
		if (event.key === 'w' || event.key === 'W') {
			Body.setVelocity(ball, {
				x: x,
				y: y - 5,
			});
		}
		if (event.key === 'd' || event.key === 'D') {
			// Body.applyForce(ball, ball.position, {
			// 	x: 0.01,
			// 	y: 0,
			// });
			Body.setVelocity(ball, {
				x: x + 5,
				y,
			});
		}
		if (event.key === 'a' || event.key === 'A') {
			Body.setVelocity(ball, {
				x: x - 5,
				y,
			});
		}
		if (event.key === 's' || event.key === 'S') {
			Body.setVelocity(ball, {
				x: x,
				y: y + 5,
			});
		}
	});

	Events.on(engine, 'collisionStart', () => {
		if (SAT.collides(goal, ball).collided) {
			world.gravity.y = 0.5;
			world.bodies.forEach((body) => {
				if (body.label === 'wall') {
					Body.setStatic(body, false);
				}
			});
			btn.classList.add('show');
		}
	});
}

btn.addEventListener('click', (e) => {
	e.preventDefault();
	matterWorld.clear();
	Engine.clear(engine);
	Render.stop(renderer);
	Runner.stop(runner);
	renderer.canvas.remove();
	renderer.canvas = null;
	renderer.context = null;
	e.target.classList.remove('show');
	startGame();
});

startGame();
