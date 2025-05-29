export default `#graphql
	scalar JSON

	type GqiRequest {
		headers: [GqiHeader!]!
		query: String
		operationName: String
		variables: JSON
	}

	type GqiResponse {
		headers: [GqiHeader!]!
		body: JSON
		errors: JSON
		type: String
	}

	type GqiMessage {
		id: ID!
		url: String!
		timestamp: Float
		sequence: Int
		isError: Boolean
		stage: String
		status: String
		request: GqiRequest
		response: GqiResponse
	}

	type GqiHeader {
		name: String!
		value: String!
	}

	type Query {
		messages(url: String!): [GqiMessage!]!
	}

	type Subscription {
		messageAdded(url: String!): GqiMessage
	}
`
