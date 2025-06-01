<script lang="ts" setup>
import { DialogContent } from "radix-vue"
import { DialogDescription } from "radix-vue"
import { DialogOverlay } from "radix-vue"
import { DialogPortal } from "radix-vue"
import { DialogRoot } from "radix-vue"
import { DialogTitle } from "radix-vue"
import { DialogTrigger } from "radix-vue"
import { ref } from "vue"
import { settings } from "~/composables/store"
import { colorMode } from "~/composables/store"
import Logo from "../assets/gi.svg?component"
import ButtonGroup from "./base/ButtonGroup.vue"
import Select from "./base/Select.vue"
import Switch from "./base/Switch.vue"
import Tooltip from "./base/Tooltip.vue"
import Input from "./base/Input.vue"
import Button from "./base/Button.vue"
import { ButtonGroupItem } from "~/types"

const tempServerUrl = ref<string>("")
const serverAddressInputOpened = ref(false)
const settingsOpened = ref(false)

colorMode.value = "dark"
const themeOptions: ButtonGroupItem[] = [
	{
		title: "AUTO",
		name: "auto",
	},
	{
		title: "LIGHT",
		name: "light",
	},
	{
		title: "DARK",
		name: "dark",
	},
]
const sortOptions: ButtonGroupItem[] = [
	{
		title: "Newest first",
		name: "newest",
	},
	{
		title: "Oldest first",
		name: "oldest",
	},
]

function confirmServerAddress() {
	settings.serverAddress = tempServerUrl.value
}

function confirmCollectAddress() {
	settings.doCollect = true
}
</script>

<template>
	<div class="main-panel">
		<div class="h-10 w-10 flex items-center justify-center text-gray11A">
			<Logo class="h-4.5 w-4.5" />
		</div>
		<div class="flex-grow"></div>
		<DialogRoot v-model:open="serverAddressInputOpened">
			<Tooltip content="Server Url Input">
				<DialogTrigger
					class="h-10 w-10 flex items-center justify-center text-gray9 hover:text-gray11 focus:outline-none"
					@click="serverAddressInputOpened = true"
				>
					<div class="i:check h-5 w-5 focus:outline-none" />
				</DialogTrigger>
			</Tooltip>
			<DialogPortal>
				<DialogOverlay class="dialog-overlay" />
				<DialogContent class="dialog-content">
					<DialogTitle class="m-0 text-lg font-semibold text-gray12">Server Url Input</DialogTitle>
					<DialogDescription class="leading-normal text-gray10">Input your server address to inspect here.</DialogDescription>
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between space-x-2">
							<Input
								id="autoselect"
								v-model="tempServerUrl"
								class="flex-shrink-0 flex-grow"
								size="normal"
								:placeholder="settings.serverAddress || 'Server Address'"
								:equal="false"
							/>
						</div>
						<div class="flex items-center justify-between space-x-2">
							<Button
								class="w-full"
								:class="settings.doCollect ? 'cursor-not-allowed' : ''"
								size="normal"
								@click="confirmCollectAddress"
							>
								Get Messages
							</Button>
							<Button class="w-full" size="normal" @click="confirmServerAddress">
								{{ settings.isServerConnected ? "Connected" : "Subscribe" }}
							</Button>
						</div>
					</div>
				</DialogContent>
			</DialogPortal>
		</DialogRoot>
		<DialogRoot v-model:open="settingsOpened">
			<Tooltip content="Settings">
				<DialogTrigger
					class="h-10 w-10 flex items-center justify-center text-gray9 hover:text-gray11 focus:outline-none"
					@click="settingsOpened = true"
				>
					<div class="i:cog h-5 w-5 focus:outline-none" />
				</DialogTrigger>
			</Tooltip>
			<DialogPortal>
				<DialogOverlay class="dialog-overlay" />
				<DialogContent class="dialog-content">
					<DialogTitle class="m-0 text-lg font-semibold text-gray12">Settings</DialogTitle>
					<DialogDescription class="mb-5 leading-normal text-gray10">Manage your settings here.</DialogDescription>
					<div class="flex flex-col gap-4">
						<div class="flex items-center justify-between space-x-2">
							<label class="flex flex-col text-left text-sm font-medium text-gray-11 space-y-0.5">Theme</label>
							<ButtonGroup v-model="colorMode" :items="themeOptions" class="flex-shrink-0" />
						</div>
						<div class="flex items-center justify-between space-x-2">
							<label class="flex flex-col text-left text-sm font-medium text-gray-11 space-y-0.5">Requests sorting</label>
							<Select v-model="settings.sortOption" :options="sortOptions" class="flex-shrink-0" />
						</div>
						<div class="flex items-center justify-between space-x-2">
							<label for="autoselect" class="flex flex-col text-left text-sm font-medium text-gray-11 space-y-0.5">
								Autoselect newest request
							</label>
							<Switch id="autoselect" v-model="settings.newestSelected" class="flex-shrink-0" size="normal" :equal="false" />
						</div>
					</div>
				</DialogContent>
			</DialogPortal>
		</DialogRoot>
	</div>
</template>
