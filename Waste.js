class Waste extends Entity {
    constructor(x,y, amount) {
        super(x,y);
        this.amount = amount;
    }

    static create(x,y,amount) {
        let obj = new Waste(x,y,amount);
        game.addEntity(obj);
        return obj;
    }

    update() {
        let rot = Math.min(this.amount, 5);
        game.decay(this.x, this.y, rot);
        this.amount -= rot;
        if (this.amount <= 0) {
            game.remove(this);
        }
    }

    draw(imageData) {
        let coords = (this.x+this.y*512)*4;
        imageData.data[coords+0] = Math.min(255, this.nutrients+128);
        imageData.data[coords+1] = Math.min(255, this.nutrients+128);
        imageData.data[coords+2] = Math.min(255, this.nutrients+128);
        imageData.data[coords+3] = 255;
    }
}