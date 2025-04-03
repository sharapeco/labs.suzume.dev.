const logElement = document.getElementById("log");
function log(message) {
	logElement.textContent += message;
}

const body = document.body;

body.addEventListener("click", (event) => {
	log("body.onclick 1 preventDefault()\n");
	event.preventDefault();
});

body.addEventListener("click", (event) => {
	log("body.onclick 2 stopPropagation()\n");
	event.stopPropagation();
	if (event.defaultPrevented) {
		log("body.onclick defaultPrevented\n");
		// 無限ループになる:
		// const cloneEvent = new event.constructor(event.type, event);
		// event.target.dispatchEvent(cloneEvent);
	}
});

body.addEventListener("contextmenu", (event) => {
	log("body.oncontextmenu 1 preventDefault()\n");
	event.preventDefault();
});

body.addEventListener("contextmenu", (event) => {
	log("body.oncontextmenu 2 stopImmediatePropagation()\n");
	event.stopImmediatePropagation();
	if (event.defaultPrevented) {
		log("body.oncontextmenu defaultPrevented\n");
	}
});
