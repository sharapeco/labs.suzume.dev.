import { createElementWithRef as h } from "/assets/js/createElement.js";
import { styles } from "./styles.js";

/**
 * コントロール オプション
 * @typedef {Object} ControlsOptions
 * @property {boolean} showTime - 時間を表示するか
 * @property {boolean} showVolume - 音量を表示するか
 * @property {boolean} showPlaybackRate - 再生速度を表示するか
 */

/** カスタム要素としてスタイリングするため */
class ControlsElement extends HTMLElement {}
window.customElements.define("player-controls", ControlsElement);

/**
 * コントロール コンポーネント
 */
export class Controls {
	constructor(player, options = {}) {
		/** @private @type {function[]} */
		this._subscriptions = [];

		/** @private @type {playerMixin} */
		this.player = player;
		/** @private @type {ControlsOptions} */
		this.options = {
			showTime: true,
			showVolume: true,
			showPlaybackRate: true,
			...options,
		};

		/** @private @type {ControlsElement} */
		this.container = new ControlsElement();

		this.initControls();
		this.bindEvents();
	}

	get element() {
		return this.container;
	}

	initControls() {
		const shadow = this.container.attachShadow({ mode: "closed" });

		const styleElement = h("style", {}, styles).element;
		const { element, refs, subscriptions } = h(
			"div",
			{
				class: "controls",
			},
			[
				h(
					"button",
					{
						ref: "playPauseButton",
						class: "play-pause",
						type: "button",
						on: { click: () => this.playPause() },
						"aria-label": "Play/Pause",
					},
					[],
				),
				h("input", {
					ref: "seekBar",
					class: "seek-bar",
					type: "range",
					min: 0,
					max: 0,
					step: 0.01,
					value: 0,
					on: { input: (event) => this.seek(event.target.value) },
				}),
				h("div", { class: "time-display" }, [
					h("span", { ref: "currentTime", class: "current-time" }, [
						this.player.isReady
							? this.formatTime(this.player.currentTime)
							: "--:--",
					]),
					h("span", { class: "separator" }, ["/"]),
					h("span", { ref: "duration", class: "duration" }, [
						this.player.isReady
							? this.formatTime(this.player.duration)
							: "--:--",
					]),
				]),
				h("div", { class: "volume-container" }, [
					h(
						"button",
						{
							ref: "volumeIcon",
							class: "volume-icon",
							type: "button",
							on: { click: () => this.toggleMute() },
							"aria-label": "Volume",
						},
						[],
					),
					h("input", {
						ref: "volumeSlider",
						class: "volume-slider",
						type: "range",
						min: 0,
						max: 2,
						step: 0.1,
						value: 1,
						on: { input: (event) => this.setVolume(event.target.value) },
					}),
				]),
				h("div", { class: "playback-rate-container" }, [
					h(
						"button",
						{
							ref: "playbackRateIcon",
							class: "playback-rate-icon",
							type: "button",
							"aria-label": "Playback Rate",
							on: { click: () => this.setPlaybackRate(1) },
						},
						[],
					),
					h("input", {
						ref: "playbackRateSlider",
						class: "playback-rate-slider",
						type: "range",
						min: 0.1,
						max: 2,
						step: 0.1,
						value: 1,
						on: {
							input: (event) =>
								this.setPlaybackRate(event.target.valueAsNumber),
						},
					}),
					h(
						"span",
						{ ref: "playbackRateValue", class: "playback-rate-value" },
						[`${this.player.playbackRate.toFixed(1)}x`],
					),
				]),
			],
		);

		refs.playPauseButton.innerHTML = this.createPlayIcon();
		refs.volumeIcon.innerHTML = this.createVolumeIcon();
		refs.playbackRateIcon.innerHTML = this.createPlaybackRateIcon();

		shadow.append(styleElement, element);
		this._subscriptions.push(...subscriptions);
		this.refs = refs;
	}

