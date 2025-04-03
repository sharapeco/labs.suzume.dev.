var s, c, w, h, i, gen;

function init() {
	s = document.getElementById("screen");
	c = s.getContext("2d");
	w = s.width;
	h = s.height;
	i = c.createImageData(w, h);
	gen = new PinkNoise();

	s.className = "on";

	setInterval(draw, 1000 / 30);
}

function draw() {
	var r;
	for (var p = 4 * (w * h - 1); p >= 0; p -= 4) {
		r = gen.next();
		i.data[p] = i.data[p + 1] = i.data[p + 2] = 255 * r;
		i.data[p + 3] = 255;
	}
	c.putImageData(i, 0, 0);
}

// ピンクノイズの生成
function PinkNoise() {
	var me = this;
	me.b0 = 0;
	me.b1 = 0;
	me.b2 = 0;
	me.b3 = 0;
	me.b4 = 0;
	me.b5 = 0;
	me.b6 = 0;
}

PinkNoise.prototype = {
	next: function () {
		var me = this,
			white,
			output;

		white = Math.random() * 2 - 1;
		me.b0 = 0.99886 * me.b0 + white * 0.0555179;
		me.b1 = 0.99332 * me.b1 + white * 0.0750759;
		me.b2 = 0.969 * me.b2 + white * 0.153852;
		me.b3 = 0.8665 * me.b3 + white * 0.3104856;
		me.b4 = 0.55 * me.b4 + white * 0.5329522;
		me.b5 = -0.7616 * me.b5 - white * 0.016898;
		output =
			me.b0 + me.b1 + me.b2 + me.b3 + me.b4 + me.b5 + me.b6 + white * 0.5362;
		output *= 0.11; // (roughly) compensate for gain
		me.b6 = white * 0.115926;
		return output;
	},
};

window.onload = init;
