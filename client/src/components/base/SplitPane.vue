<script setup lang="ts">
import { Pane }       from "splitpanes";
import { Splitpanes } from "splitpanes";
import { watch }      from "vue";
import { ref }        from "vue";

export interface SplitPaneProps {
	storageKey?: string;
	stateKey?: string;
	leftSize?: number;
	minSize?: number;
	horizontal?: boolean;
}

const props = withDefaults(defineProps<SplitPaneProps>(), {
	stateKey: "gqi-panels-state"
});

const emit = defineEmits<{
	resize: [size: number]
	resized: [size: number]
}>();

const DEFAULT = 16;
const size = ref(props.leftSize || DEFAULT);

watch(() => props.leftSize, (v) => {
	if (v !== undefined) {
		size.value = v;
	}
});

function onResize(event: any) {
	size.value = event.at(0).size;

	emit("resize", size.value);
}
function onResized(event: any) {
	size.value = event.at(0).size;

	emit("resized", size.value);
}

</script>

<template>
	<Splitpanes :horizontal="horizontal" h-full of-hidden @resize="onResize" @resized="onResized">
		<Pane h-full w-full class="min-h-[2.5rem]" :size="size" :min-size="$slots.right ? (minSize || 0) : 100">
			<slot name="left"/>
		</Pane>
		<Pane v-if="$slots.right" :size="100 - size" relative h-full class="min-h-[2.5rem]" :min-size="minSize || 0">
			<slot name="right"/>
		</Pane>
	</Splitpanes>
</template>

