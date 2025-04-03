import { ProcessorFactory } from "./ProcessorFactory.js";

async function main() {
	const processorFactory = new ProcessorFactory();
	const processor = processorFactory.create('doubling', 'f32', (data) => {
		const result = new Float32Array(data.length);
		for (let i = 0; i < data.length; i++) {
			result[i] = data[i] * 2;
		}
		return result;
	}, `
		data[i] = data[i] * 2.0;
	`);

	for (let inputSize = 1; inputSize <= 1e7; inputSize *= 10) {
		const input = new Float32Array(inputSize);
		for (let i = 0; i < inputSize; i++) {
			input[i] = i;
		}

		const result = await processor.run(input);
		console.log('input', input);
		console.log('result', result);
	}
}

main();
