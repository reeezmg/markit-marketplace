import { defineStore } from 'pinia'
import localforage from 'localforage'
import { getTryHistory } from '@/api/api'

// 🧩 Types matching your /trynbuy endpoint
export interface CompanyInfo {
  id: string
  name: string
  logo?: string | null
}

export interface ItemCompany {
  id: string
  name: string
  logo?: string | null
}

export interface TryItem {
  id: string
  name: string
  s_price: number
  d_price: number
  discount: number
  images: string[]
  size: string | null
  quantity: number
  company: ItemCompany
}

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
  order_status: string | null
  packing_status: string | null
  companies: CompanyInfo[]
  cartitems: TryItem[]
  returneditems: TryItem[]
}

// 🧠 LocalForage instance
const tryHistoryStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'tryHistory',
})

export const useTryHistoryStore = defineStore('tryHistory', {
  state: () => ({
    tryHistoryList: [] as TryHistory[],
  }),

  actions: {
    // ✅ Load from localForage
    async loadFromStorage() {
      const stored = await tryHistoryStorage.getItem<TryHistory[]>('list')
      this.tryHistoryList = stored || []
    },

    // ✅ Fetch fresh data from API and sync locally
    async fetchFromApi() {
      try {
        const res = await getTryHistory()
        if (res?.data) {
          this.tryHistoryList = res.data
          await tryHistoryStorage.setItem(
            'list',
            JSON.parse(JSON.stringify(this.tryHistoryList))
          )
        }
      } catch (err) {
        console.error('❌ Failed to fetch TryHistory:', err)
        // fallback to offline cache
        await this.loadFromStorage()
      }
    },

    // ✅ Add a new entry (prepend for recency)
    async add(item: TryHistory) {
      this.tryHistoryList.unshift(item)
      await tryHistoryStorage.setItem(
        'list',
        JSON.parse(JSON.stringify(this.tryHistoryList))
      )
    },

    // ✅ Update a specific order
    async update(id: string, updated: Partial<TryHistory>) {
      this.tryHistoryList = this.tryHistoryList.map(h =>
        h.trynbuy_id === id ? { ...h, ...updated } : h
      )
      await tryHistoryStorage.setItem(
        'list',
        JSON.parse(JSON.stringify(this.tryHistoryList))
      )
    },

    // ✅ Update only order status
    async updateOrderStatus(id: string, status: string) {
      this.tryHistoryList = this.tryHistoryList.map(h =>
        h.trynbuy_id === id ? { ...h, order_status: status } : h
      )
      await tryHistoryStorage.setItem(
        'list',
        JSON.parse(JSON.stringify(this.tryHistoryList))
      )
    },

    // ✅ Remove one entry
    async remove(id: string) {
      this.tryHistoryList = this.tryHistoryList.filter(h => h.trynbuy_id !== id)
      await tryHistoryStorage.setItem(
        'list',
        JSON.parse(JSON.stringify(this.tryHistoryList))
      )
    },

    // ✅ Clear all history
    async clear() {
      this.tryHistoryList = []
      await tryHistoryStorage.removeItem('list')
    },

    // ✅ Get a single Trynbuy by ID
    getTryHistoryById(id: string) {
      return this.tryHistoryList.find(h => h.trynbuy_id === id) || null
    },
  },
})
