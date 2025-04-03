/** @type {number} 加速度x */
let ax = 0;

/** @type {number} 加速度y */
let ay = 0;

/** @type {number} 加速度z */
let az = 0;

/** @type {number} 速度x */
let vx = 0;

/** @type {number} 速度y */
let vy = 0;

/** @type {number} 座標x */
let x = 0;

/** @type {number} 座標y */
let y = 0;

let angle = 0;

/** @type {number} 前の時間 */
let pt = Date.now();

/** @type {HTMLCanvasElement} */
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

/** @type {number} ステージの半径 */
const stageR = 160;

/** @type {number} ボールの半径 */
const ballR = 10;

/** @type {number} 壁の反発係数 */
const wallRestitution = 0.6;

/** @type {number} 摩擦係数 */
const friction = 0.1;

/** @type {number} 静止摩擦 */
const staticFriction = 0.2;

/** @type {number} 1 m は何 px か */
const metre = stageR * 0.8;

const signY = DeviceMotionEvent?.requestPermission ? -1 : 1;

const dpi = window.devicePixelRatio || 1;

window.addEventListener("devicemotion", (event) => {
	const aax = event.accelerationIncludingGravity.x;
	const aay = event.accelerationIncludingGravity.y * signY;
	angle = screen.orientation.angle;
	const angleRad = (-angle * Math.PI) / 180;
	ax = aax * Math.cos(angleRad) - aay * Math.sin(angleRad);
	ay = aax * Math.sin(angleRad) + aay * Math.cos(angleRad);
	az = event.accelerationIncludingGravity.z;
});

function init() {
	canvas.width = 2 * stageR * dpi;
	canvas.height = 2 * stageR * dpi;
	canvas.style.width = `${2 * stageR}px`;
	canvas.style.height = `${2 * stageR}px`;
	document.body.appendChild(canvas);

	if (!DeviceMotionEvent?.requestPermission) {
		requestAnimationFrame(redraw);
		return;
	}

	requestPermission();
}

function requestPermission() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#36d";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#fff";
	ctx.font = `${20 * dpi}px sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("画面をタップして始める", stageR * dpi, stageR * dpi);
	canvas.addEventListener(
		"click",
		() => {
			DeviceMotionEvent.requestPermission()
				.then((response) => {
					if (response === "granted") {
						requestAnimationFrame(redraw);
					}
				})
				.catch(console.error);
		},
		{ once: true },
	);
}

function redraw() {
	updateValues();

	ctx.fillStyle = "#36d";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.fillStyle = "#fc0";
	ctx.beginPath();
	ctx.arc((stageR + x) * dpi, (stageR + y) * dpi, ballR * dpi, 0, Math.PI * 2);
	ctx.closePath();
	ctx.fill();

	displayValues(ctx, 5, 5);

	requestAnimationFrame(redraw);
}

function updateValues() {
	const t = Date.now();
	const dt = (t - pt) / 1000;
	pt = t;

	const axSign = ax < 0 ? -1 : 1;
	const aySign = ay < 0 ? -1 : 1;
	vx += metre * axSign * Math.max(Math.abs(ax) - staticFriction, 0) * dt;
	vy += metre * aySign * Math.max(Math.abs(ay) - staticFriction, 0) * dt;

	// 摩擦
	vx -= friction * vx * dt;
	vy -= friction * vy * dt;

	x += vx * dt;
	y += vy * dt;

	if (x < -stageR + ballR) {
		x = -stageR + ballR;
		vx = -vx * wallRestitution;
	} else if (x > stageR - ballR) {
		x = stageR - ballR;
		vx = -vx * wallRestitution;
	}

	if (y < -stageR + ballR) {
		y = -stageR + ballR;
		vy = -vy * wallRestitution;
	} else if (y > stageR - ballR) {
		y = stageR - ballR;
		vy = -vy * wallRestitution;
	}
}

function displayValues(ctx, valueX, valueY, align = "left", baseline = "top") {
	const size = 14;
	ctx.font = `${size * dpi}px monospace`;
	ctx.textAlign = align;
	ctx.textBaseline = baseline;
	ctx.fillText(
		`ax:${formatNumber(ax)}, ay:${formatNumber(ay)}, az:${formatNumber(az)}`,
		valueX * dpi,
		valueY * dpi,
	);
	ctx.fillText(
		`vx:${formatNumber(vx)}, vy:${formatNumber(vy)}`,
		valueX * dpi,
		(valueY + size) * dpi,
	);
	ctx.fillText(
		` x:${formatNumber(x)},  y:${formatNumber(y)} / ${formatNumber(angle)}`,
		valueX * dpi,
		(valueY + size * 2) * dpi,
	);
}

function formatNumber(num) {
	const sign = num < 0 ? "-" : "+";
	return sign + Math.abs(num).toFixed(2);
}

init();
