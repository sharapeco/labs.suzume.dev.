var s, c, w, h, i;

window.onload = init;

function init() {
	s = document.getElementById("screen");
	c = s.getContext("2d");
	w = s.width;
	h = s.height;
	i = c.createImageData(w, h);

	s.className = "on";

	setInterval(draw, 1000 / 30);
}

function draw() {
	var r;
	for (var p = 4 * (w * h - 1); p >= 0; p -= 4) {
		r = Math.random();
		i.data[p] = i.data[p + 1] = i.data[p + 2] = 255 * Math.pow(r, 1.6);
		i.data[p + 3] = 255;
	}
	c.putImageData(i, 0, 0);
}
