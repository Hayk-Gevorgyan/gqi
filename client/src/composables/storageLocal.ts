import type { MaybeRef, RemovableRef, StorageLikeAsync, UseStorageAsyncOptions } from "@vueuse/core"
import { useStorageAsync } from "@vueuse/core"

const storageLocal: StorageLikeAsync = {
	removeItem(key: string) {
		return localStorage.removeItem(key)
	},

	setItem(key: string, value: string) {
		return localStorage.setItem(key, value)
	},

	async getItem(key: string) {
		return localStorage.getItem(key)
	},
}

export const useStorageLocal = <T>(key: string, initialValue: MaybeRef<T>, options?: UseStorageAsyncOptions<T>): RemovableRef<T> =>
	useStorageAsync(key, initialValue, storageLocal, options)
