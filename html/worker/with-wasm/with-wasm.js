import { getSoundPressureLevel } from "./lib/spl.js";
import { createWhiteNoise } from "./lib/whiteNoise.js";
import { ColorMap } from "./lib/ColorMap.js";
import { loadAudioData } from "./lib/loadAudioData.js";
import { decodeAudio } from "./lib/decodeAudio.js";

const fftSize = 1024;
const nOverlap = 768;
const windowType = "hann";
const cm = ColorMap.getDefault();

const sampleRate = 44100;
let duration = 3 * 60;
let totalSamples = sampleRate * duration;
const whiteNoise = createWhiteNoise(totalSamples);
let buffer;
let spl = getSoundPressureLevel(whiteNoise);

const canvas = document.createElement("canvas");
canvas.width = Math.floor((totalSamples - nOverlap) / (fftSize - nOverlap));
canvas.height = fftSize / 2;

document.body.appendChild(canvas);

const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });

worker.onmessage = function onmessage(event) {
	const { type } = event.data;
	console.log(`[Main] received ${type}`);

	switch (type) {
		case "ready":
			performance.mark("worker ready");
			onReady();
			break;
		case "done":
			performance.mark("worker done");
			console.log("[Main] done");
			performance.measure("init", "worker init", "worker ready");
			performance.measure("process", "worker ready", "worker done");
			console.log(performance.getEntriesByType("measure").map((m) => `${m.name}: ${m.duration} ms`).join("\n"));
			break;
		case "error":
			console.error("[Main] error in worker");
			console.error(event.data.message);
			break;
	}
};

worker.onerror = function onerror(err) {
	console.error("[Main] error in worker");
	console.error(err);
};

async function main() {
	const abortController = new AbortController();
	const audioData = await loadAudioData("https://static.suzume.dev/labs/audio/4fen.mp3", () => {}, abortController.signal);
	const decoded = await decodeAudio(audioData, { sampleRate });
	buffer = decoded.getChannelData(0);
	duration = decoded.duration;
	totalSamples = sampleRate * duration;
	spl = getSoundPressureLevel(buffer);
	console.log(`Sound Pressure Level: ${spl} dB`);

	init();
}

function init() {
	performance.mark("worker init");
	worker.postMessage({
		type: "init",
		fftSize,
		windowType,
		colorMap: cm.lut,
	});
}

function onReady() {
	const samplePoints = Array.from({ length: canvas.width }, (_, i) => i * (fftSize - nOverlap));
	const offscreen = canvas.transferControlToOffscreen();
	worker.postMessage({
		type: "process",
		canvas: offscreen,
		buffer,
		samplePoints,
			decibelOffset: -spl,
			minDecibel: -30,
			maxDecibel: 30,
		},
		[offscreen, whiteNoise.buffer],
	);
}

main();
