<script setup lang="ts">
import { useSorted } from "@vueuse/core"
import { useArrayFilter } from "@vueuse/core"
import { createReusableTemplate } from "@vueuse/core"
import { ref } from "vue"
import { settings } from "~/composables/store"
import { TYPE_COLORS } from "~/constants"
import type { Entry } from "~/types"
import ButtonGroup from "./base/ButtonGroup.vue"
import Input from "./base/Input.vue"
import Tooltip from "./base/Tooltip.vue"

const { entries = [] } = defineProps<{ entries: Entry[] }>()

const [DefineListItem, ReuseListItem] = createReusableTemplate<{ entry: Entry; color: string }>()
const active = defineModel<number | string>({ default: 0 })

const keyword = ref("")
const activeView = ref<"all" | "query" | "mutation" | "subscription">("all")
const activeStatus = ref<"all" | "pending" | "failed" | "completed">("all")
const lastCleared = ref(0)
const viewButtons = ref([
	{
		title: "✱",
		name: "all",
		label: "All",
	},
	{
		title: "Q",
		name: "query",
		label: "Queries",
	},
	{
		title: "M",
		name: "mutation",
		label: "Mutations",
	},
	{
		title: "S",
		name: "subscription",
		label: "Subscriptions",
	},
])
const statusButtons = ref([
	{
		title: "✱",
		name: "all",
		label: "All",
	},
	{
		title: "P",
		name: "pending",
		label: "Pending",
	},
	{
		title: "F",
		name: "failed",
		label: "Failed",
	},
	{
		title: "C",
		name: "completed",
		label: "Complete",
	},
])

const filtered = useArrayFilter(
	() => entries,
	(entry: Entry) => {
		const _entry = entry
		let status = _entry.status == "canceled" ? "completed" : _entry.status
		return (
			(activeView.value === "all" || activeView.value == _entry.request.operationType) &&
			(activeStatus.value === "all" || activeStatus.value == status) &&
			[entry].flat().some(({ request }) => !request.name || request.name.toLowerCase()?.includes(keyword.value.toLowerCase())) &&
			_entry.timestamp > lastCleared.value
		)
	}
)
const sorted = useSorted(filtered, (a: any, b: any) => {
	if (settings.sortOption !== "newest") {
		if (a.timestamp == b.timestamp) {
			return a.sequence - b.sequence
		} else {
			return a.timestamp - b.timestamp
		}
	} else {
		if (a.timestamp == b.timestamp) {
			return b.sequence - a.sequence
		} else {
			return b.timestamp - a.timestamp
		}
	}
})

function getColor(entry: Entry) {
	return TYPE_COLORS[entry.request.operationType.toUpperCase()]
}
function clear() {
	lastCleared.value = Date.now()

	if (!filtered.value.some((entry) => [entry].flat()[0].id === active.value)) {
		active.value = 0
	}
}
</script>

<template>
	<DefineListItem v-slot="{ entry, color }">
		<Tooltip :content="entry.request.url">
			<li
				class="operation-item group relative block w-full cursor-pointer truncate px-3 py-2 text-xs"
				:class="[
					active === entry.id
						? entry.response.isError
							? 'bg-gray2A text-red11'
							: 'bg-gray2A text-gray12'
						: entry.response.isError
							? 'text-red10 hover:(bg-gray2A text-red11)'
							: 'text-gray11 hover:(bg-gray2A text-gray12)',
				]"
				@click="active = entry.id"
			>
				<div
					class="h-5 w-5 inline-flex flex-shrink-0 items-center justify-center rounded font-bold leading-none uppercase"
					:class="
						active === entry.id
							? `bg-${color}9 text-white`
							: `bg-gray3A group-hover:bg-${color}3A group-hover:text-${color}11 text-gray11 border-gray3A`
					"
				>
					{{ entry.request.operationType.at(0) }}
				</div>
				<div class="name ml-2 font-semibold">
					{{ !entry.request.name ? entry.request.operationType : entry.request.name }}
				</div>
				<div :class="`counter ${entry.status}`">
					{{ entry.status == "completed" ? "✓" : entry.status == "failed" ? "✕" : entry.response.replies || "⏺︎" }}
				</div>
			</li>
		</Tooltip>
	</DefineListItem>

	<div class="h-full flex flex-col bg-gray2">
		<div class="h-10 flex flex-shrink-0 items-center border-b border-gray3 px-2">
			<Input v-model="keyword" placeholder="Filter" class="w-full" size="normal" />
		</div>
		<div class="flex-1 flex-grow of-auto border-b border-gray4">
			<ul v-if="sorted.length" class="block flex-grow of-y-auto">
				<template v-for="(entry, i) in sorted" :key="i">
					<ReuseListItem :entry="entry" :color="getColor(entry)" />
				</template>
			</ul>
			<div v-else class="h-full flex items-center justify-center px-4 text-gray9">
				<span class="text-center">{{ keyword ? `No requests found for "${keyword}"` : "No requests found" }}</span>
			</div>
		</div>
		<div class="h-10 flex flex-shrink-0 items-center justify-between px-2">
			<ButtonGroup v-model="activeView" :items="viewButtons" class="flex-shrink-0" />
			<ButtonGroup v-model="activeStatus" :items="statusButtons" class="flex-shrink-0" />
			<div class="flex gap-2">
				<Tooltip content="Clear requests">
					<div class="i:disabled shrink-0 cursor-pointer p-1 text-xl text-gray8 hover:text-gray10" @click="clear" />
				</Tooltip>
			</div>
		</div>
	</div>
</template>
