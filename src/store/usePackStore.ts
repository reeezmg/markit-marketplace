import { defineStore } from 'pinia'
import localforage from 'localforage'
import axios from 'axios'
import { updateTryNBuyPackingStatus, getTryHistory } from '@/api/api'
import { useTryHistoryStore, type TryHistory, type TryItem } from './useTryHistoryStore'

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
  delivery_otp?: string | null
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

    // ---------------- API Recovery ----------------
    async fetchFromApi() {
      try {
        const res = await getTryHistory()
        if (!res?.data) return

        const histories: TryHistory[] = res.data

        const packs: Pack[] = histories.map((h) => {
          // Build a company map from the companies array
          const companyMap = new Map<string, Company>()
          for (const co of h.companies) {
            companyMap.set(co.id, {
              id: co.id,
              name: co.name,
              logo: co.logo ?? null,
              cartitems: [],
              returneditems: [],
            })
          }

          // Group cartitems under their company
          for (const item of h.cartitems) {
            const co = companyMap.get(item.company.id)
            if (co) {
              co.cartitems.push({
                id: item.id,
                name: item.name,
                s_price: item.s_price,
                d_price: item.d_price,
                discount: item.discount,
                images: item.images,
                size: item.size ?? '',
                quantity: item.quantity,
                itemId: item.itemId ?? item.id,
                barcode: item.barcode ?? '',
                status: item.status ?? 'PENDING',
              })
            }
          }

          // Group returneditems under their company
          for (const item of h.returneditems) {
            const co = companyMap.get(item.company.id)
            if (co) {
              co.returneditems.push({
                id: item.id,
                name: item.name,
                s_price: item.s_price,
                d_price: item.d_price,
                discount: item.discount,
                images: item.images,
                size: item.size ?? '',
                quantity: item.quantity,
                itemId: item.itemId ?? item.id,
                barcode: item.barcode ?? '',
              })
            }
          }

          return {
            trynbuy_id: h.trynbuy_id,
            order_number: h.order_number,
            created_at: h.created_at,
            checkout_method: h.checkout_method,
            subtotal: h.subtotal,
            product_discount: h.product_discount,
            total_discount: h.total_discount,
            shipping: h.shipping,
            delivery_type: h.delivery_type,
            delivery_time: h.delivery_time,
            waiting_time: null,
            waiting_fee: '',
            order_status: h.order_status ?? '',
            packing_status: h.packing_status ?? null,
            companies: Array.from(companyMap.values()),
          }
        })

        if (this.packList.length === 0) {
          // Local data lost — replace entirely from API
          this.packList = packs
        } else {
          // Merge: add only packs not already stored locally
          const existingIds = new Set(this.packList.map(p => p.trynbuy_id))
          const newPacks = packs.filter(p => !existingIds.has(p.trynbuy_id))
          if (newPacks.length > 0) {
            this.packList.unshift(...newPacks)
          }
        }
        await this.saveToStorage()
      } catch (err) {
        console.error('❌ Failed to fetch packs from API:', err)
        // fallback to whatever is cached locally
        await this.loadFromStorage()
      }
    },
  },
})
