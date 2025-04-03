import { createElement as h } from "/assets/js/createElement.js";
import { Manju } from "./manju.js";

export class Koshian extends HTMLElement {
	static observedAttributes = ["volume"];

	constructor() {
		// コンストラクターでは、常に super を最初に呼び出す
		super();

		this.styleElement = h("style");
		this.updateVolume();

		const shadowRoot = this.attachShadow({ mode: "open" });
		shadowRoot.append(this.styleElement, h("slot"));
	}

	attributeChangedCallback(name, oldValue, newValue) {
		switch (name) {
			case "volume":
				this.updateVolume();
				break;
		}

		for (const extension of Manju.extensions) {
			if (extension.observedAttributes?.includes(name)) {
				extension.onAttributeChanged?.(name, oldValue, newValue);
			}
		}
	}

	updateVolume() {
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
		this.styleElement.textContent = this.createStyle(size);
	}

	createStyle(size) {
		return `
:host {
	all: initial;
	box-sizing: border-box;
	position: relative;
	display: grid;
	place-items: center;
	width: ${size}px;
	height: ${size}px;
	padding: ${size * 0.1}px;
	font-size: ${size * 0.08}px;
	line-height: 1.25;
	text-align: center;
	color:#dba5ac;
	background:#443537;
	border-radius: 40%;
}

:host::before {
	content: "Koshian";
	position: absolute;
	top: -10px;
	left: 0;
	font-size: 12px;
	line-height: 1;
	color: #443537;
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

class KoshianExtension {
	constructor() {
		this.name = "koshian";
		this.observedAttributes = ["size"];
		this.element = new Koshian();
	}

	onCreated() {
		return this.element;
	}

	onAttributeChanged(name, oldValue, newValue) {
		switch (name) {
			case "size": {
				const size = Number.parseFloat(newValue ?? "100") * 0.8;
				this.element.setAttribute("volume", size ** 2);
				break;
			}
		}
	}
}

Manju.registerExtension(new KoshianExtension());
