class GameEngine {
    constructor(ctx, uiCtx) {
        this.entities = [];
        this.ctx = ctx;
        this.lastFrame = 0;
        this.dt = 0;
        this.step = 1/60;
        this.toRemove = [];
        this.time = 0;
        this.environment;
        this.size = 512;
    }

    init() {
        window.setTimeout(this.gameLoop, 10);
        this.environment = new Environment(512,512);
        this.environment.init();

        for(let i = 0; i < 100; i++) {
            LivingEntity.create(Math.random()*this.size | 0, Math.random()*this.size | 0, 255);
        }
    }

    gameLoop() { 
        game.time++;
        var current = performance.now();
        game.dt += Math.min(0.02, (current - game.lastFrame) / 1000);   // duration capped at 20ms
        while(game.dt > game.step) {
            game.dt -= game.step;
            game.update(game.step);
            game.draw();
        }
        game.lastFrame = current;
        window.requestAnimationFrame(game.gameLoop);
    }

    update(dt) {
        this.environment.update(dt);
        for (var i = this.entities.length-1; i >= 0; i--) {
            this.entities[i].update(dt);    
        }
        while (this.toRemove.length > 0) {
            var rem = this.toRemove.pop();
            if (this.entities.indexOf(rem) !== -1) this.entities.splice(this.entities.indexOf(rem),1);
        }
    }

    draw() {
        this.ctx.canvas.width = this.ctx.canvas.width;
        let imageData = new ImageData(this.size, this.size);
        this.environment.draw(imageData, imageData.data.length);
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(imageData);
        }
        this.ctx.putImageData(imageData, 0, 0);
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    remove(entity) {
        this.toRemove.push(entity);
    }

    eat(x, y, amount) {
        let avail = Math.min(this.environment.get(x,y), amount);
        this.environment.set(x,y, -avail);
        return avail;
    }

    decay(x,y, amount) {
        this.environment.setRot(x,y, amount);
    }
}