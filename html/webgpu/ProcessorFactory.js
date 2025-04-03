/* global GPUBufferUsage, GPUMapMode */

/**
 * @typedef {(data: T) => Promise<T>} Runner
 */

/**
 * @typedef {Object} Processor
 * @property {"cpu" | "gpu"} use
 * @property {string} name
 * @property {string} type
 * @property {number?} dataSize
 * @property {number?} chunkSize
 * @property {number?} bufferSize
 * @property {Runner} run
 */

/**
 * @typedef {Object} ProcessorFactoryOptions
 * @property {number?} workgroupSize
 * @property {'low-power' | 'high-performance' | undefined} powerPreference
 */

export class ProcessorFactory {
	/**
	 * @param {ProcessorFactoryOptions} options
	 */
	constructor(options = {}) {
		const {
			workgroupSize = 64,
			powerPreference
		} = options
		this.device = null
		this.workgroupSize = workgroupSize
		this.powerPreference = powerPreference
	}

	async init() {
		console.log(`GPU: Requesting adapter with powerPreference = ${this.powerPreference ?? 'default'}`)
		const adapter = await navigator.gpu?.requestAdapter({ powerPreference: this.powerPreference })
		const device = await adapter?.requestDevice()
		this.device = device
	}

	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {Runner} cpuProcessor
	 * @param {string} gpuCode
	 * @param {null | "cpu" | "gpu"} force
	 * @returns {Processor}
	 */
	create(name, type, cpuProcessor, gpuCode, force = null) {
		if (!this.device || force === 'cpu') {
			console.log(`${name}: Using CPU processor`)
			return {
				use: 'cpu',
				name,
				type,
				run: cpuProcessor
			}
		}
		console.log(`${name}: Using GPU processor`)
		return this.createGPUProcessor(name, type, gpuCode)
	}

	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {string} gpuCode
	 * @returns {Processor}
	 */
	createGPUProcessor(name, type, gpuCode) {
		const createArray = (...args) => {
			switch (type) {
				case 'f32':
					return new Float32Array(...args)
				case 'i32':
					return new Int32Array(...args)
				case 'u32':
					return new Uint32Array(...args)
				default:
					throw new Error(`Unknown type: ${type}`)
			}
		}

		const module = this.createModule(name, type, gpuCode)
		const pipeline = this.createPipeline(name, module)

		// 1データの長さ
		const dataSize = createArray(0).BYTES_PER_ELEMENT

		// 一度に計算するワークグループ数
		const maxWorkgroupsPerOnce = ((max) => {
			let next = 1
			while (next * 2 <= max) {
				next *= 2
			}
			return next
		})(Math.floor(this.device.limits.maxComputeWorkgroupsPerDimension / dataSize))

		// 一度に計算するデータ数
		const chunkSize = maxWorkgroupsPerOnce * this.workgroupSize
		const bufferSize = chunkSize * dataSize

		const workBuffer = this.device.createBuffer({
			label: `${name} work buffer`,
			size: bufferSize,
			usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
		})

		const resultBuffer = this.device.createBuffer({
			label: `${name} result buffer`,
			size: bufferSize,
			usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
		})

		const bindGroup = this.device.createBindGroup({
			label: `${name} bindGroup for work buffer`,
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{ binding: 0, resource: { buffer: workBuffer } }
			]
		})

		return {
			use: 'gpu',
			name,
			type,
			dataSize,
			chunkSize,
			bufferSize,
			run: async (input) => {
				// 結果をすべて連結した配列
				const result = createArray(input.length)

				for (let offset = 0; offset < input.length; offset += chunkSize) {
					const chunk = input.slice(offset, offset + chunkSize)
					this.device.queue.writeBuffer(workBuffer, 0, chunk)

					const encoder = this.device.createCommandEncoder({
						label: `${name} encoder`
					})
					const pass = encoder.beginComputePass({
						label: `${name} compute pass`
					})
					pass.setPipeline(pipeline)
					pass.setBindGroup(0, bindGroup)
					const numWorkgroups = Math.ceil(input.length / (this.workgroupSize ** 2))
					pass.dispatchWorkgroups(numWorkgroups)
					pass.end()

					encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size)

					const commandBuffer = encoder.finish()
					this.device.queue.submit([commandBuffer])

					await resultBuffer.mapAsync(GPUMapMode.READ)
					const chunkResult = createArray(resultBuffer.getMappedRange().slice())
					resultBuffer.unmap()

					result.set(chunkResult.slice(0, chunk.length), offset)
				}

				return result
			}
		}
	}

	/**
	 * @param {string} name
	 * @param {string} type
	 * @param {string} gpuCode
	 * @returns {GPUShaderModule}
	 */
	createModule(name, type, gpuCode) {
		return this.device.createShaderModule({
			label: `${name} module`,
			code: `
			  @group(0) @binding(0) var<storage, read_write> data: array<${type}>;

			  @compute @workgroup_size(${this.workgroupSize}, 1, 1)
			  fn ${name}(
				@builtin(global_invocation_id) id: vec3<u32>
			  ) {
				let i = id.x;
				${gpuCode}
			  }
			`
		})
	}

	/**
	 * @param {string} name
	 * @param {GPUShaderModule} module
	 * @returns {GPUComputePipeline}
	 */
	createPipeline(name, module) {
		return this.device.createComputePipeline({
			label: `${name} pipeline`,
			layout: 'auto',
			compute: {
				module,
				entryPoint: name
			}
		})
	}
}
