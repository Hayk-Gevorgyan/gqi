import { GqiRequest } from "../types"
import { isGqiHeaderArray } from "./Header"

export const isGqiRequest = (obj: any): obj is GqiRequest => {
	if (
		typeof obj === "object" &&
		obj !== null &&
		isGqiHeaderArray(obj.headers) &&
		typeof obj.query === "string" &&
		typeof obj.operationName === "string" &&
		typeof obj.variables === "object" &&
		obj.variables !== null &&
		!Array.isArray(obj.variables)
	) {
		return true
	} else {
		console.log("is not a gqi request", { obj })
		return false
	}
}
