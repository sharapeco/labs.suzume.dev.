import { createCanvas, getConfig } from "./common.js";
import { createImageData } from "./createImageData.js";
import { seed } from "./perlin.js";

seed(Math.random());

const config = getConfig();
const bitmap = createImageData(config.width, config.height);

function a(container, bitmap) {
	const canvas = createCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext("2d");
	const imageData = ctx.createImageData(bitmap.width, bitmap.height);
	imageData.data.set(bitmap.data);
	ctx.putImageData(imageData, 0, 0);

	container.appendChild(canvas);
}

function b(container, bitmap, divWidth) {
	for (let offsetX = 0; offsetX < bitmap.width; offsetX += divWidth) {
		const nextX = Math.min(offsetX + divWidth, bitmap.width);
		const width = nextX - offsetX;
		const height = bitmap.height;
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		const imageData = ctx.createImageData(width, height);
		for (let y = 0; y < height; y++) {
			for (let x = offsetX; x < nextX; x++) {
				for (let c = 0; c < 4; c++) {
					imageData.data[4 * (y * width + x - offsetX) + c] = bitmap.data[4 * (y * bitmap.width + x) + c];
				}
			}
		}
		ctx.putImageData(imageData, 0, 0);
		container.appendChild(canvas);
	}
}

const t0 = performance.now();
try {
	a(document.getElementById('a'), bitmap);
} catch (e) {
	console.error(e);
}

const t1 = performance.now();
console.log("a", t1 - t0);

try {
	b(document.getElementById('b'), bitmap, config.divWidth);
} catch (e) {
	console.error(e);
}

const t2 = performance.now();
console.log("b", t2 - t1);
