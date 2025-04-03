import { perlin2 } from "./perlin.js";

export function createImageData(width, height) {
	const data = new Uint8Array(width * height * 4);

	let min = Infinity;
	let max = -Infinity;
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const v = 127 * perlin2(x / 50, y / 50) + 128;
			min = Math.min(min, v);
			max = Math.max(max, v);
			for (let c = 0; c < 3; c++) {
				data[4 * (y * width + x) + c] = v;
			}
			data[4 * (y * width + x) + 3] = 255;
		}
	}
	console.log("min", min, "max", max)

	return {
		width: width,
		height: height,
		data,
	}
}
