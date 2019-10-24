class Environment {
    constructor(size) {
        this.size = size;
        this.nutrients = new Array(size * size);
        this.nutrients_last = new Array(size * size);
        this.flip = false;
        this.amount = 20000000;
    }

    init() {
        let x, y, i, total = 0;
        for(y = 0; y < this.size; y++) {
            for (x = 0; x < this.size; x++) {
                i = Math.random() * 255 | 0;
                this.nutrients[this.ix(x,y)] = i;
                total += i;
            }
        }
        this.reset(total);   
    }

    reset(total) {
        for (let i = 0; i < this.size * this.size; i++) {
            this.nutrients[i] /= total/this.amount;
            this.nutrients_last[i] = this.nutrients[i];
        }
    }

    ix(x,y) {
        return (x+y*this.size);
    }

    update(dt) {
        let rate = 0.000001;
        if (this.flip) {
            this.diffuse(this.nutrients, this.nutrients_last, rate, dt);
        } else {
            this.diffuse(this.nutrients_last, this.nutrients, rate, dt);
        }
        this.flip = !this.flip;
    }

    addPos(arr, i, j, a) {
        let ret = 0, count = 0;
        if (i > 0) { ret += arr[this.ix(i - 1, j)]; count++}
        if (i < this.size - 1) { ret += arr[this.ix(i + 1, j)]; count++}
        if (j > 0) { ret += arr[this.ix(i, j - 1)]; count++}
        if (j < this.size - 1) { ret += arr[this.ix(i, j + 1)]; count++}

        return (arr[this.ix(i,j)] + ret * a) / (a * count + 1);
    }

    diffuse(x, x0, diff, dt) {
        let a = dt * diff * (this.size - 2) * (this.size - 2);
        let i, j;
        for (j = 0; j < this.size; j++) {
            for (i = 0; i < this.size; i++) {
                x[this.ix(i,j)] = this.addPos(x0, i, j, a);
            }
        }
    }

    draw(imageData, size) {
        let i,j;
        var count = 0;
        for (i = 0, j = 0; i < size; i += 4, j++) {
            count += this.nutrients[j];
            imageData.data[i+0] = this.nutrients[j];
            imageData.data[i+1] = 0;
            imageData.data[i+2] = 0;
            imageData.data[i+3] = 255;
        }
        if (Math.abs(count - this.amount) > 1) {
            this.reset(count);
        }
    }

    get(x,y) {
        return this.nutrients[this.ix(x,y)];
    }

    set(x, y, amt) {
        this.nutrients[this.ix(x,y)] += amt;
        this.amount += amt;
    }
}