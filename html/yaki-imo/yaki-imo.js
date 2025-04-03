const startButton = document.getElementById("startButton");
const progress = document.getElementById("progress");
const statusText = document.getElementById("status");

function chime() {
	const audio = new Audio("https://static.suzume.dev/labs/audio/kibitaki-young.mp3");
	audio.play();
}

let started = false;

const totalMinutes = 70;

startButton.addEventListener("click", async () => {
	if (started) {
		started = false;
		startButton.textContent = "開始";
		progress.value = 0;
		statusText.textContent = "";
		return;
	}

	started = true;
	startButton.textContent = "停止";

	try {
		chime();
		statusText.textContent = "ヒーターを下面のみに設定し、10分間加熱してください";

		for (let m = 0; m < 10; m++) await tick(m);
		chime();
		statusText.textContent = "ヒーターを上面のみに設定し、5分間加熱してください";

		for (let m = 10; m < 20; m++) await tick(m);
		chime();
		statusText.textContent = "5分間加熱してください";

		for (let m = 20; m < 30; m++) await tick(m);
		chime();
		statusText.textContent = "4分間加熱してください";

		for (let m = 30; m < 40; m++) await tick(m);
		chime();
		statusText.textContent = "4分間加熱してください";

		for (let m = 40; m < 50; m++) await tick(m);
		chime();
		statusText.textContent = "4分間加熱してください";

		for (let m = 50; m < 60; m++) await tick(m);
		chime();
		statusText.textContent = "4分間加熱してください";

		for (let m = 60; m < 70; m++) await tick(m);

		chime();
		started = false;
		startButton.textContent = "開始";
		progress.value = 100;
		statusText.textContent = "焼き芋ができました";
	} catch (e) {}
});

function tick(m) {
	return new Promise((resolve, reject) => {
		const t0 = performance.now();
		const next = () => {
			if (!started) {
				return reject(new Error("aborted"));
			}
			const t1 = performance.now();
			const elapsed = t1 - t0;
			if (elapsed >= 60 * 1000) {
				statusText.textContent = `残り ${totalMinutes - m - 1} 分`;
				return resolve();
			}
			progress.value = (m + elapsed / (60 * 1000)) / totalMinutes;
			requestAnimationFrame(next);
		};
		requestAnimationFrame(next);
	});
}
