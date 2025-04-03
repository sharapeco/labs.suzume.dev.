export const styles = `
:host {
	--light: #f8f9fa;
	--gray-light: #dee2e6;
	--gray: #6c757d;
	--gray-dark: #343a40;
	--dark: #1a1f24;
	--primary: 0, 123, 255;
	--error: #dc3545;

	--color: var(--dark);
	--background-color: var(--light);
}

button {
	appearance: none;
	padding: 8px;
	border: none;
	background: none;
	border-radius: 4px;
	cursor: pointer;
	color: var(--gray-dark);
}

button:hover,
button:focus {
	color: var(--dark);
}

button:active {
	color: var(--dark);
	background-color: var(--gray-light);
}

.controls {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px 4px 4px;
	color: var(--color);
	background-color: var(--background-color);
}

.play-pause {
	display: flex;
	align-items: center;
	justify-content: center;
}

.seek-bar {
	flex: 1;
	height: 10px;
	background-color: var(--background-color);
}

.time-display {
	padding: 0 0.5em;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
}

.volume-container {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 180px;
}

.volume-slider {
	flex: 1;
	width: 0;
	background-color: var(--background-color);
}

.playback-rate-container {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 180px;
}

.playback-rate-slider {
	flex: 1;
	width: 0;
	background-color: var(--background-color);
}

.playback-rate-value {
	font-size: 12px;
}
`;