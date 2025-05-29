import { GqiOperationStage } from "../types"

export const isGqiOperationStage = (val: any): val is GqiOperationStage => {
	if (Object.values(GqiOperationStage).includes(val)) {
		return true
	} else {
		console.log("not a gqi operation stage", { val })
		return false
	}
}
