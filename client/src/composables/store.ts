import { useColorMode } from "@vueuse/core"
import { toReactive } from "@vueuse/core"
import { reactive } from "vue"
import { useStorageLocal } from "~/composables/storageLocal"
import type { Entry } from "~/types/Entry"

export const entries = reactive<Entry[]>([])

export const colorMode = useColorMode({
	emitAuto: true,
	modes: {
		auto: "",
		light: "light-theme",
		dark: "dark-theme",
	},
})

export const lastState = toReactive(
	useStorageLocal("lastState", {
		clearedAt: false,
		activeView: "ALL",
		variablesOpened: false,
	})
)

export const settings = toReactive(
	useStorageLocal<{
		sortOption: string
		newestSelected: boolean
		serverAddress: string
		isServerConnected: boolean
		doCollect: boolean
	}>("settings", {
		sortOption: "newest",
		newestSelected: false,
		serverAddress: "",
		isServerConnected: false,
		doCollect: false,
	})
)
