import { WasmFFTCalculator, generateWindowValues } from "./fft/fft.js";

let N;
let fft;
let win;
let cm;

console.log("[Worker] loaded");

// biome-ignore lint/suspicious/noGlobalAssign: Workerのため許可
onmessage = function onmessage(event) {
	const { type } = event.data;
	console.log(`[Worker] received ${type}`);

	try {
		switch (type) {
			case "init":
				init(event.data);
				break;
			case "process":
				process(event.data);
				break;
		}
	} catch (err) {
		console.error("[Worker] error in onmessage");
		postMessage({ type: "error", message: err.message });
	}
};

// biome-ignore lint/suspicious/noGlobalAssign: Workerのため許可
onerror = function onerror(event) {
	console.error(`[Worker] error: ${event.message}`);
};

/**
 * FFT計算機、窓関数、カラーマップを初期化する
 * 完了後、ready メッセージを送信する
 *
 * @param {*} param0
 */
async function init({ fftSize, windowType, colorMap }) {
	console.log(`[Worker] init (FFTSize: ${fftSize}, WindowType: ${windowType}, ColorMap: ${colorMap.slice(0, 4)})`);
	N = fftSize;
	fft = new WasmFFTCalculator();
	win = generateWindowValues(windowType, fftSize);
	cm = colorMap;
	await fft.init(fftSize);
	postMessage({ type: "ready" });
}

/**
 * FFT計算機を使用して、バッファーのデータをFFT計算する
 * 計算結果をカラーマップに適用して、キャンバスに描画する
 *
 * @param {Object} p0
 * @param {HTMLCanvasElement} p0.canvas キャンバス
 * @param {Float32Array} p0.buffer バッファー
 * @param {number[]} p0.samplePoints 描画するサンプルポイント
 * @param {number} p0.decibelOffset デシベルオフセット
 * @param {number} p0.minDecibel 最小デシベル
 * @param {number} p0.maxDecibel 最大デシベル
 */
async function process({
	canvas,
	buffer,
	samplePoints,
	decibelOffset,
	minDecibel,
	maxDecibel,
}) {
	const { width, height } = canvas;
	const ctx = canvas.getContext("2d");
	const imageData = ctx.createImageData(width, height);

	const amplitude = 255 / (maxDecibel - minDecibel);

	for (let x = 0; x < samplePoints.length; x++) {
		const start = samplePoints[x];
		const buf = new Float32Array(N);
		for (let j = 0; j < N; j++) {
			buf[j] = (buffer[start + j] ?? 0) * win[j];
		}

		const spectrum = fft.calc(buf);

		const magnitude = new Float32Array(N / 2);
		const Nhalf = N / 2;
		for (let i = 0; i < Nhalf; i++) {
			const real = spectrum[2 * i];
			const imag = spectrum[2 * i + 1];
			magnitude[i] = Math.sqrt(real * real + imag * imag);
		}

		const decibels = new Float32Array(Nhalf);
		for (let i = 0; i < Nhalf; i++) {
			decibels[i] = 10 * Math.log10(magnitude[i]) + decibelOffset;
		}

		const ranks = new Uint8ClampedArray(Nhalf);
		for (let i = 0; i < Nhalf; i++) {
			ranks[i] = amplitude * (decibels[i] - minDecibel);
		}

		for (let y = 0; y < height; y++) {
			const lutIndex = ranks[Nhalf - 1 - y] * 4;
			const i = (y * width + x) * 4;
			imageData.data[i + 0] = cm[lutIndex + 0];
			imageData.data[i + 1] = cm[lutIndex + 1];
			imageData.data[i + 2] = cm[lutIndex + 2];
			imageData.data[i + 3] = cm[lutIndex + 3];
		}
		if (x === 0) {
			console.log(
				"[Worker] spectrum",
				N,
				buf,
				spectrum,
				magnitude,
				decibels,
				ranks,
			);
		}
	}

	ctx.putImageData(imageData, 0, 0);

	postMessage({ type: "done" });
}
