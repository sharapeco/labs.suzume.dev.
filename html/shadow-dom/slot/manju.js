import { createElement as h } from "/assets/js/createElement.js";

// 要素のためのクラスを作成
export class Manju extends HTMLElement {
	static observedAttributes = ["size"];

	constructor() {
		// コンストラクターでは、常に super を最初に呼び出す
		super();

		const size = Number.parseFloat(this.getAttribute("size") ?? "100");

		const shadowRoot = this.attachShadow({ mode: "closed" });
		this.styleElement = h("style", null, this.createStyle(size));
		shadowRoot.append(this.styleElement, h("slot"));
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log(
			`属性 ${name} が ${oldValue} から ${newValue} に変更されました。`,
		);

		switch (name) {
			case "size": {
				const size = Number.parseFloat(newValue ?? "100");
				const style = this.styleElement;
				style.textContent = this.createStyle(size);

				this.dispatchEvent(
					new CustomEvent("resize", {
						detail: { size },
					}),
				);
				break;
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

// 0.5秒後にカスタム要素を定義
// → DOMツリーにすでに存在していた <x-manju> がこのクラスを使って処理される
setTimeout(() => {
	customElements.define("x-manju", Manju);
}, 500);
