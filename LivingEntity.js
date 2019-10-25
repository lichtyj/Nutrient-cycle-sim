class LivingEntity extends Entity {
    constructor(x,y, nutrients, waste, length, splitChance) {
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
        this.splitChance = splitChance;
        this.last = Math.random()*4|0;
    }

    static create(x,y, nutrients, waste, length, splitChance) {
        if (nutrients == undefined) nutrients = 0;
        if (waste == undefined) waste = 0;
        if (length == undefined) length = 1;
        if (splitChance == undefined) splitChance = 0.05;
        let obj = new LivingEntity(x, y, nutrients, waste, length, splitChance);
        game.addEntity(obj);
        return obj;
    }

    update(dt) {
        if (this.nutrients == 0) {
            this.die();
        } else {
            if (this.hungry) this.eat();
            this.metabolize();
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
            if (Math.random() > this.splitChance || this.length < 2) {
                this.grow();
            } else {
                this.split();
            }
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

    move() {
        this.last += (Math.random()*3 | 0) + 2;
        this.last %= 4;
        switch(this.last) {
            case 0:
                this.x += 1;
                break;
            case 1:
                this.x -= 1;
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
        let obj = LivingEntity.create(this.body[this.ptr].x, this.body[this.ptr].y, halfNutrients, halfWaste, halfLength, this.splitChance * (Math.random()/10+1));
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