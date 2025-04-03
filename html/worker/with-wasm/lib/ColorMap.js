import viridis from "./viridis.js";

export class ColorMap {
	static register(name, values) {
		if (ColorMap.cache.has(name)) {
			throw new Error(`ColorMap ${name} already registered`);
		}
		const colorMap = new ColorMap(name, values);
		ColorMap.cache.set(name, colorMap);
		return colorMap;
	}

	/**
	 * デフォルトのカラーマップを取得する
	 * @returns {ColorMap}
	 */
	static getDefault() {
		return ColorMap.cache.get("viridis");
	}

	/**
	 * 登録されたカラーマップを取得する
	 * @param {string} name
	 * @returns {ColorMap | undefined}
	 */
	static get(name) {
		return ColorMap.cache.get(name);
	}

	/**
	 * カラーマップをURLから取得する。
	 * キャッシュがあればそれを返す。
	 *
	 * インポート属性が使用できれば次の書式でJSONを同期的に取得できる。
	 * `import infernoValues from "./inferno.json" with { type: "json" };`
	 * しかしながらFirefoxがまだ対応していないため、このメソッドがある。
	 * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/import/with
	 *
	 * @param {string} name
	 * @param {string|URL} url
	 * @returns
	 */
	static async fetch(name, url) {
		if (ColorMap.cache.has(name)) {
			return ColorMap.cache.get(name);
		}
		const response = await fetch(url);
		const values = await response.json();
		const colorMap = ColorMap.register(name, values);
		return colorMap;
	}

    /**
     * @param {string} name
     * @param {number[][]} values
     */
	constructor(name, values) {
        /** @type {string} カラーマップ名 */
		this.name = name;
        /** @type {number[][]} 0–255の値に対応するRGB値 */
		this.values = values;
		/** @type {Uint8ClampedArray} */
		this.lut = new Uint8ClampedArray(values.length * 4);
		for (let i = 0; i < values.length; i++) {
			this.lut[i * 4 + 0] = values[i][0];
			this.lut[i * 4 + 1] = values[i][1];
			this.lut[i * 4 + 2] = values[i][2];
			this.lut[i * 4 + 3] = 255;
		}
	}
}

ColorMap.cache = new Map();
ColorMap.register("viridis", viridis);

// グレースケール
const graysGamma = 1.32;
ColorMap.register("grays", Array.from({ length: 256 }, (_, i) => {
	const v = Math.round(255 * (1 - (i / 255) ** graysGamma));
	return [v, v, v];
}));
