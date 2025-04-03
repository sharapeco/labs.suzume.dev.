export async function loadAudioData(url, progressCallback, signal) {
	const response = await fetch(url, { signal });
	watchProgress(response.clone(), progressCallback);
	const blob = await response.blob();
    if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
    }
	return blob;
}

async function watchProgress(response, progressCallback) {
	if (!response.body || !response.headers) return;

    const reader = response.body.getReader();
	const contentLength = Number(response.headers.get("Content-Length")) || 0;
	let receivedLength = 0;

    const processChunk = async (value) => {
		// Add to the received length
		receivedLength += value?.length || 0;
		progressCallback(receivedLength / contentLength);
	};

    const read = async () => {
		let data;
		try {
			data = await reader.read();
		} catch {
			// Ignore errors because we can only handle the main response
			return;
		}
		// Continue reading data until done
		if (!data.done) {
			processChunk(data.value);
			await read();
		}
	};

    read();
}
