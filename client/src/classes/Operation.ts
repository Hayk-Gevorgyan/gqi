import { Entry } from "../types"
import { getOperationAST, parse } from "graphql"
import IGqiOperation from "../interfaces/IGqiOperation"
import { GqiRequest, GqiResponse, GqiOperationStatus, GqiOperationStage } from "../types"

class GqiOperation implements IGqiOperation {
	id: string
	url: string
	request: GqiRequest
	response: GqiResponse
	status: GqiOperationStatus
	stage: GqiOperationStage
	operationType?: string
	operations: string[]
	hasErrors: boolean
	replies: number
	started: number
	updated: number
	sequence: number
	constructor(id: string) {
		this.id = id
		this.operations = []
		this.hasErrors = false
		this.replies = 0
		this.sequence = 0
	}
	setRequest({
		url,
		request,
		sequence,
		time,
		isError,
	}: {
		url: string
		request: GqiRequest
		sequence: number
		time: number
		isError: boolean
	}) {
		this.url = url
		this.request = request
		this.sequence = sequence
		this.started = time
		this.updated = time
		this.stage = GqiOperationStage.SUBSCRIBE
		this.status = GqiOperationStatus.PENDING
		this.hasErrors = isError
		const { operationName, query } = request
		const document = parse(query)
		const operationAST = getOperationAST(document)
		// this.request.operationName = operationAST?.name?.value || operationName
		this.operationType = operationAST?.operation
		this.operations = operationAST?.selectionSet.selections.map((s: any) => String(s.name.value)) || []
	}
	setResponse({
		response,
		time,
		status,
		stage,
		isError,
	}: {
		response: GqiResponse
		time: number
		status: GqiOperationStatus
		stage: GqiOperationStage
		isError: boolean
	}) {
		this.response = response
		this.updated = time
		this.replies = this.replies++
		if (
			// either stage or status is not passed for a failing response
			(stage !== GqiOperationStage.ERROR || status !== GqiOperationStatus.CANCELED) &&
			// but other characteristics imply that the response has failed
			((response.type == "error" && Array.isArray(this.response) && this.response.length > 0) ||
				(response.type == "next" && Array.isArray(this.response.errors) && this.response.errors.length > 0))
		) {
			this.hasErrors = true
			this.status = GqiOperationStatus.CANCELED
			this.stage = GqiOperationStage.ERROR
		} else {
			this.hasErrors = isError
		}

		if (this.status === GqiOperationStatus.PENDING) {
			this.status = status
		}

		if (this.stage === GqiOperationStage.NEXT || this.stage === GqiOperationStage.SUBSCRIBE) {
			this.stage = stage
		}
	}
	toJSON(): Entry {
		const response = this.response
			? {
					status: 200,
					statusMessage: this.hasErrors ? "Error" : "Succeed",
					isError: this.hasErrors,
					replies: this.replies,
					headers: [
						{
							name: "Content-Type",
							value: "application/json",
						},
						...this.response?.headers,
					],
					mimeType: "application/json",
					body: this.response?.body,
				}
			: {
					status: 200,
					statusMessage: this.hasErrors ? "Error" : "Succeed",
					isError: this.hasErrors,
					replies: this.replies,
					headers: [
						{
							name: "Content-Type",
							value: "application/json",
						},
					],
					mimeType: "application/json",
					body: {},
				}
		return {
			id: `${this.id}`,
			time: this.updated - this.started,
			timestamp: this.started,
			type: "GQL",
			status: this.status,
			sequence: 0,
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
					...this.request?.headers,
				],
				mimeType: "application/json",
				method: "POST",
				name: this.request.operationName,
				operations: this.operations || [],
				operationType: this.operationType || "GQL",
				query: this.request.query,
				variables: this.request.variables,
			},
			response,
		}
	}
	done() {
		if (this.hasErrors) {
			this.status = GqiOperationStatus.FAILED
		} else {
			this.status = GqiOperationStatus.COMPLETED
		}
		this.stage = GqiOperationStage.COMPLETE
	}
	cancel() {
		this.status = GqiOperationStatus.CANCELED
		this.stage = GqiOperationStage.COMPLETE
	}
}

export default GqiOperation
