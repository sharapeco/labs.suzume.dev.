/**
 * Mixinを適用する
 *
 * @typedef {Object} GetterSetterDesc<T>
 * @property {(() => T)=} get
 * @property {((v: T) => void)=} set
 *
 * @typedef {function|GetterSetterDesc} MethodDesc
 *
 * @typedef {Object.<string, MethodDesc>} BaseObject
 *
 * @param {function} derivedCtor Mixinを適用するクラス
 * @param {BaseObject} baseObj 実装のあるオブジェクト
 *
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html
 */
export function applyMixin(derivedCtor, baseObj) {
	for (const name of Object.getOwnPropertyNames(baseObj)) {
		const desc = baseObj[name];
		if (typeof desc === "function") {
			derivedCtor.prototype[name] = desc;
		} else if (desc.get || desc.set) {
			Object.defineProperty(derivedCtor.prototype, name, desc);
		}
	}
}
