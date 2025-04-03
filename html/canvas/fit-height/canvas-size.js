import { draw } from "./draw.js";

const canvases = document.querySelectorAll("canvas");
for (const canvas of canvases) {
	draw(canvas);
}
