import type { Entry as _HAREntry, Header, Param } from "har-format"
import GqiHeader from "./Header"
import GqiMessage from "./Message"
import GqiOperation from "~/classes/Operation"
import GqiOperationStage from "./OperationStage"
import GqiOperationStatus from "./OperationStatus"
import GqiRequest from "./Request"
import GqiResponse from "./Response"
import GqiResponseType from "./ResponseType"

export { GqiOperation, GqiOperationStage, GqiOperationStatus, GqiResponseType }
export type { GqiHeader, GqiMessage, GqiRequest, GqiResponse }

export interface ButtonGroupItem {
	name: string
	title: string
	label?: string
}

export interface HAREntry extends _HAREntry {
	_resourceType: "xhr" | "fetch" | "preflight"
	getContent: () => Promise<[string, string]>
}

interface BaseEntryRequest {
	url: string
	headers: Header[]
	preflightHeaders?: Header[]
	mimeType?: string
	method: string
}

interface BaseEntryResponse {
	status: number
	statusMessage?: string
	isError: boolean
	headers: Header[]
	preflightHeaders?: Header[]
	mimeType: string
}

export interface BaseEntry {
	id: string
	time: number
	timestamp: number
	request: BaseEntryRequest
	response: BaseEntryResponse
}

interface HTTPEntryRequest extends BaseEntryRequest {
	name: string
	host?: string
	pathname: string
	queryString: string
	query: any
	body: any
	params?: Param[]
}

interface HTTPEntryResponse extends BaseEntryResponse {
	body: any
}

export interface HTTPEntry extends BaseEntry {
	type: string
	request: HTTPEntryRequest
	response: HTTPEntryResponse
}

interface GQLEntryRequest extends BaseEntryRequest {
	name?: string
	operations: string[]
	operationType: string
	query: string
	variables: Record<string, unknown>
	batch?: {
		length: number
		count: number
	}
}

interface GQLEntryResponse extends BaseEntryResponse {
	body?: any
	data?: any
	errors?: any[]
	replies?: number
}

export interface GQLEntry extends BaseEntry {
	type: string
	status?: string
	sequence?: number
	request: GQLEntryRequest
	response: GQLEntryResponse
}

export type Entry = GQLEntry
