import express from "express"
import { createServer } from "http"
import { handleMessage } from "./gqi-server/service/Message"
import { getApolloExpressMiddleware } from "./gqi-server/service/Apollo"
import { initMongo } from "./mongoClient"

async function main() {
	await initMongo()
	const app = express()
	const httpServer = createServer(app)

	const apolloMiddleware = await getApolloExpressMiddleware(httpServer)

	app.use("/graphql", express.json(), apolloMiddleware)

	app.post("/messages", express.json(), handleMessage)

	const PORT = 24000
	httpServer.listen(PORT, () => console.log(`gqis running at http://localhost:${PORT}/graphql`))
}

export default main

main().catch(console.error)
