import { GqiMessage } from "../types"
import { isGqiRequest } from "./Request"
import { isGqiResponse } from "./Response"
import { isGqiOperationStage } from "./OperationStage"
import { isGqiOperationStatus } from "./OperationStatus"

export const isGqiMessage = (message: any): GqiMessage | undefined => {
	if (
		typeof message !== "object" ||
		message === null ||
		typeof message.id !== "string" ||
		typeof message.url !== "string" ||
		!isGqiRequest(message.request) ||
		(message.response !== undefined && !isGqiResponse(message.response)) ||
		typeof message.timestamp !== "number" ||
		typeof message.sequence !== "number" ||
		!isGqiOperationStage(message.stage) ||
		!isGqiOperationStatus(message.status) ||
		typeof message.isError !== "boolean"
	) {
		return undefined
	}

	return message
}
