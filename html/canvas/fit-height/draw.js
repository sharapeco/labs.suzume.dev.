export function draw(canvas) {
	const ctx = canvas.getContext("2d");
	const unit = 16;
	for (let y = 0; y < canvas.height; y += unit) {
		for (let x = 0; x < canvas.width; x += unit) {
			ctx.fillStyle = `hsl(${hue()}, 70%, ${lightness()}%)`;
			ctx.fillRect(x, y, unit, unit);
		}
	}
}

function hue() {
	const r = Math.random();
	return Math.floor(((r + 0.5) ** 2) * 360);
}

function lightness() {
	const r = Math.random();
	return Math.floor((1 - r ** 2) * 70 + 30);
}
