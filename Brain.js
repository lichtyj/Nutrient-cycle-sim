class Brain {
    constructor(genes) {
		this.inputs = new Array(13);
		this.inputWeights = genes.inputWeights; // needs to be array of arrays
            // 		Food
            // 1		left
            // 2		right
            // 3		forward
            // 4		current
            // 		Waste
            // 5		left
            // 6		right
            // 7		forward
            // 8		current
            // 9	Last direction
            // 10	Length
            // 11	Waste
            // 12	Nutrition
            // 13	Mem (undefined)
		this.hidden = new Array(6);
		this.hiddenWeights = genes.hiddenWeights; // needs to be array of arrays
			// Get input
			// Summation -> sigmoid
			// Output to each connection * connection weight
        this.outputs = new Array(6)
            // 		Move
            // 1		left
            // 2		right
			// 3		forward
            // 4	Poop
            // 5	Split
            // 6	Mem


    }

    static create(genes) {
		let obj = new Brain(genes);
		obj.init();
        return obj;
    }

    init() {
        let i;
        for (i = 0; i < this.outputs.length; i++) {
			this.outputs[i] = {'value': 0};
		}
		for (i = 0; i < this.hidden.length; i++) {
			this.hidden[i] = new Node(this.outputs,this.hiddenWeights);
		}
		for (i = 0; i < this.inputs.length; i++) {
			this.inputs[i] = new Node(this.hidden,this.inputWeights);
		}
		console.log("inputs: " + this.inputs.length);
	}
	
	think(senses) {
		let i;
		let out = '';

		for (i = 0; i < this.inputs.length; i++) {
			this.inputs[i].value = senses[i];
			this.inputs[i].output();
			out += senses[i] + ', ';
		}
		console.log('Inputs: ' + out);
		out = '';
		for (i = 0; i < this.hidden.length; i++) {
			this.hidden[i].output();
			out += this.hidden[i].value + ', ';
		}
		console.log('Hidden: ' + out);
		out = '';
		for (i = 0; i < this.hidden.length; i++) {
			out += this.outputs[i].value + ', ';
		}
		console.log('Outputs: ' + out);
	}

}

class Node {
	constructor(connections, weights) {
		this.value = 0;
		this.connections = connections;
		this.weights = weights;
	}

	output() {
		console.log(this.value);
		this.value = 1/(1+Math.pow(Math.E,-this.value));
		console.log(this.value);
		for (let i = 0; i < this.connections.length; i++) {
			console.log("Connection[" + i+"]: " + this.connections[i].value);
			this.connections[i].value += this.value * this.weights[i];
			console.log("Connection[" + i+"]: " + this.connections[i].value);
		}
		this.value = 0;
	}

}