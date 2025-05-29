import { pubsub } from "../../pubsub"
import { getObserverTrigger } from "../../../utils/functions"
import messages from "../../model/Message"

export default {
	Query: {
		messages: async (_: any, { url }: { url: string }) => {
			console.log("getting messages for", url)
			return messages.getMessagesByUrl(url)
		},
	},
	Subscription: {
		messageAdded: {
			subscribe: async (_: any, { url }: { url: string }) => {
				console.log("subsuribed to", url)
				return pubsub.asyncIterableIterator(getObserverTrigger(url))
			},
		},
	},
}
