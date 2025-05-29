import { getDb } from "../../mongoClient"
import { GqiMessage } from "../../types"
import { IMessage } from "."
import { Collection, DeleteResult, ObjectId } from "mongodb"
import { pubsub } from "../pubsub"
import { getObserverTrigger } from "../../utils/functions"

// inherit all properties except "url"
type DbMessageDoc = {
	url: string
	message: Omit<GqiMessage, "url">
}

class MessagePriorityQueue {
	private heap: GqiMessage[] = []

	private compare(a: GqiMessage, b: GqiMessage): boolean {
		if (a.timestamp == null && b.timestamp != null) return true
		if (a.timestamp != null && b.timestamp == null) return false
		if (a.timestamp == null && b.timestamp == null) return false
		return a.timestamp! < b.timestamp!
	}

	public enqueue(msg: GqiMessage) {
		this.heap.push(msg)
		this.bubbleUp(this.heap.length - 1)
	}

	public dequeue(): GqiMessage | undefined {
		if (this.heap.length === 0) return undefined
		const top = this.heap[0]
		const end = this.heap.pop()!
		if (this.heap.length > 0) {
			this.heap[0] = end
			this.sinkDown(0)
		}
		return top
	}

	public size(): number {
		return this.heap.length
	}

	public isEmpty(): boolean {
		return this.heap.length === 0
	}

	public clear() {
		this.heap = []
	}

	private bubbleUp(n: number) {
		const element = this.heap[n]
		while (n > 0) {
			const parentN = Math.floor((n - 1) / 2)
			const parent = this.heap[parentN]
			if (this.compare(element, parent)) {
				this.heap[n] = parent
				this.heap[parentN] = element
				n = parentN
			} else break
		}
	}

	private sinkDown(n: number) {
		const length = this.heap.length
		const element = this.heap[n]

		while (true) {
			let left = 2 * n + 1
			let right = 2 * n + 2
			let swap = null

			if (left < length && this.compare(this.heap[left], element)) {
				swap = left
			}

			if (right < length && this.compare(this.heap[right], swap == null ? element : this.heap[left])) {
				swap = right
			}

			if (swap == null) break
			this.heap[n] = this.heap[swap]
			this.heap[swap] = element
			n = swap
		}
	}
}

/**
 * Fix reace conditions
 */
class Message implements IMessage {
	private readonly messageQueue = new MessagePriorityQueue()
	private collectTimer: NodeJS.Timeout | null = null
	private processing = false

	private readonly COLLECT_DURATION = 100 // ms
	private readonly PROCESSING_DELAY = 50 // ms

	private get messages(): Collection<DbMessageDoc> {
		return getDb().collection<DbMessageDoc>("messages")
	}

	public queueMessage(message: GqiMessage) {
		console.log("queued message", { id: message.id, timestmp: message.timestamp, stage: message.stage, status: message.status })
		this.messageQueue.enqueue(message)

		if (!this.collectTimer) {
			this.collectTimer = setTimeout(() => {
				this.collectTimer = null
				this.processQueue()
			}, this.COLLECT_DURATION)
		}
	}

	private async processQueue() {
		if (this.processing) return
		this.processing = true

		while (!this.messageQueue.isEmpty()) {
			const msg = this.messageQueue.dequeue()
			if (!msg) continue

			try {
				await this.addMessage(msg)
				await new Promise((res) => setTimeout(res, this.PROCESSING_DELAY))
			} catch (e) {
				console.error("Error processing message:", e)
			}
		}

		this.processing = false
	}

	private toInsert(message: GqiMessage): DbMessageDoc {
		const { url, ...rest } = message
		return { url, message: { ...rest } }
	}

	private toGqiMessage(doc: DbMessageDoc): GqiMessage {
		return { url: doc.url, ...doc.message }
	}

	public async addMessage(message: GqiMessage): Promise<any> {
		const existingMessage = await this.messages.findOne({ "message.id": message.id })

		let result: any = null
		if (existingMessage && existingMessage.message.request) {
			const { request: _, ...existingWithoutRequest } = existingMessage.message
			const { request: __, ...incomingWithoutRequest } = message

			const isDifferent = JSON.stringify(existingWithoutRequest) !== JSON.stringify(incomingWithoutRequest)

			if (isDifferent) {
				console.log("update", {
					id: message.id,
					req: !!message.request,
					res: !!message.response,
					status: message.status,
				})

				const updatedMessage = { ...message, request: existingMessage.message.request }
				const updateDoc = { $set: this.toInsert(updatedMessage) }

				result = await this.messages.updateOne({ _id: existingMessage._id }, updateDoc, { writeConcern: { w: 1 } })
			}
		} else if (!existingMessage && message.request) {
			console.log("insert", {
				id: message.id,
				req: !!message.request,
				res: !!message.response,
			})

			result = await this.messages.insertOne(this.toInsert(message), { writeConcern: { w: 1 } })
		}

		if (result) {
			const OBSERVER_TRIGGER = getObserverTrigger(message.url)
			pubsub.publish(OBSERVER_TRIGGER, {
				messageAdded: message,
			})

			console.log("published to", OBSERVER_TRIGGER)
		}

		return result
	}

	public async deleteMessage(_id: ObjectId): Promise<DeleteResult> {
		return this.messages.deleteOne({ _id }, { writeConcern: { w: 1 } })
	}

	public async getMessagesByUrl(url: string): Promise<GqiMessage[]> {
		try {
			const docs = await this.messages.find({ url }).toArray()
			return docs.map((d) => this.toGqiMessage(d))
		} catch (error) {
			console.error("Error in getMessagesByUrl:", error)
			throw error
		}
	}
}

export default new Message()
