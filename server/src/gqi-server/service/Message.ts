import { Request, Response } from "express"
import { isGqiMessage } from "../../validators/Message"
import messages from "../model/Message"
import { isGqiInit } from "../../validators/Init"

export const handleMessage = async (req: Request, res: Response) => {
	const message = isGqiMessage(req.body.message)

	if (!message) {
		const init = isGqiInit(req.body.init)
		if (init) {
			res.status(200).send("Init Success")
			return
		} else {
			res.status(422).send("Unprocessable Entity: message is invalid")
			return
		}
	}

	// insert into db
	messages.queueMessage(message)

	// publish to pending subscriptions

	res.sendStatus(204)
}
