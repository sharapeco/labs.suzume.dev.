export function getConfig() {
	return {
		width: 50000,
		height: 500,
		divWidth: 1000,
	};
}

export function createCanvas(width, height) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	return canvas;
}
