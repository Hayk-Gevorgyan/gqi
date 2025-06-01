import { ApolloClient, gql } from "@apollo/client/core"
import { createClient } from "graphql-ws"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { InMemoryCache } from "@apollo/client/core"
import IGqiObserver from "../interfaces/IGqiObserver"
import IGqiOperation from "../interfaces/IGqiOperation"
import GqiOperation from "./Operation"
import GqiOperationStage from "~/types/OperationStage"
import GqiOperationStatus from "~/types/OperationStatus"
import GqiMessage from "~/types/Message"
import { entries, settings } from "~/composables/store"

const OBSERVE_QUERY = gql`
	subscription messageAdded($url: String!) {
		messageAdded(url: $url) {
			id
			url
			request {
				headers {
					name
					value
				}
				query
				operationName
				variables
			}
			response {
				headers {
					name
					value
				}
				body
				errors
				type
			}
			timestamp
			sequence
			stage
			status
			isError
		}
	}
`

const COLLECT_QUERY = gql`
	query Messages($url: String!) {
		messages(url: $url) {
			id
			url
			timestamp
			sequence
			isError
			stage
			status
			request {
				query
				operationName
				variables
				headers {
					name
					value
				}
			}
			response {
				body
				errors
				type
				headers {
					name
					value
				}
			}
		}
	}
`

export class GqiObserver implements IGqiObserver {
	client?: ApolloClient<any>
	operations: Record<string, IGqiOperation>
	constructor() {
		this.operations = {}
		if (this.client) {
			console.log("Disposing existing GraphQL WS client")
			this.client.stop?.()
			this.client = undefined
		}

		// WebSocket link for subscriptions (your existing setup)
		const wsClient = createClient({
			url: "ws://localhost:24000/graphql",
		})
		const wsLink = new GraphQLWsLink(wsClient)

		this.client = new ApolloClient({
			link: wsLink,
			cache: new InMemoryCache(),
		})
	}
	public async collect(url: string) {
		const { data } = await this.client.query<{ messages: GqiMessage[] }>({ query: COLLECT_QUERY, variables: { url } })

		if (!data) return

		console.log(data)
		const messages = data.messages

		messages.forEach((message) => {
			const op = this.messageToOperation(message)

			if (op) this.updateOperation(op)
		})
	}
	public observe(url: string) {
		console.log("subscription started")
		settings.isServerConnected = true
		this.client.subscribe<{ messageAdded: GqiMessage }>({ query: OBSERVE_QUERY, variables: { url } }).subscribe({
			next: ({ data }) => {
				if (!data) return

				console.log(data)
				const message = data.messageAdded

				let op: IGqiOperation
				switch (message.stage) {
					case "subscribe": {
						op = this.onSubscribe(message)
						break
					}
					case "next": {
						op = this.onNext(message)
						break
					}
					case "error": {
						op = this.onError(message)
						break
					}
					case "complete": {
						op = this.onComplete(message)
						break
					}
					default: {
						op = this.getOperation(message.id)
						op.cancel()
					}
				}

				if (op) this.updateOperation(op)
			},
			complete: () => {
				console.log("subscription complete")
				settings.isServerConnected = false
			},
		})
	}
	public getOperation(id: string): IGqiOperation {
		if (!this.operations[id]) this.operations[id] = new GqiOperation(id)
		return this.operations[id]
	}
	public updateOperation(op: IGqiOperation): void {
		const entry = entries.find((e) => e.id === op.id)
		const opEntry = op.toJSON()
		if (entry) {
			Object.assign(entry, opEntry)
		} else entries.push(opEntry)
	}
	public messageToOperation(message: GqiMessage) {
		const op = this.getOperation(message.id)

		const { request, response, isError, sequence, stage, status, timestamp, url } = message
		op.setRequest({ request, sequence, time: timestamp, isError, url })
		if (message.response) {
			op.setResponse({ response, time: timestamp, stage, status, isError })
		}
		if (stage !== GqiOperationStage.SUBSCRIBE && stage !== GqiOperationStage.NEXT) {
			if (status === GqiOperationStatus.CANCELED) {
				op.cancel()
			} else {
				op.done()
			}
		}
		return op
	}
	public onSubscribe(message: GqiMessage): IGqiOperation {
		const { id, request, timestamp, sequence, isError, url } = message
		const op = this.getOperation(id)
		op.setRequest({ url, request, sequence, time: timestamp, isError })
		return op
	}
	public onNext(message: GqiMessage) {
		const { id, response, timestamp, status, stage, isError } = message
		const op = this.getOperation(id)

		op.setResponse({ response, time: timestamp, stage, status, isError })

		return op
	}
	public onError(message: GqiMessage) {
		const { id, response, timestamp, status, stage, isError } = message
		const op = this.getOperation(id)

		op.setResponse({ response, time: timestamp, stage, status, isError })

		op.done()

		return op
	}
	public onComplete(message: GqiMessage) {
		const { id, status } = message
		const op = this.getOperation(id)

		if (status === GqiOperationStatus.CANCELED) op.cancel()
		else op.done()

		return op
	}
}
