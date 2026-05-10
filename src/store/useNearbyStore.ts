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
    requestSeq: 0,
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
      this.requestSeq++
      this.nearbyShops = []
      this.loading = false
      this.error = null
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
      const requestSeq = ++this.requestSeq
      const cartStore = useCartStore()
      const locationStore = useLocationStore()
      const home = locationStore.location // ref({ lat, lng })

      if (!cartStore.groups.length) {
        await this.clearNearby()
        return
      }
      
      if (!home.value?.lat || !home.value?.lng) {
        console.warn('⚠️ No home location found.')
        return
      }

      this.loading = true
      this.error = null

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

          const originShops = companies
            .filter(company => company.companyId)
            .map(company => ({
              id: company.companyId,
              name: company.companyName,
              logo: company.companyLogo,
              category: [],
              description: null,
              storecode: 0,
              storeUniqueName: '',
              currency: '',
              plan: '',
              gstin: null,
              upiId: null,
              addressId: company.companyLocationId,
              addressName: '',
              street: '',
              locality: '',
              city: '',
              state: '',
              pincode: '',
              lat: company.companyLat,
              lng: company.companyLng,
              air_distance: 0,
              road_distance: 0,
              duration: 0,
              cartNumber,
            })) as NearbyShop[]

          if (!shops.length) return originShops

          const resp = await getNearbyShop(home.value, shops)
          const list = (resp?.data ?? []).map((shop: any) => ({
            ...shop,
            cartNumber, // ✅ associate with same group number
          })) as NearbyShop[]

          const byCompany = new Map<string, NearbyShop>()
          for (const shop of [...originShops, ...list]) {
            if (!shop.id) continue
            const existing = byCompany.get(shop.id)
            if (!existing || Number(shop.road_distance || 0) < Number(existing.road_distance || 0)) {
              byCompany.set(shop.id, shop)
            }
          }

          return Array.from(byCompany.values())
        })

        const results = await Promise.all(requests)
        if (requestSeq !== this.requestSeq) return
        this.nearbyShops = results.flat()

        await this.saveNearby()
      } catch (err: any) {
        if (requestSeq !== this.requestSeq) return
        console.error('Error fetching nearby shops:', err)
        this.error = err?.message || 'Failed to fetch nearby shops'
      } finally {
        if (requestSeq === this.requestSeq) {
          this.loading = false
        }
      }
    },
  },
})
