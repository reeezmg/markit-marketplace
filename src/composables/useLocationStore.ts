import { ref } from 'vue'
import localforage from 'localforage'
import type { Address } from '@/api/address'

// ✅ Single localforage instance
const locationStore = localforage.createInstance({
  name: 'markit',
  storeName: 'locationData',
})

// ✅ Reactive state (shared singleton)
const location = ref<Address | null>(null)

// Load once when app starts (lazy load)
const init = async () => {
  if (!location.value) {
    const saved = await locationStore.getItem<Address>('selectedLocation')
    location.value = saved || null
  }
}

export const useLocationStore = () => {
  const setLocation = async (newLocation: Address) => {
    location.value = newLocation
    await locationStore.setItem('selectedLocation', newLocation)
  }

  const getLocation = async (): Promise<Address | null> => {
    if (!location.value) {
      await init()
    }
    return location.value
  }

  const clearLocation = async () => {
    location.value = null
    await locationStore.removeItem('selectedLocation')
  }

  return {
    location,       // 👈 reactive state
    setLocation,
    getLocation,
    clearLocation,
  }
}
