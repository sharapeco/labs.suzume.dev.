import { eventMixin } from "./eventMixin.js";
import { loadAudioData } from "./loadAudioData.js";
import { decodeAudio } from "./decodeAudio.js";

/**
 * 音声再生のためのミックスイン
 *
 * ### 追加されるプロパティ
 * - src: string | URL | null
 * - sampleRate: number
 * - isReady: boolean
 * - isPlaying: boolean
 * - duration: number
 * - volume: number
 * - muted: boolean
 * - playbackRate: number
 * - currentTime: number
 * - audioContext: AudioContext | undefined
 * - audioBuffer: AudioBuffer | undefined
 *
 * ### 追加されるメソッド
 * - insertFilter(inputNode: AudioNode, outputNode?: AudioNode): void
 * - removeFilter(): void
 * - load(urlOrBlob: string | URL | Blob): Promise<void>
 * - play(start?: number, stop?: number): Promise<void>
 * - pause(): void
 * - stop(): void
 * - skip(seconds: number): void
 *
 * ### 追加されるプライベートプロパティ
 * - _playerMixin
 *
 * ### オーディオノードの接続関係
 * 1. sourceNode: AudioBufferSourceNode
 * 2. filterInputNode: AudioNode
 * 3. …
 * 4. filterOutputNode: AudioNode
 * 5. gainNode: GainNode
 * 6. audioContext.destination: AudioDestinationNode
 *
 * @type {import("./applyMixin.js").BaseObject}
 */

/**
 * _playerMixinの初期化
 * @private
 * @param {Object} obj
 */
function initPlayerMixin(obj) {
	if (!obj._playerMixin) {
		const playerMixin = {
			src: null,
			sampleRate: 44100,
			audioContext: null,
			gainNode: null,
			sourceNode: null,
			filterInputNode: null,
			filterOutputNode: null,
			audioBuffer: null,
			startedAt: null,
			pausedAt: null,
			playerLoadController: null,
			decodingURL: null,
			timeUpdateInterval: null,
			// 再開時に必要となる
			volume: 1,
			muted: false,
			playbackRate: 1,
			/** AudioContext と GainNode を初期化 */
			initAudioContext() {
				playerMixin.audioContext = new AudioContext();
				playerMixin.gainNode = playerMixin.audioContext.createGain();
				playerMixin.gainNode.gain.value = obj.muted ? 0 : obj.volume;
				playerMixin.gainNode.connect(playerMixin.audioContext.destination);
			},
			/** timeupdate イベントを発行するための内部メソッド */
			startTimeUpdateInterval() {
				playerMixin.stopTimeUpdateInterval();
				playerMixin.timeUpdateInterval = setInterval(() => {
					obj.emit("timeupdate", obj.currentTime);
				}, 250);
			},
			stopTimeUpdateInterval() {
				if (playerMixin.timeUpdateInterval) {
					clearInterval(playerMixin.timeUpdateInterval);
					playerMixin.timeUpdateInterval = null;
				}
			},
		};
		obj._playerMixin = playerMixin;
	}
}

