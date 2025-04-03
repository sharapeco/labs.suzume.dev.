/** @type {number} 加速度x */
let ax = 0;

/** @type {number} 加速度y */
let ay = 0;

/** @type {number} 加速度z */
let az = 0;

let ay0 = null;

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

const yMax = 150;

const signY = DeviceMotionEvent?.requestPermission ? -1 : 1;

const valuesDiv = document.createElement("div");

const naruhito = document.querySelector("#naruhito");

window.addEventListener("devicemotion", (event) => {
	const aax = event.accelerationIncludingGravity.x;
	const aay = event.accelerationIncludingGravity.y * signY;
	angle = screen.orientation.angle;
	const angleRad = (-angle * Math.PI) / 180;
	ax = aax * Math.cos(angleRad) - aay * Math.sin(angleRad);
	ay = aax * Math.sin(angleRad) + aay * Math.cos(angleRad);
	az = event.accelerationIncludingGravity.z;

	if (ay0 === null) {
		ay0 = Math.min(ay, 4.8);
	} else {
		ay = ay - ay0;
	}
});

function init() {
	valuesDiv.style.position = "fixed";
	valuesDiv.style.top = "0";
	valuesDiv.style.left = "0";
	valuesDiv.style.fontSize = "12px";
	valuesDiv.style.fontFamily = "monospace";
	valuesDiv.style.backgroundColor = "#fff";
	valuesDiv.style.color = "#666";
	document.body.appendChild(valuesDiv);

	if (!DeviceMotionEvent?.requestPermission) {
		const button = document.createElement("button");
		button.type = "button";
		button.style.position = "fixed";
		button.style.bottom = "10px";
		button.textContent = "加速度センサをエミュレート";
		button.addEventListener("click", () => {
			ay = 5.6;
			button.remove();
		}, { once: true });
		document.body.appendChild(button);

		requestAnimationFrame(redraw);
		return;
	}

	requestPermission();
}

function requestPermission() {
	const button = document.createElement("button");
	button.type = "button";
	button.style.position = "fixed";
	button.style.bottom = "10px";
	button.textContent = "タップして始める";
	button.addEventListener(
		"click",
		() => {
			DeviceMotionEvent.requestPermission()
				.then((response) => {
					button.remove();
					if (response === "granted") {
						requestAnimationFrame(redraw);
					}
				})
				.catch(console.error);
		},
		{ once: true },
	);
	document.body.appendChild(button);
}

function redraw() {
	updateValues();

	naruhito.style.height = `${365 - 150 + y}px`;

	// displayValues();

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

	if (y < 0) {
		y = 0;
		vy = 0;
	} else if (y > yMax) {
		y = yMax;
		vy = -vy * wallRestitution;
	}
}

function displayValues() {
	valuesDiv.textContent = [
		`ax:${formatNumber(ax)}, ay:${formatNumber(ay)}, az:${formatNumber(az)}`,
		`vx:${formatNumber(vx)}, vy:${formatNumber(vy)}`,
		` x:${formatNumber(x)},  y:${formatNumber(y)} / ${formatNumber(angle)}`,
	].join("\n");
}

function formatNumber(num) {
	const sign = num < 0 ? "-" : "+";
	return sign + Math.abs(num).toFixed(2);
}

init();
