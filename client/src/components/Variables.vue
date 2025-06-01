<script lang="ts" setup>
import { useResizeObserver } from "@vueuse/core"
import { computed } from "vue"
import { ref } from "vue"
import type { Entry } from "~/types/Entry"
import { isGQLEntry } from "~/utils"
import { formatData } from "~/utils"
import Table from "./base/Table.vue"
import Code from "./Code.vue"

const props = defineProps<{
	entry: Entry
}>()

const emit = defineEmits<{
	toggle: [value: number]
}>()

const open = defineModel<boolean>("open", { default: true })

const HEIGHT_COLLAPSED = 2.5 * 16 // 2.5rem

const elRef = ref(null)
const codeRef = ref<any>(null)

const params = computed(() => null)
const body = computed(() => null)
const variables = computed(() => formatData(props.entry.request.variables, "text/json"))

useResizeObserver(elRef, ([entry]) => {
	open.value = entry.contentRect.height !== HEIGHT_COLLAPSED
})

function toggle() {
	open.value = !open.value
	emit("toggle", open.value ? 50 : 0)
}

defineExpose({
	refresh() {
		codeRef.value?.refresh()
	},
})
</script>

<template>
	<div ref="elRef" class="variables-block flex flex-col">
		<div class="group h-10 flex flex-shrink-0 cursor-pointer items-center justify-between px-3" @click="toggle">
			<div class="flex flex-shrink-0 items-center text-gray10 group-hover:text-gray11">
				<span class="font-bold uppercase text-xs">
					{{ isGQLEntry(entry) ? "Variables" : "Body" }}
				</span>
				<div class="i:chevron-up transform text-xl" :class="{ 'rotate-180': open }" />
			</div>
		</div>
		<div v-if="entry" class="relative flex flex-1 flex-col of-hidden border-t border-gray3">
			<Table v-if="params" :items="params" class="px-2 py-1" />
			<Code v-else-if="variables || body" ref="codeRef" :code="(variables || body) as string" class="of-auto" />
		</div>
	</div>
</template>
