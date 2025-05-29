export class PromiseQueue {
	private queue = Promise.resolve()

	add<T>(task: () => Promise<T>): Promise<T> {
		// Create a promise that will be resolved with the task's result
		let resolveResult: (value: T) => void
		let rejectResult: (reason: any) => void

		const resultPromise = new Promise<T>((resolve, reject) => {
			resolveResult = resolve
			rejectResult = reject
		})

		// Add the task to the queue
		this.queue = this.queue
			.then(() => task())
			.then(
				(result) => {
					resolveResult(result)
					return undefined // Don't propagate result in the queue
				},
				(error) => {
					rejectResult(error)
					return undefined // Don't propagate error in the queue
				}
			)

		return resultPromise
	}
}
