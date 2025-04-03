import { createElement as h } from "/assets/js/createElement.js";

export class Koshian extends HTMLElement {
	static observedAttributes = ["volume"];

	constructor() {
		// コンストラクターでは、常に super を最初に呼び出す
		super();

		const volume = this.getAttribute("volume") ?? "auto";
		const auto = volume === "auto";
		let size = 80;
		if (auto) {
			size = this.getManjuSize();
		}
		if (!auto) {
			size = Math.sqrt(Number.parseFloat(volume));
			if (Number.isNaN(size)) {
				size = 80;
			}
		}

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.append(h("style", null, this.createStyle(size)), h("slot"));

		this.observer = new MutationObserver(() => {
			console.log("スロットが変更されました。");
		});
		this.observer.observe(this);
	}

	createStyle(size) {
		return `
:host {
	all: initial;
	box-sizing: border-box;
	display: grid;
	place-items: center;
	width: ${size}px;
	height: ${size}px;
	padding: ${size * 0.1}px;
	font-size: ${size * 0.08}px;
	line-height: 1.25;
	text-align: center;
	color:rgb(219, 165, 172);
	background:rgb(68, 53, 55);
	border-radius: 40%;
}
			`;
	}

	getManjuSize() {
		const manju = this.closest("x-manju");
		if (manju == null) {
			return 80;
		}
		const size = Number.parseFloat(manju.getAttribute("size") ?? "100");
		return size * 0.8;
	}
}

customElements.define("x-koshian", Koshian);
