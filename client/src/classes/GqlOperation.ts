import { getOperationAST, parse } from "graphql"
import type { Entry } from "~/types"

export default class GqlOperation {
	id: string
	request: any
	response: any
	requestHeaders: any
	responseHeaders: any
	status: string
	operationName?: string
	operationType?: string
	operations?: string[] = []
	query?: string
	variables?: string
	hasErrors: boolean = false
	replies?: number
	started?: number
	updated?: number
	url: string = ""
	sequence?: number
	constructor(id: string) {
		this.id = id
		this.status = "pending"
		this.replies = 0
	}
	setRequest(request: {
		headers?: any
		seq: number
		payload: { operationName: string; query: string; variables: string }
		url: string
		time: number
	}) {
		this.sequence = request.seq
		this.request = request.payload
		this.requestHeaders = request.headers
		const { operationName, query, variables } = request.payload
		const document = parse(query)
		const operationAST = getOperationAST(document)
		this.url = request.url
		this.started = request.time
		this.updated = request.time
		this.query = query
		this.variables = variables
		this.operationName = operationAST?.name?.value || operationName
		this.operationType = operationAST?.operation
		this.operations = operationAST?.selectionSet.selections.map((s: any) => String(s.name.value))
	}
	setResponse(response: { headers?: any; time: number; payload: any; type: string }) {
		this.responseHeaders = response.headers
		this.updated = response.time
		this.response = response.payload
		this.replies !== undefined && this.replies++
		if (
			(response.type == "error" && Array.isArray(this.response) && this.response.length > 0) ||
			(response.type == "next" && Array.isArray(this.response.errors) && this.response.errors.length > 0)
		) {
			this.hasErrors = true
			this.status = "failed"
		}
	}
	done() {
		if (this.hasErrors) {
			this.status = "failed"
		} else {
			this.status = "completed"
		}
	}
	cancel() {
		this.status = "canceled"
	}
	toJSON(): Entry {
		const parsedVariables = typeof this.variables === "string" ? JSON.parse(this.variables) : this.variables
		return {
			id: `${this.id}`,
			time: this.updated - this.started,
			timestamp: this.started,
			type: "GQL",
			status: this.status,
			sequence: this.sequence,
			request: {
				url: this.url,
				headers: [
					{
						name: "status",
						value: this.status,
					},
					{
						name: "sequence",
						value: String(this.sequence),
					},
					{
						name: "start",
						value: new Date(this.started).toLocaleString(undefined, {
							timeZoneName: "short",
						}),
					},
					{
						name: "ended",
						value: new Date(this.updated).toLocaleString(undefined, {
							timeZoneName: "short",
						}),
					},
				],
				mimeType: "application/json",
				method: "POST",
				name: this.operationName,
				operations: this.operations || [],
				operationType: this.operationType || "GQL",
				query: this.query,
				variables: parsedVariables,
			},
			response: {
				status: 200,
				statusMessage: this.hasErrors ? "Failed" : "Succeed",
				isError: this.hasErrors,
				replies: this.replies,
				headers: [
					{
						name: "Content-Type",
						value: "application/json",
					},
				],
				mimeType: "application/json",
				body: this.response,
			},
		}
	}
}
