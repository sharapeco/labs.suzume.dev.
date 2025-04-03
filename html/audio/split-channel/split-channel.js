import { createElementWithRef as h } from "/assets/js/createElement.js";
import { createDropArea } from "/assets/js/createDropArea.js";
import { Controls } from "../controls/Controls.js";
import { ChannelSplitPlayer } from "./ChannelSplitPlayer.js";

const player = new ChannelSplitPlayer();
const controls = new Controls(player);

// デバッグ用
window.player = player;

function main() {
	const { element: controlPanel } = createControlPanel();

	// ドロップエリアを作成
	const dropArea = createDropArea({
		onDrop: async (files) => {
			const audioFile = Array.from(files).find((file) =>
				file.type.startsWith("audio/"),
			);
			if (audioFile) {
				player.load(audioFile);
			}
		},
	});
	document.body.append(dropArea, controls.element, controlPanel);

	player.load("/assets/audio/allegro-vivace.mp3");
}

function createControlPanel() {
	const { element, refs } = h(
		"div",
		{
			style: {
				display: "flex",
				flexDirection: "column",
				gap: "10px",
				padding: "15px",
				backgroundColor: "#f5f5f5",
				borderRadius: "8px",
				marginBottom: "20px",
			},
		},
		[
			// チャンネルコントロール
			h(
				"div",
				{
					ref: "channelControlsContainer",
					style: {
						display: "flex",
						flexDirection: "column",
						gap: "8px",
						marginTop: "10px",
					},
				},
				[
					h(
						"div",
						{
							style: {
								fontWeight: "bold",
								marginBottom: "5px",
							},
						},
						"チャンネル制御:",
					),
				],
			),
		],
	);

	// チャンネルコントロールを作成する関数
	function createChannelControl(channelIndex) {
		const channelGain = player.getChannelGain(channelIndex) || 1;
		const channelName = `ch${channelIndex + 1}`;

		const { element: channelControl, refs: channelRefs } = h(
			"div",
			{
				class: "channel-control",
				"data-channel": channelIndex,
				style: {
					display: "flex",
					flexDirection: "column",
					gap: "5px",
					marginBottom: "10px",
					padding: "8px",
					border: "1px solid #ddd",
					borderRadius: "5px",
				},
			},
			[
				// チャンネル名とトグル
				h(
					"div",
					{
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: "5px",
						},
					},
					[
						h(
							"label",
							{
								style: {
									display: "flex",
									alignItems: "center",
									cursor: "pointer",
								},
							},
							[
								h("input", {
									ref: "channelToggle",
									type: "checkbox",
									checked: channelGain > 0 ? "checked" : null,
									on: {
										change: (e) => {
											const newGain = e.target.checked ? 1 : 0;
											player.setChannelGain(channelIndex, newGain);
											if (e.target.checked) {
												channelRefs.gainSlider.value = 1;
												channelRefs.gainValue.textContent = "1.0";
											} else {
												channelRefs.gainSlider.value = 0;
												channelRefs.gainValue.textContent = "0.0";
											}
										},
									},
								}),
								h(
									"span",
									{
										style: {
											marginLeft: "5px",
										},
									},
									channelName,
								),
							],
						),
					],
				),
				// 音量スライダー
				h(
					"div",
					{
						style: {
							display: "flex",
							alignItems: "center",
							gap: "10px",
						},
					},
					[
						h(
							"span",
							{
								style: {
									minWidth: "40px",
								},
							},
							"音量:",
						),
						h("input", {
							ref: "gainSlider",
							type: "range",
							min: "0",
							max: "2",
							step: "0.01",
							value: channelGain,
							style: {
								flex: "1",
							},
							on: {
								input: (e) => {
									const value = Number.parseFloat(e.target.value);
									player.setChannelGain(channelIndex, value);
									channelRefs.gainValue.textContent = value.toFixed(2);
									channelRefs.channelToggle.checked = value > 0;
								},
							},
						}),
						h(
							"span",
							{
								ref: "gainValue",
								style: {
									minWidth: "40px",
									textAlign: "right",
								},
							},
							channelGain.toFixed(2),
						),
					],
				),
			],
		);

		return { element: channelControl, refs: channelRefs };
	}

	// チャンネルコントロールを更新する関数
	function updateChannelControls() {
		const container = refs.channelControlsContainer;
		// 既存のチャンネルコントロールを削除
		for (const el of container.querySelectorAll(".channel-control")) {
			el.remove();
		}

		// チャンネル数に応じてコントロールを追加
		const numChannels = Number.isNaN(player.numChannels) ? 0 : player.numChannels;
		for (let i = 0; i < numChannels; i++) {
			const { element } = createChannelControl(i);
			container.appendChild(element);
		}
	}

	// numChannelsChangedイベントのリスナーを追加
	player.on("numChannelsChanged", () => {
		updateChannelControls();
	});

	// 初期チャンネルコントロールを設定
	updateChannelControls();

	return { element, refs };
}

main();
