import GqiOperationStage from "./OperationStage"
import GqiOperationStatus from "./OperationStatus"
import GqiRequest from "./Request"
import GqiResponse from "./Response"

type GqiMessage = {
	id: string
	url: string
	request: GqiRequest
	response: GqiResponse
	timestamp: number
	sequence: number
	stage: GqiOperationStage
	status: GqiOperationStatus
	isError: boolean
}

export default GqiMessage
