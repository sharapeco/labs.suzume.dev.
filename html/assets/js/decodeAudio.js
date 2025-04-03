/**
 * 音声ファイルを指すBlobを受け取り、AudioBufferにデコードする
 *
 * @typedef {Object} DecodeAudioOptions
 * @param {number=} sampleRate
 * @param {((percentage: number) => void)=} progressCallback
 * @param {AbortSignal=} signal
 *
 * @param {Blob} blob
 * @param {DecodeAudioOptions=} options
 * @returns {Promise<AudioBuffer>}
 */
export async function decodeAudio(blob, options = {}) {
	const { sampleRate, progressCallback, signal } = {
		sampleRate: 44100,
		progressCallback: () => {},
		...options,
	};
	const sizePerSecond = getSizePerSecond();
	const t0 = performance.now();
	const arrayBuffer = await blob.arrayBuffer();
	const audioContext = new AudioContext({ sampleRate });
	const decode = audioContext.decodeAudioData(arrayBuffer);
	const timer = setInterval(() => {
		if (signal?.aborted) {
			// decodeAudioData は AbortSignal をサポートしていないため
			// 動かしたままにしておき、進捗表示だけを中断する
			clearInterval(timer);
			return;
		}
		const t1 = performance.now();
		const time = (t1 - t0) / 1000;
		const progress = (time * sizePerSecond) / blob.size;
		progressCallback(progress);
	}, 100);
	return decode.finally(() => {
		audioContext.close();
		clearInterval(timer);
		const t1 = performance.now();
		const time = (t1 - t0) / 1000;
		addSpeed(blob.size, time);
	});
}

function getSizePerSecond() {
	const speed = JSON.parse(localStorage.getItem("decodeAudioSpeed") ?? "null");
	if (speed == null || speed.totalSize === 0) {
		return 1000000;
	}
	return speed.totalSize / speed.totalTime;
}

function addSpeed(size, time) {
	const { totalSize, totalTime } = JSON.parse(
		localStorage.getItem("decodeAudioSpeed") ?? "null",
	) || { totalSize: 0, totalTime: 0 };
	const newSpeed = {
		totalSize: totalSize + size,
		totalTime: totalTime + time,
	};
	localStorage.setItem("decodeAudioSpeed", JSON.stringify(newSpeed));
}
