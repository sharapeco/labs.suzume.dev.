import { createElement as h } from "/assets/js/createElement.js";
import "./manju.js";
import "./koshian.js";

const sizes = [100, 150, 200];

const controller = h(
	"div",
	{
		style: {
			display: "grid",
			gap: "8px",
			padding: "8px",
			border: "solid 4px #ddd",
		},
	},
	[createSizeSelector()],
);
document.body.append(controller);

function createSizeSelector() {
	const select = h(
		"select",
		{},
		sizes.map((size) => h("option", { value: size }, size)),
	);
	select.addEventListener("change", (event) => {
		const size = event.target.value;
		const manjuList = document.querySelectorAll("x-manju");
		for (const manju of manjuList) {
			manju.setAttribute("size", size);
		}
	});
	return select;
}
