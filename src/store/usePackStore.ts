import { defineStore } from 'pinia'
import localforage from 'localforage'
import { getTryHistory } from '@/api/api'
import { type TryHistory } from './useTryHistoryStore'

// 🔹 Types
export interface CartItem {
  cartItemId?: string
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
  cartItemId?: string
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
  delivery_partner_id?: string | null
  delivery_otp?: string | null
  store_statuses?: Record<string, any> | null
  companies: Company[]
}

// 🔹 LocalForage instance
const packStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'packs',
})

const HIDDEN_CART_STATUSES = new Set(['OUTOFSTOCK', 'CANCELLED'])

const normalizeCompanies = (companies: Company[] = []) =>
  companies
    .map((company) => ({
      ...company,
      cartitems: (company.cartitems || []).filter((item) => !HIDDEN_CART_STATUSES.has(String(item.status || '').toUpperCase())),
    }))
    .filter((company) => company.cartitems.length > 0 || company.returneditems.length > 0)

const normalizePack = (pack: Pack): Pack => ({
  ...pack,
  companies: normalizeCompanies(pack.companies || []),
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
      this.packList.unshift(normalizePack(pack))
      await this.saveToStorage()
    },

    async update(id: string, updated: Partial<Pack>) {
      this.packList = this.packList.map(p =>
        p.trynbuy_id === id ? normalizePack({ ...p, ...updated } as Pack) : p
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

    // Store-level packing is now tracked on the order, not inferred from item rows.
    async updateCartItemStatus(trynbuyId: string) {
      const pack = this.packList.find(p => p.trynbuy_id === trynbuyId)
      console.log('Pack found:', pack)
      if (!pack) return
      await this.saveToStorage()
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
            if (HIDDEN_CART_STATUSES.has(String(item.status || '').toUpperCase())) {
              continue
            }
            const co = companyMap.get(item.company.id)
            if (co) {
              co.cartitems.push({
                id: item.id,
                cartItemId: item.cartItemId,
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

          return normalizePack({
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
            waiting_time: h.waiting_time ?? null,
            waiting_fee: String(h.waiting_fee ?? 0),
            delivery_partner_id: (h as any).delivery_partner_id ?? null,
            delivery_otp: h.delivery_otp ?? null,
            store_statuses: (h as any).store_statuses ?? null,
            order_status: h.order_status ?? '',
            companies: Array.from(companyMap.values()),
          })
        })

        if (this.packList.length === 0) {
          // Local data lost — replace entirely from API
          this.packList = packs
        } else {
          const fetchedById = new Map(packs.map((pack) => [pack.trynbuy_id, pack]))
          this.packList = this.packList.map((pack) => fetchedById.get(pack.trynbuy_id) || pack)
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
