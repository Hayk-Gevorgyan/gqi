<script setup lang="ts">
import gqlParser       from "prettier/parser-graphql";
import prettier        from "prettier/standalone";
import { ref }         from "vue";
import { computed }    from "vue";
import { TYPE_COLORS } from "~/constants";
import type { Entry }  from "~/types";
import { isGQLEntry }  from "~/utils/index";
import CopyButton      from "./base/CopyButton.vue";
import Table           from "./base/Table.vue";
import Code            from "./Code.vue";
import TopBar          from "./TopBar.vue";

const props = defineProps<{ entry: Entry }>();

const activeView = ref("query");
const mode = ref("graphql");
const codeRef = ref<any>(null);

const parsedQuery = computed(() => {

	return prettier.format(props.entry.request.query, { semi: false, parser: "graphql", plugins: [gqlParser] });
});
const viewButtons = computed(() => [
	{
		title: props.entry.request.operationType.toUpperCase(),
		name: "query"
	},
	{
		title: "HEADERS",
		name: "headers"
	}
]);

defineExpose({
	refresh() {
		// codeRef.value?.refresh()
	}
});
</script>

<template>
	<div class="query-block h-full flex flex-col of-hidden bg-gray1">
		<TopBar
				v-model="activeView"
				:items="viewButtons"
				:color="TYPE_COLORS[entry.request.operationType.toUpperCase()]"
				:copy-value="activeView === 'query' ? (entry.type === 'GQL' ? parsedQuery as string : entry.request.url) : JSON.stringify(entry.request.headers, null, 2)"
				:show-search="activeView === 'query' && entry.type === 'GQL'"
				@toggle-search="codeRef?.toggleSearch()"
		>
			<template #left>
				<div
						v-if="entry"
						class="hide-scrollbar ml-2 of-auto whitespace-nowrap text-gray10 text-xs"
				>
					{{ entry.request.url }}
				</div>
			</template>
			<template #right>
				<div v-if="isGQLEntry(entry) && entry.request.batch"
						 class="rounded-sm px-1.5 py-1 text-tiny font-bold uppercase text-amber8">
					<span class="text-amber8">{{ entry.request.batch.count }}/{{ entry.request.batch.length }}</span> in Batch
				</div>
			</template>
		</TopBar>
		<div v-if="entry" class="relative flex flex-1 flex-col of-hidden">
			<template v-if="activeView === 'query'">
				<Code
						ref="codeRef"
						:code="parsedQuery as string"
						:mode="mode"
						class="of-auto"
				/>
			</template>
			<Table
					v-else-if="activeView === 'headers'"
					:items="entry.request.headers"
					class="px-2 py-1"
			/>
		</div>
	</div>
</template>
