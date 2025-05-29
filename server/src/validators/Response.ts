import { GqiResponse, GqiResponseType } from "../types"
import { isGqiHeaderArray } from "./Header"
import { isGqiResponseType } from "./ResponseType"

export const isGqiResponse = (obj: any): obj is GqiResponse => {
	if (
		typeof obj === "object" &&
		obj !== null &&
		isGqiHeaderArray(obj.headers) &&
		("body" in obj ? true : true) &&
		("errors" in obj ? true : true) &&
		("type" in obj ? isGqiResponseType(obj.type) : true)
	) {
		return true
	} else {
		console.log("is not a gqi response", { obj })
		return false
	}
}
