import { createElementWithRef as h } from "/assets/js/createElement.js";

function getClothoid(x0, y0, endTheta) {
	let x = x0;
	let y = y0;
	let t = 0;
	let theta = t ** 2 / 2;
	const dt = 0.01;
	const points = [[x, y]];
	let length = 0;

	while (theta < endTheta) {
		const dx = Math.cos(theta) * dt;
		const dy = Math.sin(theta) * dt;
		x += dx;
		y += dy;
		points.push([x, y]);
		length += (dx ** 2 + dy ** 2) ** 0.5;
		t += dt;
		theta = t ** 2 / 2;
	}

	return { points, length };
}

function drawClothoid(ctx, scale, x0, y0, endTheta) {
	const { points, length } = getClothoid(x0, y0, endTheta);
	const scaledPoints = points.map(([x, y]) => [scale * x, scale * y]);
	ctx.beginPath();
	ctx.moveTo(scaledPoints[0][0], scaledPoints[0][1]);
	for (let i = 1; i < scaledPoints.length; i++) {
		ctx.lineTo(scaledPoints[i][0], scaledPoints[i][1]);
	}
	ctx.stroke();
	return { points, length };
}

function createCanvas(width, height) {
	const scale = 2;
	const canvas = document.createElement("canvas");
	canvas.width = width * scale;
	canvas.height = height * scale;
	canvas.style.width = `${width}px`;
	canvas.style.height = `${height}px`;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext("2d");
	ctx.scale(scale, scale);
	return canvas;
}

const SIZE = 512;
const canvas = createCanvas(SIZE, SIZE);

const state = {
	theta: 20,
};

function updateTheta(theta) {
	state.theta = theta;
	refs.thetaValue.textContent = `${theta}°`;
	test1(Math.PI * theta / 180);
}

function test1(theta) {
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.strokeStyle = "#08c";
	ctx.lineWidth = 1;

	const sqrt21 = 1 / Math.sqrt(2);
	const { points, length } = getClothoid(0, 0, theta);
	const r = length === 0 ? 1 : 1 / length;
	const [x, y] = points[points.length - 1];
	const cx = x - r * Math.sin(theta);
	const cy = y + r * Math.cos(theta);
	const dx = cx + r * sqrt21;
	const dy = cy - r * sqrt21;
	const scale = sqrt21 / (dx === 0 ? 1 : dx);
	const SS = scale * SIZE;

	drawClothoid(ctx, SS, 0, 0, theta);
	ctx.fillStyle = "#000";
	ctx.fillRect(x * SS - 1, y * SS - 1, 2, 2);
	ctx.font = "12px Arial";
	ctx.textBaseline = "middle";
	ctx.fillText(
		`(${x.toFixed(2)}, ${y.toFixed(2)}) L=${length.toFixed(2)}`,
		x * SS + 10,
		y * SS + 10,
	);

	// クロソイドと円弧の継ぎ目
	ctx.fillRect(cx * SS - 1, cy * SS - 1, 2, 2);

	// 円弧の中心
	ctx.fillRect(dx * SS - 1, dy * SS - 1, 2, 2);

	// 円弧の中心からクロソイドの終点まで
	ctx.strokeStyle = "#0d0";
	ctx.beginPath();
	ctx.moveTo(cx * SS, cy * SS);
	ctx.lineTo(x * SS, y * SS);
	ctx.stroke();
	ctx.fillText(`r = ${r.toFixed(2)}`, (x + cx) / 2 * SS, (y + cy) / 2 * SS);

	// 円弧
	ctx.strokeStyle = "#c4c";
	ctx.beginPath();
	ctx.arc(cx * SS, cy * SS, r * SS, theta - Math.PI / 2, -Math.PI / 4);
	ctx.stroke();
}

const { element: root, refs } = h("div", { class: "flex" }, [
	canvas,
	h("div", {}, [
		h("label", {}, "角度"),
		h("input", {
			ref: "thetaInput",
			type: "range",
			min: 0,
			max: 45,
			step: 1,
			value: state.theta,
			on: {
				input: (e) => {
					updateTheta(e.target.valueAsNumber);
				},
			},
		}),
		h("span", { ref: "thetaValue" }, `${state.theta}°`),
	]),
]);
document.body.appendChild(root);
updateTheta(state.theta);
