/**
 * 音圧レベルを計算する
 *
 * @param {Float32Array} channelData チャンネルデータ
 * @returns {number} 音圧レベル
 */
export function getSoundPressureLevel(channelData) {
	const chunkSize = 2 ** 28;
	// → サンプル数が多すぎてオーバーフローしないか？
	// 例として 48 kHz, 1時間の音声データを考える.
	// x * x の値は [0, 1] の範囲.
	// JavaScript の数値は IEEE 754 倍精度浮動小数点数で、有効桁数は10進で15桁ほど（正確に表現できるのは14桁）
	// → 全サンプル数は 48,000 * 60 * 60 = 172,800,000
	// → x * x の精度として使える桁数は5桁程度となる
	// → これでは心許ないので分割して計算する
	// → 実測で SPL 値の有効桁数が7桁以上あった chunkSize = 2 ** 28 とした
	let sum = 0;
	for (let i = 0; i < channelData.length; i += chunkSize) {
		let sub = 0;
		const to = Math.min(i + chunkSize, channelData.length);
		for (let j = i; j < to; j++) {
			sub += channelData[j] ** 2;
		}
		sum += sub;
	}
	const rms = Math.sqrt(sum / channelData.length);
	const spl = 20 * Math.log10(rms);
	return spl;
}
