/**
 * @typedef {(props: Props, children: any[]) => any} ComponentFactory
 * @typedef {ComponentFactory|string} ComponentType
 * @typedef {Record<string, any>} Props
 */

export const h = jsx;

/**
 * @param {ComponentType} type
 * @param {Props} props
 * @param {any[]} children
 * @returns
 */
export function jsx(type, props, ...children) {
	const add = (elem, child) => {
		if (Array.isArray(child)) {
			for (const c of child) {
				add(elem, c);
			}
		} else if (typeof child === "object" && child instanceof Node) {
			elem.appendChild(child);
		} else if (typeof child === "string" || typeof child === "number") {
			const textNode = document.createTextNode(child.toString());
			elem.appendChild(textNode);
		}
	};

	if (typeof type === "function") {
		return type(props, ...children);
	}

	const elem = document.createElement(type);
	const { style, key, ...rest } = props ?? {};
	Object.assign(elem, rest);

	for (const key of Object.keys(rest)) {
		if (/^data-/.test(key)) {
			elem.setAttribute(key, props[key]);
		}
	}

	if (style != null) {
		for (const key of Object.keys(style)) {
			if (/^--/.test(key)) {
				elem.style.setProperty(key, style[key]);
			} else {
				elem.style[key] = style[key];
			}
		}
	}

	add(elem, children);
	return elem;
}

/**
 * jsx() の第1引数として渡せる Fragment のファクトリ
 *
 * @type {ComponentFactory}
 * @returns {DocumentFragment}
 */
export function jsxFrag(props, ...children) {
	const fragment = document.createDocumentFragment();
	for (const child of children) {
		if (typeof child === "object" && child instanceof Node) {
			fragment.appendChild(child);
		} else if (typeof child === "string" || typeof child === "number") {
			const textNode = document.createTextNode(child.toString());
			fragment.appendChild(textNode);
		}
	}
	return fragment;
}
