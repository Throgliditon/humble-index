const factorData = {
	names: [
		{name: "Lowest price", value: "min-price", types: [0, 1, 2, 3, 4]},
		{name: "Price at bundle release", value: "curr-price", types: [0, 1, 2, 3, 4]},
		{name: "Min. return on investment", value: "min-roi", types: [6, 7, 8]},
		{name: "Curr. return on investment", value: "curr-roi", types: [6, 7, 8]},
		{name: "Age", value: "age", types: [0, 1, 2, 3, 4]},
		{name: "Main game time", value: "time", types: [0, 1, 2, 3, 4]},
		{name: "Main+ game time", value: "timep", types: [0, 1, 2, 3, 4]},
		{name: "Completionist game time", value: "timepp", types: [0, 1, 2, 3, 4]},
		{name: "Positivity", value: "positivity", types: [0, 1, 3, 4]},
		{name: "Is sequal", value: "is-sequal", types: [0]},
		{name: "Has a sequal", value: "has-sequal", types: [0]},
		{name: "Has DLCs", value: "has-dlcs", types: [0]},
		{name: "Peak players", value: "peak-players", types: [0, 1, 2, 3, 4]},
		{name: "Players at bundle release", value: "average-players", types: [0, 1, 2, 3, 4]},
		{name: "Amount of games", value: "amount", types: [5]},
	],
	types: [
		{name: "Mean", value: "mean"},
		{name: "Median", value: "median"},
		{name: "Sum", value: "sum"},
		{name: "Lowest", value: "low"},
		{name: "Highest", value: "high"},
		{name: "Constant", value: "constant"},
		{name: "Classic", value: "classic"},
		{name: "Basic", value: "basic"},
		{name: "Premium", value: "premium"}
	]
}

class Chart {
	constructor() {
		this.options = {
			showPoint: false,
			lineSmooth: false,
			axisX: {
				showGrid: false
			},
			axisY: {
				showLabel: false
			},
			fullWidth: true,
			low: 50,
			high: 150,
			height: document.body.clientWidth < 550 ? 300: 400
		};
		this.responsiveOptions = [
			['screen and (max-width: 640px)', {
				axisX: {
					labelInterpolationFnc: function(value) {
						return value[0];
					}
				}
			}]
		];
		this.once = false;
		this.index = 0;

		document.getElementsByTagName("body")[0].addEventListener("click", () => document.getElementById("games-popup").classList.add("hide"));
	}

	draw(data) {
		if(this.chart) return this.chart.update(data);

		this.chart = new Chartist.Line('.ct-chart', data, this.options, this.responsiveOptions);
		this.chart.on("created", () => {
			const fObjs = document.getElementsByClassName("ct-labels")[0].getElementsByTagName("foreignObject");
			
			for(let i = 0; i < fObjs.length; i++) {
				fObjs[i].addEventListener("click", () => {
					this.index = i;

					this.update(factors.values);
				});
				fObjs[i].addEventListener('contextmenu', event => {
					const popup = document.getElementById("games-popup");
					popup.classList.remove("hide");
					popup.innerHTML = humbleData[i].games.join(", ");
					popup.style.top = `${event.pageY}px`;
					popup.style.left = `${event.pageX}px`;
					event.preventDefault();
				  }, false);
			}

			const line = document.getElementsByClassName("ct-series-a")[0];

			if(this.once)  {
				line.style.cssText = `stroke-dashoffset: 0;`;
				return line.classList.remove("first");
			}
			this.once = true;

			line.style.cssText = `stroke-dasharray: ${humbleData.length * 40}%;stroke-dashoffset: ${humbleData.length * 40}%;`;
			line.classList.add("first");
		});
	}

