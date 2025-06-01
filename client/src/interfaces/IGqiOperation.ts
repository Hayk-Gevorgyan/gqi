import { Entry } from "~/types/Entry"
import GqiRequest from "~/types/Request"
import GqiResponse from "~/types/Response"
import GqiOperationStage from "~/types/OperationStage"
import GqiOperationStatus from "~/types/OperationStatus"

interface IGqiOperation {
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
	setRequest: ({
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
	}) => void
	setResponse: ({
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
	}) => void
	toJSON: () => Entry
	done: () => void
	cancel: () => void
}

export default IGqiOperation
