class Genes {
    constructor(inputWeights, hiddenWeights) {
        this.inputWeights = inputWeights; // An array
        this.hiddenWeights = hiddenWeights; // An array
    }

    static create(inputWeights, hiddenWeights) {
        let obj = new Genes(inputWeights, hiddenWeights);
        return obj;
    }

    static createRandom(inputs, hidden, outputs, min, max) {
        if (min == undefined) min = 0;
        if (max == undefined) max = 1;
        return Genes.create(
            Genes.createRandomArray(inputs, hidden, min, max),
            Genes.createRandomArray(hidden, outputs, min, max));
    }

    static createRandomArray(nodes, connections, min, max) {
        let arr = new Array(nodes);
        if (min == undefined) min = 0;
        if (max == undefined) max = 1;
        for (let i = 0; i < nodes; i++) {
            arr[i] = new Array(connections);
            for (let j = 0; j < connections; j++) {
                arr[i][j] = Math.random()*(max + min) - min;
            }
        }
        return arr;
    }

    mutate(amount) {
        if (amount === undefined) amount = 0.05;
        let i,j;
        for (i = 0; i < this.inputWeights.length; i++) {
            for (j = 0; j < this.inputWeights[i].length; j++) {
                this.inputWeights[i][j] += (Math.random()*2-1)*amount
            }
        }
        for (let i = 0; i < this.hiddenWeights.length; i++) {
            for (let j = 0; j < this.hiddenWeights[i].length; j++) {
               this.hiddenWeights[i][j] += (Math.random()*2-1)*amount
            }
        }
    }
}