	update(factors) {
		const data = [];
		const labels = [];
		let points = [];

		for(const moment of humbleData) {
			labels.push(moment.name);

			factors.forEach((factor, index) => {
				let value;

				switch(factor.name) {
					case "min-roi":
					case "curr-roi":
						if(moment.choice) value = moment.data[factor.name][factorData.types.findIndex(type => type.value === factor.type) - 6];
						else value = moment.data[factor.name][0];
						break;
					case "amount":
						value = moment.data[factor.name][0];
						break;
					default:
						value = moment.data[factor.name][factorData.types.findIndex(type => type.value === factor.type)];
						break;
				}

				if(data[index] === undefined) data[index] = [value];
				else data[index].push(value); 
			});
		}

		factors.forEach((factor, index) => {
			const datum = data[index];
			const max = datum.reduce((high, value) => high > value ? high : value, 0);

			datum.forEach((value, index) => {
				value = (value / max) * factor.weight;
				//console.log(value);
				if(points[index] === undefined) points[index] = factor.effect ? value : -value;
				else points[index] = factor.effect ? points[index] + value : points[index] - value;
			});
		});

		const base = points[this.index];
		const max = points.reduce((high, value) => high > value ? high : value, -1000000);
		const min = points.reduce((low, value) => low < value ? low : value, 1000000);

		if(Math.abs(base - max) > Math.abs(base - min)) {
			const step = Math.abs(base - max) / 40;
			points = points.map(point => point = (point - base) / step + 100);
		}
		else {
			const step = Math.abs(base - min) / 40;
			points = points.map(point => point = (point - base) / step + 100);
		}
		
		this.draw({labels, series: [points]});
	}
}

class Factors {
	constructor() {
		this.values = [];

		document.getElementById("factor-add-button").addEventListener("click", () => {
			this.create();
		});

		document.getElementById("factors-1").addEventListener("click", () => {
			const values = [{"index":"3opr3t","name":"min-roi","type":"classic","weight":"20","effect":true},{"index":"urrdtx","name":"curr-roi","type":"classic","weight":"5","effect":true},{"index":"pfsrxa","name":"timep","type":"median","weight":"6","effect":true},{"index":"o9t0ee","name":"positivity","type":"median","weight":"10","effect":true}];
			this.set(values);
		});

		document.getElementById("factors-2").addEventListener("click", () => {
			const values = [{"index":"r03yph","name":"timep","type":"sum","weight":"10","effect":true},{"index":"ob1rim","name":"positivity","type":"mean","weight":"20","effect":true},{"index":"cib36x","name":"positivity","type":"median","weight":"10","effect":true},{"index":"uofenq","name":"age","type":"median","weight":"5","effect":false},{"index":"w45hcb","name":"is-sequal","type":"mean","weight":"5","effect":false},{"index":"tf10sl","name":"has-sequal","type":"mean","weight":"5","effect":false},{"index":"x33xyu","name":"has-dlcs","type":"mean","weight":"5","effect":false}];
			this.set(values);
		});

		document.getElementById("factors-3").addEventListener("click", () => {
			const values = [{"index":"0gc9zg","name":"is-sequal","type":"mean","weight":"30","effect":false},{"index":"bvqhy","name":"has-sequal","type":"mean","weight":"20","effect":false},{"index":"aoo74e","name":"has-dlcs","type":"mean","weight":"30","effect":false},{"index":"g7pa0b","name":"average-players","type":"median","weight":"10","effect":false},{"index":"fw2lg","name":"average-players","type":"mean","weight":"20","effect":false},{"index":"7hljgl","name":"peak-players","type":"median","weight":"10","effect":false},{"index":"jn3khp","name":"peak-players","type":"mean","weight":"30","effect":false}];
			this.set(values);
		});

		document.getElementById("factors-copy").addEventListener("click", () => {
			navigator.clipboard.writeText(JSON.stringify({values: this.values}));
		});

		document.getElementById("factors-paste").addEventListener("click", () => {
			navigator.clipboard.readText().then(text => {
				try {
					const values = JSON.parse(text).values;
					
					this.set(values);
				} catch(e) {
					console.error(e)
				}
			});
		});

		document.getElementById("factors-empty").addEventListener("click", () => {
			this.clear();
		});
	}

	set(values) {
		this.clear();

		for(const value of values) this.create(value);
	}

	clear() {
		for(const value of this.values) {
			document.getElementsByClassName("factors")[0].removeChild(document.getElementById(`factor-${value.index}`));
		}

		this.values = [];
	}

