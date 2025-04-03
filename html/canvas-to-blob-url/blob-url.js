/**
 * イメージを描画した canvas を作成します
 *
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement}
 */
function createImage(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "#28f";
	ctx.fillRect(0, 0, width, height);
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 2;
	const padding = 10;
	ctx.strokeRect(padding, padding, width - padding * 2, height - padding * 2);
	return canvas;
}

/**
 * canvas から Blob URL を作成します
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise<string|null>}
 */
async function createBlobUrl(canvas) {
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob == null) {
				reject("Failed to create blob");
			}
			resolve(URL.createObjectURL(blob));
		});
	});
}

/**
 * 画像を container に出力します
 *
 * @param {HTMLElement} container
 * @param {number=} width
 * @param {number=} height
 */
async function outputImage(container, width = 200, height = 200) {
	const canvas = createImage(width, height);
	const blobUrl = await createBlobUrl(canvas);
	const img = document.createElement("img");
	img.onload = () => {
		// もう blob を読み取る必要はないので、無効化します
		URL.revokeObjectURL(blobUrl);
	};
	img.src = blobUrl;
	container.appendChild(img);
}

outputImage(document.body);
