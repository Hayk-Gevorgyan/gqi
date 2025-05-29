import { GqiOperationStatus } from "../types"

export const isGqiOperationStatus = (val: any): val is GqiOperationStatus => {
	if (Object.values(GqiOperationStatus).includes(val)) {
		return true
	} else {
		console.log("not a gqi operation status", { val })
		return false
	}
}
