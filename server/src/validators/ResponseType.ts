import { GqiResponseType } from "../types"

export const isGqiResponseType = (val: any): val is GqiResponseType => Object.values(GqiResponseType).includes(val)
