// biome-ignore lint/suspicious/noGlobalAssign: Workerのため許可
onmessage = (e) => {
	const tag = e.data;
	postMessage(`${tag} started`);
	calc();
	postMessage(`${tag} done`);
};

function wait(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function calc() {
	let sum = 0;
	for (let i = 0; i < 100000000; i++) {
		sum += i;
	}
	return sum;
}