export const playerMixin = {
	...eventMixin,

	src: {
		/**
		 * @returns {string | null}
		 */
		get() {
			initPlayerMixin(this);
			return this._playerMixin.src?.toString() ?? null;
		},
		/**
		 * @param {string | URL} url
		 */
		set(url) {
			initPlayerMixin(this);
			this._playerMixin.src = url;
			this.load(url);
		},
	},

	sampleRate: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.sampleRate;
		},
		set(sampleRate) {
			initPlayerMixin(this);
			this._playerMixin.sampleRate = sampleRate;
		},
	},

	/** 音声データが読み込まれているかを返す */
	isReady: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.audioBuffer != null;
		},
	},

	isPlaying: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.sourceNode != null;
		},
	},

	currentTime: {
		get() {
			initPlayerMixin(this);
			if (this._playerMixin.startedAt == null)
				return this._playerMixin.pausedAt ?? 0;
			return (
				(this._playerMixin.audioContext.currentTime -
					this._playerMixin.startedAt) *
				this._playerMixin.playbackRate
			);
		},
		set(time) {
			initPlayerMixin(this);
			const wasPlaying = this.isPlaying;
			if (wasPlaying) {
				this.play(time);
			} else {
				this._playerMixin.pausedAt = time;
			}
			this.emit("seek", time);
		},
	},

	duration: {
		get() {
			return this._playerMixin?.audioBuffer?.duration ?? Number.NaN;
		},
	},

	volume: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.volume;
		},
		set(volume) {
			initPlayerMixin(this);
			this._playerMixin.volume = volume;
			if (this._playerMixin.gainNode && !this._playerMixin.muted) {
				this._playerMixin.gainNode.gain.value = volume;
			}
		},
	},

	muted: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.muted;
		},
		set(muted) {
			initPlayerMixin(this);
			this._playerMixin.muted = muted;
			if (this._playerMixin.gainNode) {
				this._playerMixin.gainNode.gain.value = muted
					? 0
					: this._playerMixin.volume;
			}
		},
	},

	playbackRate: {
		get() {
			initPlayerMixin(this);
			return this._playerMixin.playbackRate;
		},
		set(rate) {
			initPlayerMixin(this);
			if (this._playerMixin.sourceNode != null) {
				this._playerMixin.sourceNode.playbackRate.value = rate;

				// 再生中に変更した場合は currentTime を正しく更新するために
				// startedAt の値を再生速度に応じて更新する
				const currentTime =
					(this._playerMixin.audioContext.currentTime -
						this._playerMixin.startedAt) *
					this._playerMixin.playbackRate;
				this._playerMixin.startedAt =
					this._playerMixin.audioContext.currentTime - currentTime / rate;
			}
			this._playerMixin.playbackRate = rate;
		},
	},

	audioContext: {
		get() {
			initPlayerMixin(this);
			if (!this._playerMixin.audioContext) {
				this._playerMixin.initAudioContext();
			}
			return this._playerMixin.audioContext;
		},
	},

	audioBuffer: {
		get() {
			return this._playerMixin?.audioBuffer;
		},
	},

	/**
	 * Load an audio file
	 *
	 * @param {string | URL | Blob} urlOrBlob
	 * @returns {Promise<void>}
	 */
	async load(urlOrBlob) {
		initPlayerMixin(this);
		if (this._playerMixin.playerLoadController != null) {
			this._playerMixin.playerLoadController.abort();
		}

		const isBlob = urlOrBlob instanceof Blob;
		const urlString = isBlob
			? URL.createObjectURL(urlOrBlob)
			: urlOrBlob.toString();
		if (isBlob) {
			URL.revokeObjectURL(urlString);
		}

		if (this.isPlaying) {
			this.pause();
		}

		this._playerMixin.playerLoadController = new AbortController();
		this.emit("load", urlString);

		try {
			/** 進捗の表示に用いる、デコード処理の割合 */
			const decodeWeight = isBlob ? 1 : 0.5;
			const loadWeight = 1 - decodeWeight;

			const blob = isBlob
				? urlOrBlob
				: await loadAudioData(
						urlOrBlob,
						(percent) => this.emit("loading", loadWeight * percent),
						this._playerMixin.playerLoadController.signal,
					);

			// AudioBuffer へのデコード
			this._playerMixin.decodingURL = urlString;
			const audioBuffer = await decodeAudio(blob, {
				sampleRate: this.sampleRate,
				signal: this._playerMixin.playerLoadController.signal,
				progressCallback: (progress) =>
					this.emit("loading", loadWeight + decodeWeight * progress),
			});
			if (urlString !== this._playerMixin.decodingURL) {
				// AudioContext.decodeAudioData は中断できないため、
				// 最後に読み込んだ URL と一致しない場合は中断されたと判断する
				return;
			}

			this._playerMixin.audioBuffer = audioBuffer;
			this._playerMixin.pausedAt = null;
			this._playerMixin.startedAt = null;
			this._playerMixin.sourceNode = null;
			this.emit("loaded", blob, urlString);
		} catch (err) {
			if (err.name === "AbortError") {
				return;
			}
			this.destroy();
			this.emit("error", err);
		} finally {
			this._playerMixin.playerLoadController = null;
		}
	},

	destroy() {
		initPlayerMixin(this);
		this.stop();
		this._playerMixin.audioBuffer = undefined;
		this._playerMixin.audioContext?.close();
		this._playerMixin.audioContext = undefined;
	},

	/**
	 * Start playing the audio
	 *
	 * @param {number} [start] - Start time in seconds
	 * @param {number} [stop] - Stop time in seconds
	 * @returns {Promise<void>}
	 */
	async play(start, stop) {
		initPlayerMixin(this);
		if (!this._playerMixin.audioBuffer) return;

		// AudioContext と GainNode の初期化
		if (!this._playerMixin.audioContext) {
			this._playerMixin.initAudioContext();
		}

		// 既存の再生を停止し、毎回新しい AudioBufferSourceNode を作成
		const prevSource = this._playerMixin.sourceNode;
		if (prevSource) {
			prevSource.onended = null;
			prevSource.stop();
			this._playerMixin.sourceNode = null;
		}
		const source = this._playerMixin.audioContext.createBufferSource();
		source.buffer = this._playerMixin.audioBuffer;
		source.playbackRate.value = this._playerMixin.playbackRate;
		this._playerMixin.sourceNode = source;

		// ソース–[フィルタ]–GainNode(–出力) を接続
		source.connect(
			this._playerMixin.filterInputNode ?? this._playerMixin.gainNode,
		);
		if (this._playerMixin.filterOutputNode) {
			this._playerMixin.filterOutputNode.connect(this._playerMixin.gainNode);
		}

		// 再生開始時刻を記録し、再生を開始
		const startTime = start ?? this._playerMixin.pausedAt ?? 0;
		this._playerMixin.startedAt =
			this._playerMixin.audioContext.currentTime -
			startTime / this._playerMixin.playbackRate;
		this._playerMixin.pausedAt = null;
		source.start(0, startTime);

		// 再生が終了したら、ユーザ操作により停止したのか、
		// 再生が終了したのかを判断してイベントを発行
		source.onended = () => {
			this._playerMixin.sourceNode?.stop();
			this._playerMixin.sourceNode = null;
			this._playerMixin.stopTimeUpdateInterval();
			if (!this._playerMixin.audioBuffer) {
				return;
			}
			if (this.currentTime >= this._playerMixin.audioBuffer.duration) {
				this.emit("finish");
			} else {
				this._playerMixin.pausedAt = this.currentTime;
				this.emit("pause");
			}
		};
		this.emit("play");

		// stop が指定されている場合は、指定時刻で再生を停止
		if (stop != null && stop < this._playerMixin.audioBuffer.duration) {
			const duration = stop - startTime;
			source.stop(
				this._playerMixin.audioContext.currentTime +
					duration / this._playerMixin.playbackRate,
			);
		}

		// 定期的な timeupdate イベントの発行
		this._playerMixin.startTimeUpdateInterval();
	},

	/** Pause the audio */
	pause() {
		initPlayerMixin(this);
		if (!this._playerMixin.sourceNode) return;

		this._playerMixin.pausedAt = this.currentTime;
		this._playerMixin.sourceNode.stop(); // この際に pause イベントが発行される
		this._playerMixin.sourceNode = null;
		this._playerMixin.stopTimeUpdateInterval();
	},

	/** Stop and rewind the audio */
	stop() {
		initPlayerMixin(this);
		const prevSource = this._playerMixin.sourceNode;
		if (prevSource) {
			prevSource.onended = null;
			prevSource.stop();
			this._playerMixin.sourceNode = null;
		}
		this._playerMixin.startedAt = null;
		this._playerMixin.pausedAt = 0;
		this.emit("stop");
	},

	/** Skip a number of seconds */
	skip(seconds) {
		initPlayerMixin(this);
		const wasPlaying = this.isPlaying;
		const time = this.currentTime + seconds;
		if (wasPlaying) {
			this.play(time);
		} else {
			this._playerMixin.pausedAt = time;
		}
		this.emit("seek", time);
	},

	/**
	 * フィルタをかます
	 *
	 * @param {AudioNode} inputNode
	 * @param {AudioNode} outputNode
	 */
	insertFilter(inputNode, outputNode = inputNode) {
		initPlayerMixin(this);
		this._playerMixin.filterInputNode = inputNode;
		this._playerMixin.filterOutputNode = outputNode;

		if (this._playerMixin.sourceNode) {
			this._playerMixin.sourceNode.disconnect(this._playerMixin.gainNode);
			this._playerMixin.sourceNode.connect(this._playerMixin.filterInputNode);
		}
		if (this._playerMixin.gainNode) {
			this._playerMixin.filterOutputNode.connect(this._playerMixin.gainNode);
		}
	},

	/**
	 * フィルタをはずす
	 */
	removeFilter() {
		initPlayerMixin(this);
		if (this._playerMixin.sourceNode && this._playerMixin.filterInputNode) {
			this._playerMixin.sourceNode.disconnect(
				this._playerMixin.filterInputNode,
			);
			this._playerMixin.sourceNode.connect(this._playerMixin.gainNode);
		}
		if (this._playerMixin.gainNode && this._playerMixin.filterOutputNode) {
			this._playerMixin.filterOutputNode.disconnect(this._playerMixin.gainNode);
		}

		this._playerMixin.filterInputNode = null;
		this._playerMixin.filterOutputNode = null;
	},
};
