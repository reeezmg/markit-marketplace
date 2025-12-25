import { useProfileStore } from './useProfileStore'
import { useCartStore } from './useCartStore'

export const clearMarkitIndexedDB = async () => {
    // Clear default

    // Clear known instances
    await Promise.all([
        useProfileStore().clearStorage(),
        useCartStore().clearStorage()

    ])
}
