import { createElementWithRef as h } from "/assets/js/createElement.js";

/** 状態 */
const state = {
	duration: 30,
	direction: 1,
	playing: false,
	startTime: 0,
	radius: 10,
	startTheta: 0,
	url: "",
};

/** @type {HTMLCanvasElement} - レンダリング先のキャンバス */
let canvas;
/** @type {BABYLON.Engine} - エンジン */
let engine;
/** @type {BABYLON.Scene} - シーン */
let scene;
/** @type {BABYLON.ArcRotateCamera} - カメラ */
let camera;
/** @type {HTMLButtonElement} - ダウンロードボタン */
let downloadButton;
/** @type {HTMLButtonElement} - 再生ボタン */
let playButton;
/** @type {HTMLDivElement} - コントロールコンテナ */
const controls = createControls();
/** @type {HTMLDivElement} - ステータスライン */
const statusLine = h("div", { id: "statusLine" }, "Loading...").element;

let stream;
let recorder;

function main() {
	document.body.append(controls, statusLine);

	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas);

	// ドラッグ&ドロップイベントの設定
	setupDragAndDrop();

	// シーンを作成
	scene = new BABYLON.Scene(engine);
	// カメラを作成
	camera = new BABYLON.ArcRotateCamera(
		"camera",
		-Math.PI / 2,
		Math.PI / 2.5,
		3,
		new BABYLON.Vector3(0, 0, 0),
		scene,
	);
	// カメラがユーザからの入力で動くように
	camera.attachControl(canvas, true);
	window.camera = camera;
	// ライトを作成
	const light = new BABYLON.HemisphericLight(
		"light",
		new BABYLON.Vector3(0, 1, 0),
		scene,
	);

	// 初期モデルの読み込みを dragon.glb から変更
	loadModel("./dragon.glb");

	scene.registerBeforeRender(update);

	engine.runRenderLoop(() => {
		statusLine.textContent = `FPS: ${Math.floor(engine.getFps())} / camera: [${prettyPoint(camera.position)}] G [${prettyPoint(camera.globalPosition)}] / radius = ${state.radius.toFixed(2)}, theta = ${state.startTheta.toFixed(2)}`;
		scene.render();
	});
}

function prettyPoint(obj) {
	return `${obj.x.toFixed(2)}, ${obj.y.toFixed(2)}, ${obj.z.toFixed(2)}`;
}

function startAnimation() {
	state.playing = true;
	state.startTime = Date.now();
	state.radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
	state.startTheta = Math.atan2(camera.position.z, camera.position.x);

	stream = canvas.captureStream();
	recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=h264" });
	recorder.ondataavailable = (event) => {
		if (event.data.size > 0) {
			createVideo(event.data);
		}
	};
	recorder.start();
}

function update() {
	if (!state.playing) return;

	// カメラを state.duration 秒で360度回転させる
	const time = (Date.now() - state.startTime) / 1000;
	if (time > state.duration) {
		stopAnimation();
		return;
	}

	const theta =
		state.startTheta + (time * state.direction * Math.PI * 2) / state.duration;
	camera.position = new BABYLON.Vector3(
		state.radius * Math.cos(theta),
		camera.position.y,
		state.radius * Math.sin(theta),
	);
}

function stopAnimation() {
	recorder.stop();
	state.playing = false;
	playButton.textContent = "再生";
}

function createVideo(data) {
	const blob = new Blob([data], { type: data.type });
	state.url = URL.createObjectURL(blob);
	downloadButton.disabled = false;
}

function downloadVideo() {
	const link = h("a", { href: state.url, download: "animation.webm" }, "ダウンロード").element;
	document.body.append(link);
	link.click();
	link.remove();
}

function createControls() {
	const { element, refs } = h(
		"div",
		{
			id: "controls",
		},
		[
			h("div", {}, [
				h("label", {}, "時間"),
				h("input", {
					type: "range",
					min: 10,
					max: 100,
					value: state.duration,
					on: {
						input: (e) => {
							state.duration = e.target.value;
							refs.durationText.textContent = `${state.duration} 秒`;
						},
					},
				}),
				h("span", { ref: "durationText" }, `${state.duration} 秒`),
			]),
			h("div", {}, [
				h("label", {}, "方向"),
				h(
					"select",
					{
						on: {
							change: (event) => {
								state.direction = event.target.value;
							},
						},
					},
					[
						h("option", { value: 1 }, "時計回り"),
						h("option", { value: -1 }, "反時計回り"),
					],
				),
			]),
			h(
				"button",
				{
					type: "button",
					ref: "playButton",
					on: {
						click: () => {
							if (state.playing) {
								stopAnimation();
								refs.playButton.textContent = "再生";
							} else {
								startAnimation();
								refs.playButton.textContent = "停止";
							}
						},
					},
				},
				"再生",
			),
			h(
				"button",
				{
					type: "button",
					ref: "downloadButton",
					disabled: true,
					on: {
						click: () => {
							downloadVideo();
						},
					},
				},
				"ダウンロード",
			),
		],
	);
	playButton = refs.playButton;
	downloadButton = refs.downloadButton;
	return element;
}

// ドラッグ&ドロップの設定関数を追加
function setupDragAndDrop() {
	document.body.addEventListener('dragover', (event) => {
		event.preventDefault();
		event.stopPropagation();
	});

	document.body.addEventListener('drop', (event) => {
		event.preventDefault();
		event.stopPropagation();

		const file = event.dataTransfer.files[0];
		if (file?.name?.toLowerCase().endsWith(".glb")) {
			const url = URL.createObjectURL(file);
			loadModel(url);
		}
	});
}

// モデル読み込み関数を追加
function loadModel(url) {
	statusLine.textContent = "モデルを読み込み中...";

	// 既存のメッシュをクリア
	for (const mesh of scene.meshes) {
		mesh.dispose();
	}

	BABYLON.SceneLoader.ImportMeshAsync("", "", url).then(() => {
		statusLine.textContent = "モデルの読み込みが完了しました";
	}).catch(error => {
		statusLine.textContent = `モデルの読み込みに失敗しました: ${error}`;
	});
}

window.addEventListener("DOMContentLoaded", main);
