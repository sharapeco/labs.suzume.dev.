import { createElementWithRef as h } from "..//assets/js/createElement.js";
import { createDropArea } from "/assets/js/createDropArea.js";

/**
 * @typedef {Object} State
 * @property {ImageData | null} imageData
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} xGap
 * @property {number} yGap
 * @property {number} scale
 *
 * @type {State}
 */
const state = {
	imageData: null,
	x: 188,
	y: 232,
	width: 18,
	height: 18,
	xGap: 112,
	yGap: 112,
	scale: 8,
};

const dropArea = createDropArea({
	onDrop: async (files) => {
		const file = files[0];
		const image = await readImage(URL.createObjectURL(file));
		dropArea.style.backgroundImage = `url(${image.src})`;
		const data = getImageData(image);
		state.imageData = data;
		update();
	},
});

const { element: controller } = h("fieldset", {}, [
	h("legend", {}, "設定"),
	createInput("x", "x", { type: "number", onUpdate: update }),
	createInput("y", "y", { type: "number", onUpdate: update }),
	createInput("幅", "width", { type: "number", inputAttributes: { min: 1 }, onUpdate: update }),
	createInput("高さ", "height", { type: "number", inputAttributes: { min: 1 }, onUpdate: update }),
	createInput("横の間隔", "xGap", { type: "number", onUpdate: update }),
	createInput("縦の間隔", "yGap", { type: "number", onUpdate: update }),
	createInput("元画像の倍率", "scale", { type: "number", inputAttributes: { min: 1, max: 10, step: 1 }, onUpdate: update }),
]);

const { element: statusLine } = h("div", { class: "status-line" });

const { element: output } = h("div", { class: "output" });

document.body.append(dropArea, controller, statusLine, output);

function createInput(label, name, options = {}) {
	const initialValue = state[name];
	const type = options.type ?? "text";
	const inputAttributes = options.inputAttributes ?? {};

	const { element, refs } = h("div", { class: "form-group" }, [
		h("label", {}, [label]),
		h("input", { ...inputAttributes, type, value: initialValue, ref: "input" }),
	]);

	const { input } = refs;
	input.addEventListener("input", () => {
		let value = input.value;
		switch (type) {
			case "number":
				value = Number.parseFloat(value);
				break;
		}
		state[name] = value;
		options.onUpdate?.({ [name]: value });
	});

	return element;
}

function readImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

function getImageData(image) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width = image.width;
	canvas.height = image.height;
	ctx.drawImage(image, 0, 0);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * @param {State} state
 * @param {number} ix
 * @param {number} iy
 * @returns {Promise<HTMLCanvasElement>}
 */
async function getPixelImage(state, ix, iy) {
	const { imageData, x: srcX, y: srcY, width, height, xGap, yGap, scale } = state;
	const srcData = imageData.data;
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(width);
	canvas.height = Math.round(height);
	const ctx = canvas.getContext("2d");
	const dest = ctx.createImageData(canvas.width, canvas.height);
	const destData = dest.data;
	const offsetX = srcX + ix * (width * scale + xGap);
	const offsetY = srcY + iy * (height * scale + yGap);
	/** scale > 1 の場合、ピクセルの中央からサンプリングする */
	const pixelOffset = scale >> 1;
	for (let y = 0; y < canvas.height; y++) {
		for (let x = 0; x < canvas.width; x++) {
			const si = ((offsetY + y * scale + pixelOffset) * imageData.width + (offsetX + x * scale + pixelOffset)) * 4;
			const di = (y * canvas.width + x) * 4;
			destData[di + 0] = srcData[si + 0];
			destData[di + 1] = srcData[si + 1];
			destData[di + 2] = srcData[si + 2];
			destData[di + 3] = srcData[si + 3];
		}
	}
	const bitmap = await createImageBitmap(dest);
	ctx.drawImage(bitmap, 0, 0);
	bitmap.close();
	return canvas;
}

async function update() {
	if (!state.imageData) {
		return;
	}

	const cw = state.imageData.width;
	const ch = state.imageData.height;
	// x, y のスプライト数
	const nx = Math.floor((cw - state.x + state.xGap) / (state.width * state.scale + state.xGap));
	const ny = Math.floor((ch - state.y + state.yGap) / (state.height * state.scale + state.yGap));

	statusLine.textContent = `画像サイズ (${cw}, ${ch}) / スプライトソースサイズ (${state.width * state.scale}, ${state.height * state.scale}) / スプライト数 (${nx}, ${ny})`;

	output.style.gridTemplateColumns = `repeat(${nx}, ${state.width * state.scale}px)`;
	output.innerHTML = "";

	for (let iy = 0; iy < ny; iy++) {
		for (let ix = 0; ix < nx; ix++) {
			const i = iy * nx + ix;
			const destCanvas = await getPixelImage(state, ix, iy);
			destCanvas.style.width = `${state.width * state.scale}px`;
			destCanvas.style.height = `${state.height * state.scale}px`;
			const link = document.createElement("a");
			link.href = destCanvas.toDataURL();
			link.download = `output_${i}.png`;
			link.appendChild(destCanvas);
			output.appendChild(link);
		}
	}
}

async function main() {
	const srcImage = await readImage("example.jpg");
	const srcData = getImageData(srcImage);
	state.imageData = srcData;
	dropArea.style.backgroundImage = `url(${srcImage.src})`;
	update();
}

main();
