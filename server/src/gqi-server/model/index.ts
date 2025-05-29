import { GqiMessage } from "../../types"

export interface IMessage {
	addMessage(message: GqiMessage): any
	// deleteMessage(_id): any
	// getMessagesByUrl(url: string): GqiMessage[] | Promise<GqiMessage[]>
}
