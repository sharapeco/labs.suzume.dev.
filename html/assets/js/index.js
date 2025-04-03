import { contents } from "/build/index.js";
import { createElementWithRef as h } from "./createElement.js";

let contentsRef;

// 検索機能の実装
function searchContents(query) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

	return contents.filter((content) => {
		if (terms.length === 0) return true;

		return terms.every((term) => {
			const searchableText = [
				content.title,
				content.description,
				...(content.keywords || []),
			]
				.join(" ")
				.toLowerCase();

			return searchableText.includes(term);
		});
	});
}

// コンテンツカードの生成
function createContentCard(content) {
	return h(
		"a",
		{
			class: "content-card",
			href: content.url,
			target: "_blank",
			rel: "noopener noreferrer",
		},
		[
			h("h2", { class: "content-title" }, content.title),
			h("p", { class: "content-description" }, content.description),
			h(
				"div",
				{ class: "keywords" },
				(content.keywords || []).map((keyword) =>
					h(
						"span",
						{
							class: "keyword",
							"data-keyword": keyword,
						},
						keyword,
					),
				),
			),
		],
	);
}

// メインのUI生成
function createUI() {
	const { element, refs } = h("main", { class: "main" }, [
		h("div", { id: "search" }, [
			h("input", {
				type: "text",
				class: "search-box",
				placeholder: "検索キーワードを入力...",
				ref: "searchInput",
				on: {
					input: (e) => {
						const query = e.target.value;
						const filteredContents = searchContents(query);
						// 検索結果が0件の場合、直前の結果を保持
						if (filteredContents.length === 0 && contents.length > 0) {
							e.target.classList.add('no-results');
							return;
						}
						e.target.classList.remove('no-results');
						renderContents(filteredContents);
					},
				},
			}),
		]),
		h("div", { id: "contents", ref: "contentsContainer" }),
	]);
	contentsRef = refs.contentsContainer;

	// キーワードのクリックイベントをグローバルに設定
	document.addEventListener("click", (e) => {
		const keywordElement = e.target.closest(".keyword");
		if (keywordElement) {
			e.preventDefault();
			e.stopPropagation();
			const keyword = keywordElement.dataset.keyword;
			refs.searchInput.value = keyword;
			const filteredContents = searchContents(keyword);
			// 検索結果が0件の場合、直前の結果を保持
			if (filteredContents.length === 0 && contents.length > 0) {
				refs.searchInput.classList.add('no-results');
				return;
			}
			refs.searchInput.classList.remove('no-results');
			renderContents(filteredContents);
		}
	});

	// 初期表示
	renderContents(contents);

	return element;
}

// コンテンツの描画
function renderContents(contents) {
	contentsRef.innerHTML = "";
	for (const content of contents) {
		contentsRef.appendChild(createContentCard(content).element);
	}
}

// アプリケーションの初期化
document.addEventListener("DOMContentLoaded", () => {
	document.body.appendChild(createUI());
});
