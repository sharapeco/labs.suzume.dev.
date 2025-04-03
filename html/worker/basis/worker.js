onmessage = (e) => {
	const reportFrequency = 1000;
	if (!e.data.input) {
		return;
	}
	const num = e.data.input;
	let inCircle = 0;
	for (let i = 0; i < num; i++) {
		const x = Math.random();
		const y = Math.random();
		if (x * x + y * y <= 1) {
			inCircle++;
		}
		if (i % reportFrequency === 0) {
			postMessage({ progress: i / num });
		}
	}
	const result = (4 * inCircle) / num;
	postMessage({ result });
};
