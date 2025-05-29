import GqiHeader from "./Header"
import GqiResponseType from "./ResponseType"

type GqiResponse = {
	headers: GqiHeader[]
	body?: any
	errors?: any
	type?: GqiResponseType
}

export default GqiResponse