	update(index) {
		const name = document.getElementById(`factor-name-${index}`).value;
		const type = document.getElementById(`factor-type-${index}`).value;
		const weight = document.getElementById(`factor-weight-${index}`).value;
		const effect = document.getElementById(`factor-effect-${index}`).checked;
		
		if(this.values.find(value => value.index === index)) {
			this.values = this.values.map(value => value.index === index ? {index, name, type, weight, effect} : value);
		}
		else {
			this.values.push({index, name, type, weight, effect});
		}

		chart.update(this.values);
	}

	create({index = Math.random().toString(36).substring(7), name = "min-price", type = "mean", weight = "1", effect = true} = {}) {
		const element = document.createElement("div");
		element.className = "factor";
		element.id = `factor-${index}`;

		const icon = document.createElement("div");
		icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/></svg>`;
		icon.className = "factor-icon delete";
		icon.addEventListener("click", () => {
			document.getElementsByClassName("factors")[0].removeChild(element);
			this.values = this.values.filter(value => value.index !== index);
			chart.update(this.values);
		});
		element.appendChild(icon);

		const nameElement = document.createElement("select");
		nameElement.className = "factor-name";
		nameElement.id = `factor-name-${index}`;
		nameElement.addEventListener("change", event => {
			const value = event.target.value;
			const type = nameElement.parentElement.getElementsByClassName("factor-type")[0];
			type.innerHTML = "";
			const nameData = factorData.names.find(name => name.value === value);

			for(const optionData of nameData.types.map(type => factorData.types[type])) {
				const option = document.createElement("option");
				option.value = optionData.value;
				option.innerText = optionData.name;
				type.appendChild(option);
			}

			this.update(index);
		});

		for(const optionData of factorData.names) {
			const option = document.createElement("option");
			option.value = optionData.value;
			option.innerText = optionData.name;
			nameElement.appendChild(option);
		}

		element.appendChild(nameElement);
		nameElement.selectedIndex = factorData.names.findIndex(nameData => nameData.value === name);
		
		const typeElement = document.createElement("select");
		typeElement.className = "factor-type";
		typeElement.id = `factor-type-${index}`;
		typeElement.value = type;
		typeElement.addEventListener("change", () => {
			this.update(index);
		});

		for(const optionData of factorData.names.find(nameData => nameData.value === name).types.map(type => factorData.types[type])) {
			const option = document.createElement("option");
			option.value = optionData.value;
			option.innerText = optionData.name;
			typeElement.appendChild(option);
		}

		element.appendChild(typeElement);
		typeElement.selectedIndex = factorData.names.find(nameData => nameData.value === name).types.findIndex(index => factorData.types[index].value === type);
		if(typeElement.selectedIndex < 0) typeElement.selectedIndex = 0;

		const weightElement = document.createElement("div");
		weightElement.className = "factor-weight";

		const weightInput = document.createElement("input");
		weightInput.id = `factor-weight-${index}`;
		weightInput.type = "range";
		weightInput.min = "1";
		weightInput.max = "99";
		weightInput.value = weight;
		weightInput.addEventListener("input", event => {
			document.getElementById(`factor-weightvalue-${index}`).innerText = event.target.value;

			this.update(index);
		});
		weightElement.appendChild(weightInput);

		const weightValue = document.createElement("span");
		weightValue.id = `factor-weightvalue-${index}`;
		weightValue.innerText = weight;
		weightElement.appendChild(weightValue);
		element.appendChild(weightElement);

		const effectElement = document.createElement("div");
		effectElement.className = "factor-effect";
		effectElement.appendChild(document.createTextNode("negative"));
		
		const label = document.createElement("label");
		label.className = "switch";

		const input = document.createElement("input");
		input.type = "checkbox";
		input.checked = effect;
		input.id = `factor-effect-${index}`;
		input.addEventListener("change", () => {
			this.update(index);
		});
		label.appendChild(input);

		const slider = document.createElement("span");
		slider.className = "slider";
		label.appendChild(slider);
		effectElement.appendChild(label);
		effectElement.appendChild(document.createTextNode("positive"));
		element.appendChild(effectElement);
		
		document.getElementsByClassName("factors")[0].insertBefore(element, document.getElementById("factor-add"));

		this.update(index);
	}
}

const chart = new Chart();
const factors = new Factors();
factors.create();