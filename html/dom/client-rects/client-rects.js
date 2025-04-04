function createMark({ left, top, width, height }) {
	const mark = document.createElement("div");
	mark.classList.add("mark");
	mark.style.left = `${left}px`;
	mark.style.top = `${top}px`;
	mark.style.width = `${width}px`;
	mark.style.height = `${height}px`;
	return mark;
}

function markWithOffset(container) {
	for (const span of container.querySelectorAll("span")) {
		const rect = getOffsetRect(span);
		const mark = createMark(rect);
		container.appendChild(mark);
	}
}

function getOffsetRect(element) {
	const rect = {
		left: 0,
		top: 0,
		width: element.offsetWidth,
		height: element.offsetHeight,
	};
	let node = element;
	while (node) {
		rect.left += node.offsetLeft;
		rect.top += node.offsetTop;
		node = node.offsetParent;
	}
	return rect;
}

function markWithClientRects(container) {
	for (const span of container.querySelectorAll("span")) {
		for (const rect of span.getClientRects()) {
			const mark = createMark(rect);
			container.appendChild(mark);
		}
	}
}

function markWithBoundingClientRect(container) {
	for (const span of container.querySelectorAll("span")) {
		const rect = span.getBoundingClientRect();
		const mark = createMark(rect);
		container.appendChild(mark);
	}
}

window.addEventListener("load", () => {
	for (const container of document.querySelectorAll(".offset")) {
		markWithOffset(container);
	}
	for (const container of document.querySelectorAll(".rects")) {
		markWithClientRects(container);
	}
	for (const container of document.querySelectorAll(".bounding-box")) {
		markWithBoundingClientRect(container);
	}
});
