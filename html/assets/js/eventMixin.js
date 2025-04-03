/**
 * イベントハンドラを管理するミックスイン
 *
 * ### 追加されるメソッド
 * - on(eventName: string, handler: (...args: any) => void, options?: { once?: boolean }): () => void
 * - off(eventName: string, handler: (...args: any) => void): void
 * - once(eventName: string, handler: (...args: any) => void): void
 * - emit(eventName: string, ...args: any): void
 *
 * ### 追加されるプライベートプロパティ
 * - _eventMixin
 *
 * @type {import("./applyMixin.js").BaseObject}
 */
export const eventMixin = {
	/**
	 * Subscribe to an event
	 *
	 * @param {string} eventName
	 * @param {(...args: any) => any} handler
	 * @param {{ once=: boolean }=} options
	 * @returns {() => void} unsubscribe
	 */
	on(eventName, handler, options) {
		if (!this._eventMixin) {
			/** @private */
			this._eventMixin = {
				handlers: {},
			};
		}
		if (!this._eventMixin.handlers[eventName]) {
		this._eventMixin.handlers[eventName] = new Set();
		}
		this._eventMixin.handlers[eventName].add(handler);
		if (options?.once) {
			const unsubscribeOnce = () => {
				this.un(eventName, unsubscribeOnce);
				this.un(eventName, handler);
			};
			this.on(eventName, unsubscribeOnce);
			return unsubscribeOnce;
		}
		return () => this.un(eventName, handler);
	},

	/**
	 * Unsubscribe from an event
	 *
	 * @param {string} eventName
	 * @param {(...args: any) => any} handler
	 */
	un(eventName, handler) {
		this._eventMixin.handlers[eventName]?.delete(handler);
	},

	/**
	 * Subscribe to an event once
	 *
	 * @param {string} eventName
	 * @param {(...args: any) => any} handler
	 * @returns {() => void} unsubscribe
	 */
	once(eventName, handler) {
		return this.on(eventName, handler, { once: true });
	},

	/**
	 * Remove all event handlers
	 */
	unAll() {
		this._eventMixin.handlers = {};
	},

	/**
	 * Emit an event
	 *
	 * @param {string} eventName
	 * @param {...any} args
	 */
	emit(eventName, ...args) {
		if (this._eventMixin.handlers?.[eventName]) {
		for (const handler of this._eventMixin.handlers[eventName]) {
				handler(...args);
			}
		}
	},
};
