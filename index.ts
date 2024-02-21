const tokens = {
	"f:": "Field",
  // "js:": "Javascript", // TODO
	"=": "Operator:EQ",
	">": "Operator:GT",
	"<": "Operator:LT",
	"&": "AND",
	"|": "OR",
};
const tokenNamesToTokens = {
  // "Javascript": "js:", // TODO
	"Field": "f:",
	"Operator:EQ": "=",
	"Operator:GT": ">",
	"Operator:LT": "<",
	"AND": "&",
	"OR": "|",
};

function parseQuery(value: string) {
	let i = 0;
	let strippedIndex = 0;
	const expressions: any[] = [];

	while (i < value.length) {
		if (value[i] == ":") {
			const token = value.substring(strippedIndex, i + 1);
			if (!(token in tokens)) break;
			strippedIndex = i + 1;

			while (i < value.length) {
				if (!(value[i] in tokens)) i++;
				else break;
			}
			const operator = value[i];

			const field = value.substring(strippedIndex, i);
			strippedIndex = i;
			i++;
			while (
				!(value[i] in tokens) &&
				value[i] != ":" &&
				value.length > i
			) {
				i++;
			}
			let hasFieldRef = false;

			if (value.substring(strippedIndex + 1, i + 1) == "f:") {
				hasFieldRef = true;
				strippedIndex += 2;
				i++;
				while (
					!(value[i] in tokens) &&
					value[i] != ":" &&
					value.length > i
				) {
					i++;
				}
			}
			let fieldRef = hasFieldRef
				? value.substring(strippedIndex + 1, i)
				: value.substring(strippedIndex + 1, i);

			expressions.push({
				isReference: hasFieldRef,
				fieldName: field,
				operator: tokens[operator],
				value: fieldRef,
			});
			if (value[i] in tokens) {
				expressions.push({
					operator: tokens[value[i]],
				});
			}
			i++;
			strippedIndex = i;
		}
		i++;
	}
	return expressions;
}

function applyQuery(expressions: any[], sampleData: any) {
	let validity: (boolean | "|")[] = [];
	let index = 0;
	let falseCount = 0;
	let trueCount = 0;
	expressions.forEach((ex) => {
		let value;
		switch (tokenNamesToTokens[ex.operator]) {
			case "=":
				value = sampleData[ex.fieldName];
				if (ex.value != value) falseCount++;
				else trueCount++;
				break;
			case ">":
				value = sampleData[ex.fieldName];
				if (!(parseFloat(ex.value) < value)) falseCount++;
				else trueCount++;
				break;
			case "<":
				value = sampleData[ex.fieldName];
				if (!(parseFloat(ex.value) > value)) falseCount++;
        else trueCount++
				break;
			case "&":
				break;
			case "|":
				validity.push(falseCount == 0);
				index++;
				validity.push("|");
				falseCount = 0;
        trueCount = 0;
				break;
		}
	});
	if (index == 0 || trueCount > 0) return falseCount == 0;
	else {
		let breakpoint = 0;
		for (let i = 0; i < validity.length; i++) {
			if (validity[i] != "|") {
				continue;
			}
			// check last values are true
			let tempI = i;
			while (tempI >= breakpoint) {
				if (validity[tempI] === true) return true;
				tempI--;
			}
			breakpoint = i;
		}
		return false;
	}
}

// const query = "f:name=Prajwal&f:age>15|f:movie=ninja&f:age=23";
const query = "f:age>15|f:movie=ninja";
const expression = parseQuery(query);

const sampleData = [
	{
	  name: "Prajwal Aradhya",
	  age: 30,
	  movie: "Fast and furious"
	},
	{
	  name: "Yashas",
	  age: 23,
	  movie: "ninja"
	},
	{
		name: "Renu",
		age: 14,
		movie: "ninsja",
	},
];

console.log(sampleData.filter((d) => applyQuery(expression, d)));