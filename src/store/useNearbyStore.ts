import { defineStore } from 'pinia'
import localforage from 'localforage'
import { getNearbyShop } from '@/api/api'
import { useCartStore } from './useCartStore'
import { useLocationStore } from '@/composables/useLocationStore'

const NEARBY_STORAGE_KEY = 'nearbyShops'

const nearbyStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'nearbyStore',
})

interface NearbyShop {
  id: string
  name: string
  logo: string
  category: string[]
  description: string | null
  storecode: number
  storeUniqueName: string
  currency: string
  plan: string
  gstin: string | null
  upiId: string | null
  addressId: string
  addressName: string
  street: string
  locality: string
  city: string
  state: string
  pincode: string
  lat: number
  lng: number
  air_distance: number
  road_distance: number
  duration: number
  cartNumber?: number // 👈 used to link with cart group
}

export const useNearbyStore = defineStore('nearby', {
  state: () => ({
    nearbyShops: [] as NearbyShop[],
    loading: false,
    error: null as string | null,
    updatedAt: null as string | null, // cache tracking
  }),

  actions: {
    async loadNearby() {
      const value = await nearbyStorage.getItem<string>(NEARBY_STORAGE_KEY)
      if (value) {
        const parsed = JSON.parse(value)
        this.nearbyShops = parsed.nearbyShops ?? []
        this.updatedAt = parsed.updatedAt ?? null
      }
    },

    async saveNearby() {
      await nearbyStorage.setItem(
        NEARBY_STORAGE_KEY,
        JSON.stringify({
          nearbyShops: this.nearbyShops,
          updatedAt: new Date().toISOString(),
        })
      )
      this.updatedAt = new Date().toISOString()
    },

    async clearNearby() {
      this.nearbyShops = []
      this.updatedAt = null
      await nearbyStorage.removeItem(NEARBY_STORAGE_KEY)
    },

    /** 🔍 check if company exists in nearby list */
    isNearbyCompany(companyId: string) {
      if (!companyId) return false
      return this.nearbyShops.some(s => s.id === companyId)
    },

    /** 🔢 get cartNumber linked to a nearby company */
    getCartNumberForCompany(companyId: string): number | null {
      if (!companyId) return null
      const hit = this.nearbyShops.find(s => s.id === companyId)
      return hit?.cartNumber ?? null
    },

    /**
     * 🚗 Fetch nearby shops per cart group.
     * - Each cart group may contain multiple companies.
     * - Each company's coords are used to get nearby shops.
     * - Response shops are tagged with that group's cartNumber.
     */
    async fetchNearbyShops() {
      const cartStore = useCartStore()
      const locationStore = useLocationStore()
      const home = locationStore.location // ref({ lat, lng })

      if (!home.value?.lat || !home.value?.lng) {
        console.warn('⚠️ No home location found.')
        return
      }

      this.loading = true
      this.error = null
      this.nearbyShops = []

      const uniqueByLatLng = (arr: { lat: number; lng: number }[]) =>
        arr.filter(
          (v, idx, a) => idx === a.findIndex(p => p.lat === v.lat && p.lng === v.lng)
        )

      try {
        const requests = cartStore.groups.map(async (group) => {
          const cartNumber = group.cartNumber
          const companies = group.companies ?? []

          // collect unique company coordinates
          const shops = uniqueByLatLng(
            companies.map(c => ({ lat: c.companyLat, lng: c.companyLng }))
          )

          if (!shops.length) return [] as NearbyShop[]

          const resp = await getNearbyShop(home.value, shops)
          const list = (resp?.data ?? []).map((shop: any) => ({
            ...shop,
            cartNumber, // ✅ associate with same group number
          })) as NearbyShop[]

          return list
        })

        const results = await Promise.all(requests)
        this.nearbyShops = results.flat()

        await this.saveNearby()
      } catch (err: any) {
        console.error('Error fetching nearby shops:', err)
        this.error = err?.message || 'Failed to fetch nearby shops'
      } finally {
        this.loading = false
      }
    },
  },
})
