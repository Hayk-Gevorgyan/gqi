import { WebSocketServer } from "ws"
import { Server } from "http"
import { useServer } from "graphql-ws/lib/use/ws"
import { schema } from "../schema"
import { ApolloServer } from "@apollo/server"
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer"
import { expressMiddleware } from "@apollo/server/express4"

export const getApolloExpressMiddleware = async (httpServer: Server) => {
	const wsServer = new WebSocketServer({
		server: httpServer,
		path: "/graphql",
	})

	const serverCleanup = useServer(
		{
			schema,
			onSubscribe() {
				console.log("subscription started")
			},
			onComplete() {
				console.log("subscription completed")
			},
			onClose() {
				console.log("subscription closed")
			},
		},
		wsServer
	)

	const apollo = new ApolloServer({
		schema,
		plugins: [
			ApolloServerPluginDrainHttpServer({ httpServer }),
			{
				async serverWillStart() {
					return {
						async drainServer() {
							await serverCleanup.dispose()
						},
					}
				},
			},
		],
	})

	await apollo.start()

	return expressMiddleware(apollo)
}
