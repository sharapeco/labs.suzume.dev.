const templateSection = document.querySelector(".section");
templateSection.remove();

/** CSSで使用しているクラス名。`--` を ` ` に置換すると display プロパティの値になる。 */
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
	"table",
	"table-row",
	"list-item",
];

for (const className of classNames) {
	const display = className.replace(/--/, " ");
	const section = templateSection.cloneNode(true);
	section.querySelector("h2").textContent = display;
	for (const item of section.querySelectorAll(".item")) {
		item.classList.add(className);
	}
	document.body.appendChild(section);

	const h2 = section.querySelector("h2");
	const item = section.querySelector(".item");
	const computedStyle = window.getComputedStyle(item);
	const result = document.createElement("span");
	result.classList.add("result");
	result.textContent = computedStyle.display;
	h2.appendChild(result);
}
