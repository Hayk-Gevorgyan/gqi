import { GQI } from "./gqi-api"
import { GqiRequest, GqiResponse, GqiResponseType } from "./gqi-api/types"

const main = async () => {
	const url = "mock url"

	const gqi = new GQI(url)
	const mocks: {
		id: string
		t: number
		request?: GqiRequest
		response?: GqiResponse
	}[] = [
		...Array.from({ length: 25 }, (_, i) => {
			const id = (100 + i).toString()
			const t = Date.now()
			return [
				{
					id,
					t,
					request: {
						headers: [{ name: "Content-Type", value: "application/json" }],
						query: `query GetItem${i}($id: ID!) { item(id: $id) { id name value } }`,
						operationName: `GetItem${i}`,
						variables: { id: i.toString() },
					},
				},
				{
					id,
					t: t + 1,
					response: {
						headers: [{ name: "Content-Type", value: "application/json" }],
						body: {
							item: {
								id: i.toString(),
								name: `Item${i}`,
								value: `Value${i}`,
							},
						},
						type: GqiResponseType.NEXT,
					},
				},
			]
		}).flat(),
	]

	// let i = 0
	// const interval = setInterval(() => {
	// 	const m = mocks[i++]

	// 	console.log({ i })
	// if (m.request) {
	// 	gqi.subscribe(m.id, m.request)
	// } else if (m.response) {
	// 	gqi.next(m.id, m.response)
	// 	gqi.complete(m.id)
	// }
	// 	if (i === mocks.length) {
	// 		console.log("cleared interval")
	// 		interval.close()
	// 	}
	// }, 0)

	setTimeout(() => {
		mocks.forEach((m) => {
			if (m.request) {
				gqi.subscribe(m.id, m.request, m.t)
			} else if (m.response) {
				gqi.next(m.id, m.response, m.t)
				gqi.complete(m.id, m.t + 1)
			}
		})
	}, 5000)
}

main()
