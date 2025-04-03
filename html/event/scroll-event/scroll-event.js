const container = document.querySelector("#scroll");
const inner = document.querySelector("#scroll-inner");
const scrollbar = document.querySelector("#scroll-bar");
const thumb = document.querySelector("#scroll-thumb");
const message = document.querySelector("#message");

function setThumbWidth() {
	const width = Math.min(scrollbar.clientWidth ** 2 / inner.clientWidth, scrollbar.clientWidth);
	thumb.style.width = `${width}px`;
	setThumbPosition();
}

function setThumbPosition() {
	thumb.style.left = `${container.scrollLeft * (scrollbar.clientWidth / inner.clientWidth)}px`;
	message.textContent = `スクロール位置: ${container.scrollLeft}`;
}

setThumbWidth();
window.addEventListener("resize", setThumbWidth);
container.addEventListener("scroll", setThumbPosition);
