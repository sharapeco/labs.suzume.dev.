export function test1(target) {
	const text = "あー「縦書きABC 012」";
	const fontSize = 20;

	const canvas = document.querySelector(target);
	canvas.style.writingMode = "vertical-rl";

	const ctx = canvas.getContext("2d");
	ctx.font = `${fontSize}px/1 'Hiragino Kaku Gothic', sans-serif`;
	ctx.fillText(text, 10, 30);

	ctx.strokeStyle = "#00f8";
	ctx.strokeWidth = 1;
	ctx.strokeRect(10, 30 - fontSize, fontSize * text.length, fontSize);

	ctx.fillStyle = "#fa0";
	ctx.beginPath();
	ctx.ellipse(10, 30, 4, 4, 0, 0, Math.PI * 2);
	ctx.fill();
}

export function test2(target) {
	const text = "あー「縦書きABC 012」";
	const fontSize = 20;

	const canvas = document.querySelector(target);
	canvas.style.writingMode = "vertical-rl";

	const ctx = canvas.getContext("2d");
	ctx.font = `${fontSize}px/1 'Hiragino Kaku Gothic', 'Meiryo', sans-serif`;
	ctx.textBaseline = "middle";
	ctx.fillText(text, 10, 30);

	ctx.strokeStyle = "#00f8";
	ctx.strokeWidth = 1;
	ctx.strokeRect(10, 30 - fontSize / 2, fontSize * text.length, fontSize);

	ctx.fillStyle = "#fa0";
	ctx.beginPath();
	ctx.ellipse(10, 30, 4, 4, 0, 0, Math.PI * 2);
	ctx.fill();
}

/** @type {"vertical" | "horizontal" | undefined} */
let verticalRenderingType;

/**
 * Canvas に writingMode = "vertical-rl" を設定したときに
 * テキストが縦方向に描画される (vertical) か、
 * それとも反時計回りに90度回転して描画される (horizontal) かを検出する
 */
export function detectVerticalRenderingType(aCanvas) {
	if (verticalRenderingType) {
		return verticalRenderingType;
	}

	const canvas = aCanvas ?? document.createElement("canvas");
	canvas.width = 10;
	canvas.height = 5;
	canvas.style.writingMode = "vertical-rl";

	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, 10, 5);
	ctx.font = "10px/1 'Hiragino Kaku Gothic', 'Meiryo', sans-serif";
	ctx.fillText("鬼", 0, 10);

	const imageData = ctx.getImageData(0, 0, 10, 5);
	const data = imageData.data;
	for (let i = 0; i < data.length; i += 4) {
		if (data[i + 3] >= 32) {
			verticalRenderingType = "horizontal";
			return "horizontal";
		}
	}
	verticalRenderingType = "vertical";
	return "vertical";
}

/**
 * @typedef {Object} DrawVerticalTextStyles
 * @property {string} [fillStyle]
 * @property {string} [font]
 * @property {string} [fontKerning]
 * @property {string} [fontStretch]
 * @property {string} [fontVariantCaps]
 * @property {string} [letterSpacing]
 * @property {string} [textAlign]
 */

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string} text
 * @param {number} x 始点のx座標（文字の中央の位置）
 * @param {number} y 始点のy座標
 * @param {DrawVerticalTextStyles} [styles]
 */
export function drawVerticalText(canvas, text, x, y, styles = {}) {
	const type = detectVerticalRenderingType();

	const vCanvas = document.createElement("canvas");
	vCanvas.width = canvas.width;
	vCanvas.height = canvas.height;
	const style = vCanvas.style;
	style.writingMode = "vertical-rl";
	style.position = "absolute";
	style.left = "-1000px";
	style.top = "0";
	style.visibility = "hidden";

	// DOM上に配置されていないと "vertical-rl" が反映されない
	document.body.appendChild(vCanvas);

	const vCtx = vCanvas.getContext("2d");
	for (const key in styles) {
		vCtx[key] = styles[key];
	}
	vCtx.textBaseline = "middle";

	if (type === "vertical") {
		vCtx.fillText(text, x, y);
	} else {
		vCtx.transform(0, 1, -1, 0, x + y, y - x);
		vCtx.fillText(text, x, y);
	}

	const ctx = canvas.getContext("2d");
	ctx.drawImage(vCanvas, 0, 0);

	vCanvas.remove();
}

export function test3(target) {
	const text = "あー「縦書きABC 012」";
	const fontSize = 20;

	const canvas = document.querySelector(target);
	const ctx = canvas.getContext("2d");

	drawVerticalText(canvas, text, 20, 10, {
		font: `${fontSize}px/1 'Hiragino Kaku Gothic', 'Meiryo', sans-serif`,
	});

	ctx.strokeStyle = "#00f8";
	ctx.strokeWidth = 1;
	ctx.strokeRect(10, 10, fontSize, fontSize * text.length);

	ctx.fillStyle = "#fa0";
	ctx.beginPath();
	ctx.ellipse(20, 10, 4, 4, 0, 0, Math.PI * 2);
	ctx.fill();
}
