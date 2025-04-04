const templateSection = document.querySelector(".section");
templateSection.remove();

const classNames = [
	"block",
	"inline",
	"inline-block",
	"flex",
	"inline-flex",
	"grid",
	"inline-grid",
	"flow-root",
	"none",
	"contents",
	"block--flex",
	"block--flow",
	"block--flow-root",
	"block--grid",
	"inline--flex",
	"inline--flow",
	"inline--flow-root",
	"inline--grid",
	"table",
	"table-row",
	"list-item",
];
for (const className of classNames) {
	const section = templateSection.cloneNode(true);
	section.querySelector("h2").textContent = className.replace(/--/, " ");
	for (const item of section.querySelectorAll(".item")) {
		item.classList.add(className);
	}
	document.body.appendChild(section);

	const h2 = section.querySelector("h2");
	const item = section.querySelector(".item");
	const style = window.getComputedStyle(item);
	const display = style.display;
	const result = document.createElement("span");
	result.classList.add("result");
	result.textContent = display;
	h2.appendChild(result);
}
