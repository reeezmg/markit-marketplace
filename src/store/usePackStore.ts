import { defineStore } from 'pinia'
import localforage from 'localforage'

// 🔹 Pack type (based on your data)
export interface Pack {
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
  waiting_time: string | null
  waiting_fee: string
  order_status: string
  packing_status: string | null
  company: {
    id: string
    name: string
    logo?: string | null
  }
  cartitems: {
    id: string
    name: string
    s_price: number
    d_price: number
    discount: number
    images: string[]
    size: string
    quantity: number
    itemId: string
  }[]
  returneditems: any[] // refine if you have strict schema
}

// 🔹 LocalForage instance
const packStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'packs',
})

export const usePackStore = defineStore('pack', {
  state: () => ({
    packList: [] as Pack[],
  }),

  actions: {
    // Load from local storage
    async loadFromStorage() {
      const stored = await packStorage.getItem<Pack[]>('list')
      this.packList = stored || []
    },

    // Add new pack
    async add(pack: Pack) {
      // add to start
      this.packList.unshift(pack)
      await packStorage.setItem('list', JSON.parse(JSON.stringify(this.packList)))
    },

    // Update pack (e.g., change packing_status or order_status)
    async update(id: string, updated: Partial<Pack>) {
      this.packList = this.packList.map(p =>
        p.trynbuy_id === id ? { ...p, ...updated } : p
      )
      await packStorage.setItem('list', JSON.parse(JSON.stringify(this.packList)))
    },

    // Remove one pack
    async remove(id: string) {
      this.packList = this.packList.filter(p => p.trynbuy_id !== id)
      await packStorage.setItem('list', JSON.parse(JSON.stringify(this.packList)))
    },

    // Clear all packs
    async clear() {
      this.packList = []
      await packStorage.removeItem('list')
    },

    // Get one pack by id
    getById(id: string) {
      return this.packList.find(p => p.trynbuy_id === id) || null
    },

    // Update only order_status by id
    async updateOrderStatus(id: string, status: string) {
        this.packList = this.packList.map(p =>
            p.trynbuy_id === id ? { ...p, order_status: status } : p
        )
        await packStorage.setItem('list', JSON.parse(JSON.stringify(this.packList)))
    }

  },
})
