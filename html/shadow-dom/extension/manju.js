import { createElement as h } from "/assets/js/createElement.js";

/**
 * @typedef {Object} Extension
 * @property {string} name
 * @property {string[]=} observedAttributes
 * @property {((container: HTMLElement) => HTMLElement | undefined)=} onCreated
 * @property {((name: string, oldValue: any, newValue: any) => void)=} onAttributeChanged
 */

// 要素のためのクラスを作成
export class Manju extends HTMLElement {
	static observedAttributes = ["size"];

	/** @type {Manju[]} */
	static instances = [];

	/** @type {Extension[]} */
	static extensions = [];

	/**
	 * 拡張機能を登録する
	 * @param {Extension} extension
	 */
	static registerExtension(extension) {
		if (Manju.extensions.some((ext) => ext.name === extension.name)) {
			throw new Error(`Extension ${extension.name} is already registered.`);
		}

		Manju.extensions.push(extension);
		if (extension.observedAttributes != null) {
			for (const attr of extension.observedAttributes) {
				if (!Manju.observedAttributes.includes(attr)) {
					Manju.observedAttributes.push(attr);
				}
			}
		}

		for (const instance of Manju.instances) {
			instance.initExtensions();
		}
	}

	constructor() {
		// コンストラクターでは、常に super を最初に呼び出す
		super();

		const size = Number.parseFloat(this.getAttribute("size") ?? "100");

		const shadowRoot = this.attachShadow({ mode: "closed" });
		this.styleElement = h("style", null, this.createStyle(size));
		shadowRoot.append(this.styleElement, h("slot"));

		this.extensionContainer = h("div");
		shadowRoot.append(this.extensionContainer);

		this.initializedExtensions = new WeakMap();

		Manju.instances.push(this);

		this.initExtensions();
	}

	initExtensions() {
		for (const extension of Manju.extensions) {
			if (this.initializedExtensions.has(extension)) {
				continue;
			}
			const element = extension.onCreated?.();
			if (element == null) {
				continue;
			}
			this.extensionContainer.append(element);
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "size": {
				const size = Number.parseFloat(newValue ?? "100");
				const style = this.styleElement;
				style.textContent = this.createStyle(size);
				break;
			}
		}

		for (const extension of Manju.extensions) {
			if (extension.observedAttributes?.includes(name)) {
				extension.onAttributeChanged?.(name, oldValue, newValue);
			}
		}
	}

	createStyle(size) {
		return `
:host {
	all: initial;
	box-sizing: border-box;
	position: relative;
	display: block;
	width: ${size}px;
	height: ${size}px;
	padding: ${size * 0.1}px;
	background: #f9c74f;
	border-radius: 40%;
}

:host::before {
	content: "Manju";
	position: absolute;
	top: -10px;
	left: 0;
	font-size: 12px;
	line-height: 1;
	color: #f9c74f;
}
			`;
	}
}

// カスタム要素を定義
customElements.define("x-manju", Manju);
