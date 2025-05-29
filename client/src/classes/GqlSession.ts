import Port = chrome.runtime.Port
import GqlOperation from "./GqlOperation"

export default class GqlSession {
	id: string
	port?: Port
	url: string
	operations: Record<string, GqlOperation>
	constructor(port: Port) {
		this.id = port.name
		this.url = ""
		this.operations = {}
	}
	getOperation(id: string) {
		if (!this.operations[id]) {
			this.operations[id] = new GqlOperation(id)
		}
		return this.operations[id]
	}
	onMessage({ seq, type, time, data }: any) {
		data = Object.assign(data, { seq, time, url: data?.url ?? this.url })
		switch (type) {
			case "outgoing":
				return this.onOutgoing(data)
			case "incoming":
				return this.onIncoming(data)
			case "open": {
				this.url = data.url
				return
			}
			default: {
				console.info(type)
			}
		}
	}
	onOutgoing(msg: any) {
		switch (msg.type) {
			case "subscribe": {
				const op = this.getOperation(msg.id)
				op.setRequest(msg)
				return op
			}
			case "complete": {
				const op = this.getOperation(msg.id)
				op.cancel()
				return op
			}
		}
	}
	onIncoming(msg: any) {
		switch (msg.type) {
			case "error":
			case "next": {
				const op = this.getOperation(msg.id)
				op.setResponse(msg)
				return op
			}
			case "complete": {
				const op = this.getOperation(msg.id)
				op.done()
				return op
			}
		}
	}
	close() {}
}
