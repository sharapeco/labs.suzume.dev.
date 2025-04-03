import { h } from "./h.js";
import styles from "./shadow-styles.js";
import reset from "./reset-styles.js";

/**
 * @param {HTMLElement} container
 * @param {boolean} resetStyles
 */
function attachShadow(container, resetStyles = false) {
	container.attachShadow({ mode: "open" });
	const root = container.shadowRoot;
	if (resetStyles) {
		root.appendChild(h("style", {}, reset));
	}
	root.appendChild(h("style", {}, styles));
	root.appendChild(
		h("div", { className: "container" }, [
			h("p", {}, "[.container > p] ここはShadow DOMです。"),
		]),
	);
}

attachShadow(document.getElementById("test1"));
attachShadow(document.getElementById("test2"));
attachShadow(document.getElementById("test3"), true);
attachShadow(document.getElementById("test4"), true);
attachShadow(document.getElementById("test5"), true);
