import { ApolloClient } from "@apollo/client/core"
import IGqiOperation from "./IGqiOperation"
import { GqiMessage } from "../types"

interface IGqiObserver {
	client?: ApolloClient<any>
	operations: Record<string, IGqiOperation>
	getOperation: (id: string) => IGqiOperation
	updateOperation: (op: IGqiOperation) => void
	onSubscribe: (message: GqiMessage) => IGqiOperation
	onNext: (message: GqiMessage) => IGqiOperation
	onError: (message: GqiMessage) => IGqiOperation
	onComplete: (message: GqiMessage) => IGqiOperation
}

export default IGqiObserver
