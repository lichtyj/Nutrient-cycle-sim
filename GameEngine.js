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
    }

    init() {
        // this.ui.pushMessage("BUILDING WORLD...", "#FFF");
        window.setTimeout(this.gameLoop, 10);
        // this.environment = new Environment(128, 0.00000000000001, 0.00000000001);
        // this.environment = new Environment(128, 0.00001, 0.00001);
        // this.environment = new Environment(128, 0, 0);
        this.environment = new Environment(256,256);
        this.environment.init();
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
        this.environment.draw(this.ctx);
        this.entities.sort((a,b) => {return (a.constructor.name < b.constructor.name) ? 1: -1})
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].draw(this.ctx);
        }
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    remove(entity) {
        this.toRemove.push(entity);
    }
}