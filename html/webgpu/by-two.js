async function main() {
	const adapter = await navigator.gpu?.requestAdapter();
	const device = await adapter?.requestDevice();
	if (!device) {
		console.error('need a browser that supports WebGPU');
		return;
	}

	const input = new Float32Array([1, 0, 3, 2, 5, 1]);
	const input2 = new Float32Array([1, 1, 3, 2, 5, 3]);

	const module = device.createShaderModule({
		label: 'doubling compute module',
		code: `
		  @group(0) @binding(0) var<storage, read_write> data: array<f32>;

		  @compute @workgroup_size(1) fn computeSomething(
			@builtin(global_invocation_id) id: vec3<u32>
		  ) {
			let i = id.x;
			if (i % 2 == 0) {
			  data[i / 2] = data[i] * 10.0 + data[i + 1];
			}
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

	// create a buffer on the GPU to hold our computation
	// input and output
	const workBuffer = device.createBuffer({
		label: 'work buffer',
		size: input.byteLength,
		usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
	});
	// Copy our input data to that buffer
	device.queue.writeBuffer(workBuffer, 0, input);

	// create a buffer on the GPU to get a copy of the results
	const resultBuffer = device.createBuffer({
		label: 'result buffer',
		size: input.byteLength,
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

	// Encode commands to do the computation
	const encoder = device.createCommandEncoder({
		label: 'doubling encoder',
	});
	const pass = encoder.beginComputePass({
		label: 'doubling compute pass',
	});
	pass.setPipeline(pipeline);
	pass.setBindGroup(0, bindGroup);
	pass.dispatchWorkgroups(input.length);
	pass.end();

	// Encode a command to copy the results to a mappable buffer.
	encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

	// Finish encoding and submit the commands
	const commandBuffer = encoder.finish();
	device.queue.submit([commandBuffer]);

	// Read the results
	await resultBuffer.mapAsync(GPUMapMode.READ);
	const result = new Float32Array(resultBuffer.getMappedRange().slice());
	resultBuffer.unmap();

	// 2回目
	device.queue.writeBuffer(workBuffer, 0, input2);

	const encoder2 = device.createCommandEncoder({
		label: 'doubling encoder',
	});
	const pass2 = encoder2.beginComputePass({
		label: 'doubling compute pass',
	});
	pass2.setPipeline(pipeline);
	pass2.setBindGroup(0, bindGroup);
	pass2.dispatchWorkgroups(input.length);
	pass2.end();

	encoder2.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

	const commandBuffer2 = encoder2.finish();
	device.queue.submit([commandBuffer2]);

	await resultBuffer.mapAsync(GPUMapMode.READ);
	const result2 = new Float32Array(resultBuffer.getMappedRange().slice());
	resultBuffer.unmap();

	console.log('input', input);
	console.log('result', result);
	console.log('result2', result2);
}

main();
