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
        this.body = [{x:x,y:y}];
        this.ptr = 0;
        this.length = length;
        this.genes = genes;
        this.direction = Math.random()*4|0;
        this.mem;
        this.brain;
    }

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
			// this.think();
			this.move();
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
    }

    eat() {
        let amount = game.eat(this.x, this.y, 2 * this.length);
        this.nutrients += amount;
        if (this.nutrients > this.maxNutrients) {
            this.grow();
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
        this.brain.think(senses);
    }

    move() {
        this.direction += (Math.random()*3 | 0) + 2;
        this.direction %= 4;
        switch(this.direction) {
            case 0:
                this.y -= 1;
                break;
            case 1:
                this.x += 1;
                break;
            case 2:
                this.y += 1;
                break;
            case 3:
                this.y -= 1;
                break;
            default:
                break;
        }
        // this.x += (Math.random() > .5) ? 1 : -1;
        // this.y += (Math.random() > .5) ? 1 : -1;
        this.x %= 512;
        this.y %= 512;
        if (this.x < 0) this.x += game.size;
        if (this.y < 0) this.y += game.size;
        this.ptr++;
        this.ptr %= this.length;
        this.body[this.ptr] = {x:this.x, y:this.y};
    }

    poop() {
        Waste.create(this.x, this.y, this.waste);
        this.waste = 0;
    }

    split() {
        let halfNutrients = this.nutrients / 2 | 0;
        let halfWaste = this.waste / 2 | 0;
        let halfLength = this.length / 2 | 0;
        this.nutrients -= halfNutrients;
        this.waste -= halfWaste;
        this.length -= halfLength;
        this.ptr += halfLength;
        this.ptr %= this.length;
        let obj = LivingEntity.create(this.body[this.ptr].x, this.body[this.ptr].y, halfNutrients, halfWaste, halfLength, this.genes * (Math.random()/10+1));
        for (let i = 0; i < halfLength; i++) {
            obj.body[i] = this.body[this.length+i];
        }
        if (Math.random()*this.length < this.splitChance*10) this.die();
    }

    grow() {
        this.body[this.length++] = {x:this.x, y:this.y};
        this.maxWaste = this.length * this.wastePerSegment;
        this.maxNutrients = this.length * this.nutrientsPerSegment;
        this.hungerThreshold = this.length * this.hungerPerSegment;
    }
}