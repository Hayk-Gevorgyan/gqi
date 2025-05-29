import { GqiHeader } from "../types"

export const isGqiHeader = (obj: any): obj is GqiHeader => {
	if (typeof obj === "object" && obj !== null && typeof obj.name === "string" && typeof obj.value === "string") {
		return true
	} else {
		console.log("not a header", { obj })
		return false
	}
}
export const isGqiHeaderArray = (arr: any): arr is GqiHeader[] => {
	if (Array.isArray(arr) && arr.every(isGqiHeader)) {
		return true
	} else {
		console.log("not a header array", { arr })
		return false
	}
}
