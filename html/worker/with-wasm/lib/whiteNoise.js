export function createWhiteNoise(samples, amplitude = 0.5) {
	const whiteNoise = new Float32Array(samples);
	for (let i = 0; i < whiteNoise.length; i++) {
		whiteNoise[i] = (Math.random() * 2 - 1) * amplitude;
	}
	return whiteNoise;
}
