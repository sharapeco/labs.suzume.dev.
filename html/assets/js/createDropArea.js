import { createElement as h } from "./createElement.js";

/**
 * ドロップエリアを作成する
 *
 * @param {Object} param0
 * @param {string} param0.label ラベル
 * @param {string} param0.accept 受け入れるファイルのMIMEタイプ
 * @param {Function} param0.onDrop ドロップされたファイルを処理する関数
 * @returns {Object} ドロップエリアのDOM要素
 */
export function createDropArea({
	label = "ここにファイルをドロップしてください",
	accept = "*/*",
	onDrop = (files) => {
		console.log(files);
	},
} = {}) {
	const dropArea = h("div", { class: "drop-area" }, [label]);

	dropArea.addEventListener("dragover", (event) => {
		event.preventDefault();
	});

	dropArea.addEventListener("drop", (event) => {
		event.preventDefault();
		const files = event.dataTransfer.files;
		onDrop(files);
	});

	dropArea.addEventListener("dragenter", (event) => {
		event.preventDefault();
		dropArea.classList.add("dragover");
	});

	dropArea.addEventListener("dragleave", (event) => {
		event.preventDefault();
		dropArea.classList.remove("dragover");
	});

	dropArea.addEventListener("dragend", (event) => {
		event.preventDefault();
		dropArea.classList.remove("dragover");
	});

	dropArea.addEventListener("click", (event) => {
		const input = h("input", { type: "file", accept });
		input.addEventListener("change", () => {
			onDrop(input.files);
		});
		input.click();
	});

	return dropArea;
}