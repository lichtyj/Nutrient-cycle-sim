class LivingEntity extends Entity {
	constructor(x,y, nutrients, waste, length, genes) {
		super(x,y);
		this.nutrients = nutrients;
		this.hungerThreshold = 32
		this.hungerPerSegment = 32;
		this.hungry = true;
		this.maxNutrients = 128;
		this.nutrientsPerSegment = 128;
		this.waste = waste;
		this.wastePerSegment = 64;
		this.maxWaste = 64;
		this.minimumPoop = 32;
		this.body = [{x:x,y:y}];
		this.ptr = 0;
		this.length = length;
		this.genes = genes;
		this.direction = Math.random()*4|0;
		this.mem = 0;
		this.brain;
		LivingEntity.count++;
	}

	static count = 0;

	static create(x,y, nutrients, waste, length, genes) {
		if (nutrients == undefined) nutrients = 0;
		if (waste == undefined) waste = 0;
		if (length == undefined) length = 1;
		if (genes == undefined) genes = Genes.createRandom(13,6,6,0,1);
		let obj = new LivingEntity(x, y, nutrients, waste, length, genes);
		obj.init();
		game.addEntity(obj);
		return obj;
	}

	init() {
		this.brain = Brain.create(this.genes);
	}

	update(dt) {
		if (this.nutrients == 0) {
			this.die();
		} else {
			if (this.hungry) this.eat();
			this.metabolize();
			this.act(this.think());
		}
	}

	draw(imageData) {
		let coords;
		for (let i = 0; i < this.length; i++) {
			coords = (this.body[i].x+this.body[i].y*512)*4;
			imageData.data[coords+0] = this.nutrients;
			imageData.data[coords+1] = 255;
			imageData.data[coords+2] = this.waste;
		}
	}

	die() {
		game.remove(this);
		Waste.create(this.x, this.y, this.nutrients + this.waste);
		for(let i = 0; i < this.length; i++) {
			Waste.create(this.body[i].x, this.body[i].y, this.nutrientsPerSegment);
		}
		LivingEntity.count--;
		if (LivingEntity.count == 0) {
			LivingEntity.create(Math.random()*game.size | 0, Math.random()*game.size | 0, 255, 0, 1, Genes.createMutantCopy(this.genes, 0.2));
			console.log('All dead.  Reseeding');
		} else {
			console.log('Death.  Remaining: ' + LivingEntity.count);
		}
	}

	eat() {
		let amount = game.eat(this.x, this.y, 2 * this.length);
		this.nutrients += amount;
		if (this.nutrients > this.maxNutrients) {
			this.grow();
			this.nutrients -= this.nutrientsPerSegment;
			this.hungry = false;
		}
	}

	metabolize() {
		let energy = Math.min(this.nutrients, 1 * this.length);
		this.nutrients -= energy;
		if (this.nutrients < this.hungerThreshold) this.hungry = true;
		this.waste += energy;
		if (this.waste >= this.maxWaste) {
			this.poop();
		}
	}

	think() {
		
		let senses = new Array(13); // Get size from genes
		let left, right, forward;
		switch(this.direction) {
			case 0:
					left = 		{x:this.x - 1	, y:this.y};
					right = 	{x:this.x + 1	, y:this.y};
					forward = 	{x:this.x		, y:this.y - 1};
					break;
			case 1:
					left = 		{x:this.x		, y:this.y - 1};
					right = 	{x:this.x		, y:this.y + 1};
					forward = 	{x:this.x + 1	, y:this.y};
					break;
			case 2:
					left = 		{x:this.x + 1	, y:this.y};
					right = 	{x:this.x - 1	, y:this.y};
					forward = 	{x:this.x		, y:this.y + 1};
					break;
			case 3:
					left = 		{x:this.x		, y:this.y + 1};
					right = 	{x:this.x		, y:this.y - 1};
					forward = 	{x:this.x - 1	, y:this.y};
					break;
		}
		senses[0] = game.environment.getPosNutrients(left.x, left.y)	// 1	left food
		senses[1] = game.environment.getPosNutrients(right.x, right.y)	// 2	right food
		senses[2] = game.environment.getPosNutrients(forward.x, forward.y)	// 3	forward food
		senses[3] = game.environment.getPosNutrients(this.x, this.y)	// 4	current food
		senses[4] = game.environment.getPosWaste(left.x, left.y)	// 5	left waste
		senses[5] = game.environment.getPosWaste(right.x, right.y)	// 6	right waste
		senses[6] = game.environment.getPosWaste(forward.x, forward.y)	// 7	forward waste
		senses[7] = game.environment.getPosWaste(this.x, this.y)	// 8	current waste
		senses[8] = this.direction	// 9	Direction
		senses[9] = this.length	// 10	Length
		senses[10] = this.waste	// 11	Waste
		senses[11] = this.nutrients	// 12	Nutrition
		senses[12] = this.mem	// 13	Mem (undefined)
		return this.brain.think(senses);
	}

	act(thoughts) {
		// 	0	Move left
		// 	1	Move right
		//  2	Move forward
		// 	3	Poop
		// 	4	Split
		// 	5	Mem
		let move = -1;
		if (thoughts[0] > Math.max(thoughts[1], thoughts[2])) move = 0;
		if (thoughts[1] > Math.max(thoughts[0], thoughts[2])) move = 1;
		if (thoughts[2] > Math.max(thoughts[0], thoughts[1])) move = 2;
		switch(move) {
			case 0:
				this.move('left');
				break;
			case 1:
				this.move('right');
				break;
			case 2:
				this.move('forward');
				break;
			default:
				console.error('Move unresolved.  Value: ' + thoughts.slice(0,2).indexOf(max));
				break;
		}
		if (thoughts[3] >= 1) this.poop();
		if (thoughts[4] >= 1) this.split();
		this.mem = thoughts[5];
	}

	move(newDir) {
		switch(newDir) {
			case 'left':
				this.direction = (this.direction + 3) % 4;
				break;
			case 'right':
				this.direction = (this.direction + 1) % 4;
				break;
			case 'forward':
				break;
			default:
				console.error('Moved in bad direction');
		}
		this.ptr++;
		this.ptr %= this.length;
		let newPos = this.getPointInDirection(newDir);
		this.body[this.ptr] = newPos;
		this.x = newPos.x;
		this.y = newPos.y;

	}

	poop() {
		if (this.waste < this.minimumPoop) {
			this.length--;
			if (this.length == 0) {
				this.die();
			} else {
				this.waste += this.nutrientsPerSegment;
			}
		}
		Waste.create(this.x, this.y, this.waste);
		this.waste = 0;
	}

	split() {
		if (this.length > 4) {
			let halfNutrients = this.nutrients / 2 | 0;
			let halfWaste = this.waste / 2 | 0;
			let halfLength = this.length / 2 | 0;
			let newGenes = Genes.createMutantCopy(this.genes, 0.05);
			this.nutrients -= halfNutrients;
			this.waste -= halfWaste;
			this.length -= halfLength;
			this.ptr += halfLength;
			this.ptr %= this.length;
			let obj = LivingEntity.create(this.body[this.ptr].x, this.body[this.ptr].y, halfNutrients, halfWaste, halfLength, newGenes);
			for (let i = 0; i < halfLength; i++) {
				obj.body[i] = this.body[this.length+i];
			}
		} else {
			this.die();
		}
	}

	grow() {
		this.body[this.length++] = {x:this.x, y:this.y};
		this.maxWaste = this.length * this.wastePerSegment;
		this.maxNutrients = this.length * this.nutrientsPerSegment;
		this.hungerThreshold = this.length * this.hungerPerSegment;
	}


	// Utils
	getPointInDirection(dir) {
		let left, right, forward, ret;
		switch(this.direction) {
			case 0:
					left = 		{x:this.x - 1	, y:this.y};
					right = 	{x:this.x + 1	, y:this.y};
					forward = 	{x:this.x		, y:this.y - 1};
					break;
			case 1:
					left = 		{x:this.x		, y:this.y - 1};
					right = 	{x:this.x		, y:this.y + 1};
					forward = 	{x:this.x + 1	, y:this.y};
					break;
			case 2:
					left = 		{x:this.x + 1	, y:this.y};
					right = 	{x:this.x - 1	, y:this.y};
					forward = 	{x:this.x		, y:this.y + 1};
					break;
			case 3:
					left = 		{x:this.x		, y:this.y + 1};
					right = 	{x:this.x		, y:this.y - 1};
					forward = 	{x:this.x - 1	, y:this.y};
					break;
			default:
					console.error('This.direction in impossible state');
		}
		if (dir === 'left') ret = left;
		if (dir === 'right') ret = right;
		if (dir === 'forward') ret = forward;

		ret.x %= 512;
		ret.y %= 512;
		if (ret.x < 0) ret.x += game.size;
		if (ret.y < 0) ret.y += game.size;
		return {x:ret.x, y:ret.y};
	}
}