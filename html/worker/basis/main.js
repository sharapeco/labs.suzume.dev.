const numInput = document.getElementById("num");
const startButton = document.getElementById("startButton");
const resultSpan = document.getElementById("result");

const montecarloWorker = new Worker("worker.js");

let workerRunning = false;

function start() {
	if (workerRunning) {
		return;
	}
	const num = numInput.value;
	montecarloWorker.postMessage({ input: num });
}

function updateResult(result) {
	resultSpan.textContent = result;
}

montecarloWorker.onmessage = (e) => {
	const data = e.data;
	if (data.result) {
		workerRunning = false;
		updateResult(data.result);
	} else if (data.progress) {
		updateResult(`Calculating... (${Math.round(data.progress * 100)} %)`);
	}
};

startButton.addEventListener("click", start);
