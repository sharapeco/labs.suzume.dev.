// プロパティの値の定義
const whiteSpaceValues = {
	basic: ["normal", "nowrap", "pre", "pre-wrap", "pre-line", "break-spaces"],
	collapse: [
		"collapse",
		"preserve",
		"preserve-breaks",
		"preserve-spaces",
		"break-space",
	],
	textWrap: ["wrap", "balance", "pretty", "stable"],
};

const invalidClassNames = [
	"collapse--balance",
	"collapse--pretty",
	"collapse--stable",
	"preserve--balance",
	"preserve--pretty",
	"preserve--stable",
	"preserve-breaks--balance",
	"preserve-breaks--pretty",
	"preserve-breaks--stable",
	"preserve-spaces--balance",
	"preserve-spaces--pretty",
	"preserve-spaces--stable",
	"break-space--wrap",
	"break-space--balance",
	"break-space--pretty",
	"break-space--stable",
];

// デモの文章
const LF = "\n";
const TAB = "\t";
const demoText = `${LF}${TAB}要素内の   ホワイトスペース${TAB}をどのように扱うか${LF}${TAB}を設定するためのプロパティです。${LF}${TAB}この文の前後には改行があり、タブ文字でインデントされています。${LF}`;

// CSSルールの生成
function generateCSSRules() {
	const style = document.createElement("style");
	let css = "";

	// 基本的な値に対するCSSルールを生成
	for (const value of whiteSpaceValues.basic) {
		css += `
			.${value} .item-content {
				white-space: ${value};
			}
		`;
	}

	// white-space-collapseとtext-wrapの組み合わせに対するCSSルールを生成
	for (const collapse of whiteSpaceValues.collapse) {
		for (const textWrap of whiteSpaceValues.textWrap) {
			const className = `${collapse}--${textWrap}`;
			css += `
				.${className} .item-content {
					white-space: ${collapse} ${textWrap};
				}
			`;
		}
	}

	style.textContent = css;
	document.head.appendChild(style);
}

// HTMLの生成
function generateHTML() {
	const main = document.querySelector("main");
	if (!main) return;

	// 基本的な値のセクション
	main.innerHTML += `
		<div class="section">
			<h2>基本的な値</h2>
			<div class="box">
				${whiteSpaceValues.basic
					.map(
						(value) => `
					<div class="item ${value}">
						<h3>white-space: ${value}</h3>
						<div class="item-content">${demoText}</div>
					</div>
				`,
					)
					.join("")}
			</div>
		</div>
	`;

	// white-space-collapseとtext-wrapの組み合わせのセクション
	main.innerHTML += `
		<div class="section">
			<h2>white-space-collapse と text-wrap の組み合わせ</h2>
			<div class="box">
				${whiteSpaceValues.collapse
					.map(
						(collapse) => `
					${whiteSpaceValues.textWrap
						.map((textWrap) => {
							const className = `${collapse}--${textWrap}`;
							if (invalidClassNames.includes(className)) return "";
							return `
							<div class="item ${className}">
								<h3>white-space: ${collapse} ${textWrap}</h3>
								<div class="item-content">${demoText}</div>
							</div>
						`;
						})
						.join("")}
				`,
					)
					.join("")}
			</div>
		</div>
	`;
}

// getComputedStyleの値を表示
function showComputedStyles() {
	const contents = document.querySelectorAll(".item-content");
	for (const content of contents) {
		const computedStyle = getComputedStyle(content);
		const result = document.createElement("span");
		result.className = "result";
		result.textContent = computedStyle.whiteSpace;
		content.parentElement.querySelector("h3").appendChild(result);
	}
}

// 初期化
document.addEventListener("DOMContentLoaded", () => {
	generateCSSRules();
	generateHTML();
	showComputedStyles();
});
