import type { Entry as _HAREntry, Header } from "har-format"

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
