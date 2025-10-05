import { defineStore } from 'pinia'
import localforage from 'localforage'
import { getTryHistory } from '@/api/api'

// 🔹 tryHistory type (adjust fields if needed)
export interface TryHistory {
  trynbuy_id: string
  order_number: number
  created_at: string
  checkout_method: string
  subtotal: number
  product_discount: number
  total_discount: number
  shipping: number
  delivery_type: string
  delivery_time: string | null
  delivery_status: string | null
  packing_status: string | null
  company: {
    id: string
    name: string
    logo?: string | null
  }
  cartitems: any[]    // you can refine this type
  returneditems: any[]
}

// 🔹 LocalForage instance
const tryHistoryStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'tryHistory',
})

export const useTryHistoryStore = defineStore('tryHistory', {
  state: () => ({
    tryHistoryList: [] as TryHistory[],
  }),

  actions: {
    // Load from local storage
    async loadFromStorage() {
      const stored = await tryHistoryStorage.getItem<TryHistory[]>('list')
      this.tryHistoryList = stored || []
    },

    // Fetch from API
    async fetchFromApi() {
      const res = await getTryHistory()
      this.tryHistoryList = res.data
      await tryHistoryStorage.setItem('list', JSON.parse(JSON.stringify(this.tryHistoryList)))
    },

    // Add new tryHistory item (rare, usually only fetched)
    async add(item: TryHistory) {
      this.tryHistoryList.unshift(item) // put latest first
      await tryHistoryStorage.setItem('list', JSON.parse(JSON.stringify(this.tryHistoryList)))
    },

    // Update (e.g. packing status or delivery status)
    async update(id: string, updated: Partial<TryHistory>) {
      this.tryHistoryList = this.tryHistoryList.map(h =>
        h.trynbuy_id === id ? { ...h, ...updated } : h
      )
      await tryHistoryStorage.setItem('list', JSON.parse(JSON.stringify(this.tryHistoryList)))
    },

    // Remove one tryHistory entry
    async remove(id: string) {
      this.tryHistoryList = this.tryHistoryList.filter(h => h.trynbuy_id !== id)
      await tryHistoryStorage.setItem('list', JSON.parse(JSON.stringify(this.tryHistoryList)))
    },

    // Clear all tryHistory (optional)
    async clear() {
      this.tryHistoryList = []
      await tryHistoryStorage.removeItem('list')
    },
    
    getTryHistoryById(id: string) {
      return this.tryHistoryList.find(h => h.trynbuy_id === id) || null
    },

  },
})
