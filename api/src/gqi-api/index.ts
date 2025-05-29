import { GqiMessage, GqiOperationStage, GqiOperationStatus, GqiRequest, GqiResponse, GqiResponseType } from "./types"

export class GQI {
	private static readonly GQI_URL = "http://localhost:24000/messages"
	private messages: GqiMessage[] = []
	public readonly url: string
	private isConnected: boolean = false

	constructor(url: string) {
		this.url = url
		this.init()
	}

	public subscribe(id: string, request: GqiRequest, timestamp?: number) {
		if (!this.isConnected) return
		const message: GqiMessage = {
			id,
			request,
			url: this.url,
			timestamp: timestamp ? timestamp : Date.now(),
			sequence: 0,
			stage: GqiOperationStage.SUBSCRIBE,
			status: GqiOperationStatus.PENDING,
			isError: false,
		}
		this.messages.push(message)
		return this.postMessage(message)
	}

	public next(id: string, response: GqiResponse, timestamp?: number) {
		if (!this.isConnected) return
		const message = this.messages.find((m) => m.id === id)
		if (!message) return

		const isFailed = response.type === GqiResponseType.ERROR
		Object.assign(message, {
			response,
			timestamp: timestamp ? timestamp : Date.now(),
			sequence: message.sequence + 1,
			stage: isFailed ? GqiOperationStage.ERROR : GqiOperationStage.NEXT,
			status: isFailed ? GqiOperationStatus.FAILED : GqiOperationStatus.PENDING,
			isError: isFailed,
		})
		return this.postMessage(message)
	}

	public complete(id: string, timestamp?: number) {
		if (!this.isConnected) return
		const message = this.messages.find((m) => m.id === id)
		if (!message) return

		Object.assign(message, {
			timestamp: timestamp ? timestamp : Date.now(),
			status: GqiOperationStatus.COMPLETED,
			stage: GqiOperationStage.COMPLETE,
		})
		return this.postMessage(message)
	}

	public close(id: string, timestamp?: number) {
		if (!this.isConnected) return
		const message = this.messages.find((m) => m.id === id)
		if (!message) return

		Object.assign(message, {
			timestamp: timestamp ? timestamp : Date.now(),
			status: message.status !== GqiOperationStatus.FAILED ? GqiOperationStatus.CANCELED : GqiOperationStatus.FAILED,
			stage: GqiOperationStage.ERROR,
		})
		return this.postMessage(message)
	}

	private async postMessage(message: GqiMessage) {
		if (!this.isConnected) return
		return fetch(GQI.GQI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				url: this.url,
				message,
			}),
		}).catch((e) => console.log("Error fetching gqi", e))
	}

	private async init() {
		const response = await fetch(GQI.GQI_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				init: "could be an api key here",
			}),
		}).catch((e) => console.log("Error fetching gqi", e))

		if (response && response.ok) {
			this.isConnected = true
		}
	}
}
