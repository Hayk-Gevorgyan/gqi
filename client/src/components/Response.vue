<script lang="ts" setup>
import { watch } from "vue"
import { computed } from "vue"
import { ref } from "vue"
import type { ButtonGroupItem } from "~/types"
import type { Entry } from "~/types/Entry"
import { formatData } from "~/utils"
import Table from "./base/Table.vue"
import Code from "./Code.vue"
import TopBar from "./TopBar.vue"

const props = defineProps<{ entry: Entry }>()

const activeView = ref("data")
const data = ref<string | null>(null)
const parseError = ref<string | null>(null)
const codeRef = ref<any>(null)

const viewButtons = computed<ButtonGroupItem[]>(() => [
	{
		title: "DATA",
		name: "data",
	},
	{
		title: "HEADERS",
		name: "headers",
	},
])

watch(
	() => props.entry,
	(entry) => {
		parseError.value = null

		if (!entry) {
			return
		}

		try {
			const response = entry.response.body

			if (!response) {
				data.value = null
				return
			}

			data.value = formatData(response, entry.response.mimeType)
		} catch (e: any) {
			data.value = null
			parseError.value = e.message
		}
	},
	{ immediate: true }
)

defineExpose({
	refresh() {
		codeRef.value?.refresh()
	},
})
</script>

<template>
	<div class="response-block h-full flex flex-col of-hidden bg-gray1">
		<TopBar
			v-model="activeView"
			:items="viewButtons"
			:color="entry.response.isError ? 'red' : 'green'"
			:copy-value="activeView === 'data' ? (data as string) : JSON.stringify(entry.response.headers, null, 2)"
			:show-search="activeView === 'data'"
			@toggle-search="codeRef.toggleSearch()"
		>
			<template #left>
				<div class="flex flex-shrink-0 of-auto">
					<div v-if="entry.response.status" class="ml-3 text-xs text-gray10">
						{{ entry.response.status }} {{ entry.response.statusMessage }}
					</div>
					<div class="ml-3 text-xs text-gray10">{{ entry.time.toFixed(2) }} ms</div>
				</div>
			</template>
			<template #right>
				<div v-if="entry.type !== 'GQL' && activeView !== 'headers'" class="hide-scrollbar ml-2 whitespace-nowrap text-gray10">
					{{ entry.response.mimeType }}
				</div>
			</template>
		</TopBar>
		<div class="relative flex flex-1 flex-col of-hidden">
			<template v-if="activeView === 'data'">
				<div v-if="parseError" class="h-full flex flex-grow items-center justify-center">
					<div class="flex flex-col items-center">
						<div class="i:code text-6xl text-gray6" />
						<span class="mt-4 inline-block text-gray10">{{ entry.response.mimeType }}</span>
						<span class="inline-block text-gray8">{{ parseError }}</span>
					</div>
				</div>
				<div v-else-if="!data" class="h-full flex flex-grow items-center justify-center">
					<div class="flex flex-col items-center">
						<h1 v-if="entry.response.status" class="text-6xl font-bold text-gray6">
							{{ entry.response.status }}
						</h1>
						<span class="mt-4 inline-block text-gray10">
							{{ entry.response.status === 0 ? "Failed to load response data" : entry.response.statusMessage }}
						</span>
					</div>
				</div>
				<Code v-else ref="codeRef" :code="data" :mode="entry.response.mimeType" class="of-auto" />
			</template>
			<Table v-else-if="activeView === 'headers'" :items="entry.response.headers" class="px-2 py-1" />
		</div>
	</div>
</template>
