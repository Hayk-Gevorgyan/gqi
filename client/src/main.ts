import App from "./App.vue"
import { createApp, watch } from "vue"
import { entries, settings } from "./composables/store"
import { isGraphQL } from "./utils"
import { parseGQLEntry } from "./utils"
import { GqiObserver } from "./classes/Observer"
import GqlSession from "./classes/GqlSession"

const app = createApp(App)

app.mount("#app")

function initPageWsListener() {
	chrome.runtime.onConnectExternal.addListener((port) => {
		if (port.sender?.tab?.id == chrome.devtools.inspectedWindow.tabId) {
			console.info("CONNECT", port)
			const session = new GqlSession(port)
			port.onDisconnect.addListener(() => {
				console.info("DISCONNECT", port)
				session.close()
			})
			port.onMessage.addListener((message) => {
				let op = session.onMessage(message)
				if (op) {
					let entry = op.toJSON()
					let existing = entries.find((e) => e.id == entry.id)
					if (existing) {
						Object.assign(existing, entry)
					} else {
						entries.push(entry)
					}
				}
			})
			port.postMessage({ type: "init" })
		} else {
			// console.info("IGNORE")
		}
	})
	chrome.devtools.inspectedWindow.eval(`__gqi_init()`, (result, exceptionInfo) => {
		console.dir({ result, exceptionInfo })
	})
}
function initPageResourceListener() {
	chrome.devtools.network.onRequestFinished.addListener(async (entry: any) => {
		const [content, encoding] = await new Promise<string[]>((a) =>
			entry.getContent((content: string, encoding: string) => {
				a([content, encoding])
			})
		)
		entry.getContent = () => Promise.resolve([content, encoding])
		try {
			if (isGraphQL(entry)) {
				const parsedEntries = await parseGQLEntry(entry)
				entries.push(parsedEntries)
			} else {
				// console.info("IGNORE", entry);
			}
		} catch (ex) {
			console.error(ex)
		}
	})
}
function watchServerAddress() {
	const obs = new GqiObserver()

	watch(
		() => settings.serverAddress,
		(newAddress: string) => {
			console.log(`Server address changed to "${newAddress}"`)
			obs.observe(newAddress)
		},
		{ immediate: true }
	)

	watch(
		() => settings.doCollect,
		(doCollect) => {
			const serverAddress = settings.serverAddress
			if (!doCollect || !serverAddress) return
			console.log("Collecting previous messages from", serverAddress)
			obs.collect(serverAddress) //.catch(() => console.log("fetch failed for", newAddress))
			settings.doCollect = false
		}
	)
}

if (typeof chrome?.devtools != "undefined") {
	console.log("devtools available")
	initPageWsListener()
	initPageResourceListener()
} else {
	console.log("no devtools")
	watchServerAddress()
}
