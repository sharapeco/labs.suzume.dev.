const WORKGROUP_SIZE = 64;

async function main() {
	const adapter = await navigator.gpu?.requestAdapter();
	const device = await adapter?.requestDevice();
	if (!device) {
		console.error('need a browser that supports WebGPU');
		return;
	}

	const module = device.createShaderModule({
		label: 'doubling compute module',
		code: `
		  @group(0) @binding(0)
		  var<storage, read_write> data: array<f32>;

		  @compute @workgroup_size(${WORKGROUP_SIZE}, 1, 1)
		  fn computeSomething(
			@builtin(global_invocation_id) global_id: vec3<u32>,
			@builtin(local_invocation_id) local_id: vec3<u32>,
		  ) {
			let i = global_id.x;
			data[i] = data[i] * 2.0;
		  }
		`,
	});

	const pipeline = device.createComputePipeline({
		label: 'doubling compute pipeline',
		layout: 'auto',
		compute: {
			module,
			entryPoint: 'computeSomething',
		},
	});

	const inputSize = 1e7;
	const input = new Float32Array(inputSize);
	for (let i = 0; i < inputSize; i++) {
		input[i] = i;
	}
	const result = new Float32Array(inputSize);

	// 1データの長さ
	const dataSize = input.BYTES_PER_ELEMENT;

	// 一度に計算するワークグループ数
	const maxWorkgroupsPerOnce = ((max) => {
		let next = 1;
		while (next * 2 <= max) {
			next *= 2;
		}
		return next;
	})(Math.floor(device.limits.maxComputeWorkgroupsPerDimension / dataSize));

	// 一度に計算するデータ長
	const chunkSize = maxWorkgroupsPerOnce * WORKGROUP_SIZE;
	const bufferSize = chunkSize * dataSize;

	const workBuffer = device.createBuffer({
		label: 'work buffer',
		size: bufferSize,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
	});

	const resultBuffer = device.createBuffer({
		label: 'result buffer',
		size: bufferSize,
		usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
	});

	// Setup a bindGroup to tell the shader which
	// buffer to use for the computation
	const bindGroup = device.createBindGroup({
		label: 'bindGroup for work buffer',
		layout: pipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: { buffer: workBuffer } },
		],
	});

	for (let offset = 0; offset < input.length; offset += chunkSize) {
		const chunk = input.slice(offset, offset + chunkSize);

		device.queue.writeBuffer(workBuffer, 0, chunk);

		// Encode commands to do the computation
		const encoder = device.createCommandEncoder({
			label: 'doubling encoder',
		});
		const pass = encoder.beginComputePass({
			label: 'doubling compute pass',
		});
		pass.setPipeline(pipeline);
		pass.setBindGroup(0, bindGroup);
		pass.dispatchWorkgroups(Math.ceil(chunk.length / WORKGROUP_SIZE));
		pass.end();

		// Encode a command to copy the results to a mappable buffer.
		encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

		// Finish encoding and submit the commands
		const commandBuffer = encoder.finish();
		device.queue.submit([commandBuffer]);

		// Read the results
		await resultBuffer.mapAsync(GPUMapMode.READ);
		const chunkResult = new Float32Array(resultBuffer.getMappedRange().slice());
		resultBuffer.unmap();

		result.set(chunkResult.slice(0, chunk.length), offset);
	}

	console.log('input', input);
	console.log('result', result);
}

main();
