import { playerMixin } from "/assets/js/playerMixin.js";
import { applyMixin } from "/assets/js/applyMixin.js";

export class ChannelSplitPlayer {
	constructor() {
		this._numChannels = Number.NaN;
		this._channelGain = [];

		this.on("loaded", () => this._audioLoaded());
	}

	_audioLoaded() {
		const numChannelsChanged = this._numChannels !== this.audioBuffer.numberOfChannels;
		this._numChannels = this.audioBuffer.numberOfChannels;

		this.removeFilter();

		const ac = this.audioContext;

		if (this._splitter) {
			for (const node of this._channelGain) {
				node.disconnect();
			}
		}

		this._channelGain = [];
		while (this._channelGain.length < this._numChannels) {
			this._channelGain.push(ac.createGain());
		}

		const splitter = ac.createChannelSplitter(this._numChannels);
		this._splitter = splitter;

		const merger = ac.createChannelMerger(this._numChannels);
		this._merger = merger;

		for (let i = 0; i < this._numChannels; i++) {
			// AudioNode.connect(destinationNode: AudioNode, outputIndex?: number, inputIndex?: number): void
			splitter.connect(this._channelGain[i], i);
			this._channelGain[i].connect(merger, 0, i);
		}

		// insertFilter(inputNode: AudioNode, outputNode?: AudioNode): void
		this.insertFilter(splitter, merger);

		// イベントの実行順に注意
		if (numChannelsChanged) {
			this.emit("numChannelsChanged", this._numChannels);
		}
	}

	get numChannels() {
		return this._numChannels;
	}

	/**
	 * 特定のチャンネルのゲイン値を取得します
	 * @param {number} channelIndex - ゲイン値を取得するチャンネルのインデックス
	 * @returns {number} ゲイン値
	 */
	getChannelGain(channelIndex) {
		if (Number.isNaN(this._numChannels)) {
			return 0;
		}
		if (channelIndex < 0 || channelIndex >= this._numChannels) {
			throw new Error(`チャンネルインデックスが範囲外です: ${channelIndex}`);
		}
		return this._channelGain[channelIndex].gain.value;
	}

	/**
	 * 特定のチャンネルのゲイン値を設定します
	 * @param {number} channelIndex - ゲイン値を設定するチャンネルのインデックス
	 * @param {number} value - 設定するゲイン値
	 */
	setChannelGain(channelIndex, value) {
		if (channelIndex < 0 || channelIndex >= this._numChannels) {
			throw new Error(`チャンネルインデックスが範囲外です: ${channelIndex}`);
		}
		this._channelGain[channelIndex].gain.value = value;
	}

	/**
	 * 全チャンネルのゲイン値を配列として取得します
	 * @returns {number[]} 全チャンネルのゲイン値の配列
	 */
	getAllChannelGains() {
		return this._channelGain.map(gain => gain.gain.value);
	}
}

applyMixin(ChannelSplitPlayer, playerMixin);
