const output = document.getElementById("output");

class Base {
	constructor(name) {
		this.name = name;
	}
}

/**
 * @param {function} Base
 */
function greetable(Base) {
	return class extends Base {
		greet() {
			return `Hello, ${this.name}!`;
		}
	}
}

function sayable(Base) {
	return class extends Base {
		say() {
			return `こんにちは、${this.name} さん。`;
		}
	}
}

const GreetableBase = greetable(Base);

const obj = new GreetableBase("John");
const greet = obj.greet();

output.textContent += `[GreetableBase]\ngreet() → ${greet}\n\n`;

const GreetableSayableBase = sayable(greetable(Base));

const obj2 = new GreetableSayableBase("花子");
const greet2 = obj2.greet();
const say = obj2.say();

output.textContent += `[GreetableSayableBase]\ngreet() → ${greet2}\nsay() → ${say}\n`;
