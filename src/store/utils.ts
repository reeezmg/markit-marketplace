import { useProfileStore } from './useProfileStore'
import { useAddressStore } from './useAddressStore'
import { useNearbyStore } from './useNearbyStore'
import { usePackStore } from './usePackStore'
import { useTryHistoryStore } from './useTryHistoryStore'
import { useLocationStore } from '@/composables/useLocationStore'

export const clearMarkitIndexedDB = async () => {
  const { clearLocation } = useLocationStore()

  await Promise.all([
    useProfileStore().clearStorage(),
    useAddressStore().clearStorage(),
    useNearbyStore().clearNearby(),
    usePackStore().clearStorage(),
    useTryHistoryStore().clear(),
    clearLocation(),
  ])
}
