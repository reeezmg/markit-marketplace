import { defineStore } from 'pinia'
import localforage from 'localforage'
import axios from 'axios'
import { updateTryNBuyPackingStatus } from '@/api/api'
import { useTryHistoryStore } from './useTryHistoryStore'

// 🔹 Types
export interface CartItem {
  id: string
  name: string
  s_price: number
  d_price: number
  discount: number
  images: string[]
  size: string
  quantity: number
  itemId: string
  barcode?: string
  status: string // ✅ 'PENDING' | 'PACKED' | etc.
}

export interface ReturnItem {
  id: string
  name: string
  s_price: number
  d_price: number
  discount: number
  images: string[]
  size: string
  quantity: number
  itemId: string
  barcode?: string
}

export interface Company {
  id: string
  name: string
  logo?: string | null
  cartitems: CartItem[]
  returneditems: ReturnItem[]
}

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
  companies: Company[]
}

// 🔹 LocalForage instance
const packStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'packs',
})

// 🔹 API base (adjust for your setup)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export const usePackStore = defineStore('pack', {
  state: () => ({
    packList: [] as Pack[],
  }),

  actions: {
    // ---------------- Load / Save ----------------
    async loadFromStorage() {
      const stored = await packStorage.getItem<Pack[]>('list')
      this.packList = stored || []
    },

    async saveToStorage() {
      await packStorage.setItem('list', JSON.parse(JSON.stringify(this.packList)))
    },

    // ---------------- CRUD ----------------
    async add(pack: Pack) {
      this.packList.unshift(pack)
      await this.saveToStorage()
    },

    async update(id: string, updated: Partial<Pack>) {
      this.packList = this.packList.map(p =>
        p.trynbuy_id === id ? { ...p, ...updated } : p
      )
      await this.saveToStorage()
    },

    async remove(id: string) {
      this.packList = this.packList.filter(p => p.trynbuy_id !== id)
      await this.saveToStorage()
    },

    async clear() {
      this.packList = []
      await packStorage.removeItem('list')
    },

    // ---------------- Getters ----------------
    getById(id: string) {
      return this.packList.find(p => p.trynbuy_id === id) || null
    },

    // ---------------- Status Updates ----------------
    async updateOrderStatus(id: string, status: string) {  
      this.packList = this.packList.map(p =>
        p.trynbuy_id === id ? { ...p, order_status: status } : p
      )
      await this.saveToStorage()
    },

    // ✅ Update status of a specific cart item
    async updateCartItemStatus(trynbuyId: string) {
       const tryHistoryStore = useTryHistoryStore()
      const pack = this.packList.find(p => p.trynbuy_id === trynbuyId)
      console.log('Pack found:', pack)
      if (!pack) return



      // ✅ Check if all items across all companies are PACKED
      const allPacked = pack.companies.every(company =>
        company.cartitems.every(item => item.status === 'PACKED')
      )

      // If yes, mark trynbuy as PACKED in API + local
      if (allPacked && pack.packing_status !== 'PACKED' && pack.order_status !== 'PACKED') {
        try {
          console.log(`🟢 All items packed. Updating Trynbuy ${trynbuyId} to PACKED...`)
          await updateTryNBuyPackingStatus(trynbuyId, 'PACKED')
          pack.packing_status = 'PACKED'
          pack.order_status = 'PACKED'
           tryHistoryStore.updateOrderStatus(trynbuyId, 'PACKED')
          await this.saveToStorage()
        } catch (err) {
          console.error('❌ Failed to update packing status:', err)
        }
      }
    },

    async clearStorage() {
      this.packList = []
      await packStorage.clear()
    },
  },
})
