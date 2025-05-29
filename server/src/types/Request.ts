import GqiHeader from "./Header"

type GqiRequest = {
	headers: GqiHeader[]
	query: string
	operationName: string
	variables: Record<string, unknown>
}

export default GqiRequest
