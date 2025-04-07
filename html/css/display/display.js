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

/** 結果を格納する写像。キーは計算値、値は display プロパティの値の集合。 */
const styleMap = new Map();

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

	if (!styleMap.has(computedStyle.display)) {
		styleMap.set(computedStyle.display, new Set());
	}
	styleMap.get(computedStyle.display).add(display);
	console.log(computedStyle.display, "←", display);
}

const resultDiv = document.getElementById("result");
const resultList = document.createElement("ol");
for (const [key, value] of styleMap.entries()) {
	const line = `${key} ← ${Array.from(value).join(" / ")}`;
	const li = document.createElement("li");
	li.textContent = line;
	resultList.appendChild(li);
}
resultDiv.appendChild(resultList);
