const { Composite } = Matter;

export default class MatterWorld {
	constructor(world) {
		this.world = world;
	}

	add(bodies) {
		Composite.add(this.world, bodies);
	}

	clear() {
		Composite.clear(this.world);
	}
}