	bindEvents() {
		this._subscriptions.push(
			...[
				this.player.on("play", () => {
					this.refs.playPauseButton.innerHTML = this.createPauseIcon();
				}),
				this.player.on("pause", () => {
					this.refs.playPauseButton.innerHTML = this.createPlayIcon();
				}),
				this.player.on("finish", () => {
					this.refs.playPauseButton.innerHTML = this.createPlayIcon();
				}),
				this.player.on("stop", () => {
					this.refs.playPauseButton.innerHTML = this.createPlayIcon();
				}),
				this.player.on("timeupdate", () => {
					this.refs.currentTime.textContent = this.formatTime(
						this.player.currentTime,
					);
					this.refs.seekBar.value =
						(this.player.currentTime / this.player.duration) * 100;
				}),
				this.player.on("loaded", () => {
					this.refs.seekBar.max = 100;
					this.refs.seekBar.value =
						(this.player.currentTime / this.player.duration) * 100;
					this.refs.currentTime.textContent = this.formatTime(
						this.player.currentTime,
					);
					this.refs.duration.textContent = this.formatTime(
						this.player.duration,
					);
				}),
				this.player.on("error", () => {
					this.refs.seekBar.value = 0;
					this.refs.seekBar.max = 0;
					this.refs.currentTime.textContent = "--:--";
					this.refs.duration.textContent = "--:--";
				}),
			],
		);
	}

	playPause() {
		if (this.player.isPlaying) {
			this.player.pause();
		} else {
			this.player.play();
		}
	}

	seek(value) {
		const time = (value / 100) * this.player.duration;
		this.player.currentTime = time;
		this.refs.currentTime.textContent = this.formatTime(time);
	}

	toggleMute() {
		this.player.muted = !this.player.muted;
		this.updateVolumeIcon(this.player.muted ? 0 : this.player.volume);
	}

	setVolume(volume) {
		this.player.volume = volume;
		this.updateVolumeIcon(volume);
	}

	setPlaybackRate(rate) {
		this.player.playbackRate = rate;
		this.refs.playbackRateSlider.value = rate;
		this.refs.playbackRateValue.textContent = `${rate.toFixed(1)}x`;
	}

	updateVolumeIcon(volume) {
		if (volume === 0 || this.player.muted) {
			this.refs.volumeIcon.innerHTML = this.createMuteIcon();
		} else if (volume < 0.5) {
			this.refs.volumeIcon.innerHTML = this.createVolumeLowIcon();
		} else {
			this.refs.volumeIcon.innerHTML = this.createVolumeIcon();
		}
	}

	formatTime(seconds) {
		if (Number.isNaN(seconds)) return "--:--";

		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	}

	// SVGアイコン作成メソッド
	createPlayIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z"/>
    </svg>`;
	}

	createPauseIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>`;
	}

	createVolumeIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
    </svg>`;
	}

	createVolumeLowIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
    </svg>`;
	}

	createMuteIcon() {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
    </svg>`;
	}

	createPlaybackRateIcon() {
		return `<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
    <g transform="matrix(0.557093,0,0,0.557093,1.34554,1.31488)">
        <path d="M8,5L8,19L19,12L8,5Z" style="fill-rule:nonzero;"/>
    </g>
    <path d="M1.23,3.738C2.186,2.224 3.635,1.053 5.351,0.45L5.71,2.023C4.469,2.499 3.414,3.35 2.683,4.438L1.23,3.738ZM7.111,0.049C7.403,0.017 7.7,0 8,0C9.561,0 11.018,0.448 12.25,1.223C12.762,1.545 13.235,1.923 13.661,2.349C14.906,3.597 15.742,5.252 15.95,7.097C15.983,7.394 16,7.695 16,8C16,8.305 15.983,8.606 15.95,8.903C15.742,10.748 14.906,12.403 13.661,13.651C13.235,14.077 12.762,14.455 12.25,14.777C11.018,15.552 9.561,16 8,16C7.7,16 7.403,15.983 7.111,15.951L7.47,14.378C7.645,14.393 7.822,14.4 8,14.4C9.184,14.4 10.293,14.078 11.245,13.516C11.767,13.208 12.242,12.828 12.655,12.39C13.542,11.45 14.147,10.243 14.337,8.903C14.378,8.608 14.4,8.306 14.4,8C14.4,7.694 14.378,7.392 14.337,7.097C14.147,5.757 13.542,4.55 12.655,3.61C12.242,3.172 11.767,2.792 11.245,2.484C10.293,1.922 9.184,1.6 8,1.6C7.822,1.6 7.645,1.607 7.47,1.622L7.111,0.049ZM5.351,15.55C3.635,14.947 2.186,13.776 1.23,12.262L2.683,11.562C3.414,12.65 4.469,13.501 5.71,13.977L5.351,15.55ZM0.445,10.636C0.157,9.811 0,8.924 0,8C0,7.076 0.157,6.189 0.445,5.364L1.899,6.064C1.705,6.675 1.6,7.325 1.6,8C1.6,8.675 1.705,9.325 1.899,9.936L0.445,10.636Z"/>
</svg>
`;
	}
}
