
    static create(x,y) {
        var obj = new Entity(x,y);
        game.addEntity(obj);
        return obj;
    }

    update(dt) {

    }

    draw(ctx) {
        let size = 1;
        let imageData = ctx.createImageData(size, size);
        let i,j;
        for (i = 0, j = 0; i < size; i += 4, j++) {
            imageData.data[i+0] = 0;
            imageData.data[i+1] = 255;
            imageData.data[i+2] = 0;
            imageData.data[i+3] = 255;
        }
        ctx.putImageData(imageData, this.x, this.y);
    }
}