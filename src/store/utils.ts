import { useProfileStore } from './useProfileStore'
import { useCartStore } from './useCartStore'
import { useAddressStore } from './useAddressStore'
import { useLikeStore } from './useLikeStore'
import { usePackStore } from './usePackStore'

export const clearMarkitIndexedDB = async () => {
    // Clear default

    // Clear known instances
    await Promise.all([
        useProfileStore().clearStorage(),
        useCartStore().clearStorage(),
        useAddressStore().clearStorage(),
        useLikeStore().clearStorage(),
        usePackStore().clearStorage(),
    ])
}
