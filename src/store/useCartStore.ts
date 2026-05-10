import { defineStore } from 'pinia'
import localforage from 'localforage'
import { useNearbyStore } from './useNearbyStore'

const STORAGE_KEY = 'cart'

const cartStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'cartStore',
})

/* ========= TYPES ========= */

export interface CartItem {
  cartLineId?: string
  id: string
  name: string
  productName: string
  images: string[]
  sprice: number
  dprice: number
  discount: number
  isNew: boolean
  outOfStock: boolean
  selectedSize?: string | null
  quantity: number
  [key: string]: any
}

export interface CompanyGroup {
  companyId: string
  companyName: string
  companyLogo: string
  companyLat: number
  companyLng: number
  companyLocationId: string
  items: CartItem[]
}

export interface CartGroup {
  cartNumber: number
  companies: CompanyGroup[]
}

/* ========= STORE ========= */

export const useCartStore = defineStore('cart', {
  state: () => ({
    groups: [] as CartGroup[],
  }),

  actions: {
    /* ================================
       HELPERS
    ================================= */

    getNextCartNumber(): number {
      const used = new Set(this.groups.map(g => g.cartNumber))
      let n = 1
      while (used.has(n)) n++
      return n
    },

    createCartLineId() {
      if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID()
      }
      return `cart_${Date.now()}_${Math.random().toString(36).slice(2)}`
    },

    normalizeCartItem(item: CartItem): CartItem {
      return {
        ...item,
        cartLineId: item.cartLineId || this.createCartLineId(),
        quantity: 1,
      }
    },

    async loadCart() {
      const value = await cartStorage.getItem<string>(STORAGE_KEY)
      if (!value) return

      const parsed = JSON.parse(value)

      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        this.groups = (parsed as CartItem[][]).map((arr, idx) => ({
          cartNumber: idx + 1,
          companies: arr.map(item => ({
            companyId: item.companyId,
            companyName: item.companyName,
            companyLogo: item.companyLogo,
            companyLat: item.companyLat,
            companyLng: item.companyLng,
            companyLocationId: item.companyLocationId,
            items: [this.normalizeCartItem(item)],
          })),
        }))
        await this.saveCart()
        return
      }

      if (Array.isArray(parsed) && parsed[0]?.items) {
        this.groups = (parsed as any[]).map((old, idx) => ({
          cartNumber: old.cartNumber || idx + 1,
          companies: [
            {
              companyId: old.items[0]?.companyId,
              companyName: old.items[0]?.companyName,
              companyLogo: old.items[0]?.companyLogo,
              companyLat: old.items[0]?.companyLat,
              companyLng: old.items[0]?.companyLng,
              companyLocationId: old.items[0]?.companyLocationId,
              items: (old.items || []).flatMap((item: CartItem) => {
                const qty = Math.max(1, Number(item.quantity || 1))
                return Array.from({ length: qty }, () => this.normalizeCartItem(item))
              }),
            },
          ],
        }))
        await this.saveCart()
        return
      }

      this.groups = (parsed ?? []).map((group: CartGroup) => ({
        ...group,
        companies: (group.companies || []).map(company => ({
          ...company,
          items: (company.items || []).flatMap((item: CartItem) => {
            const qty = Math.max(1, Number(item.quantity || 1))
            return Array.from({ length: qty }, () => this.normalizeCartItem(item))
          }),
        })),
      }))
      await this.saveCart()
    },

    async saveCart() {
      await cartStorage.setItem(STORAGE_KEY, JSON.stringify(this.groups))
    },

    async clearCart() {
      this.groups = []
      await cartStorage.removeItem(STORAGE_KEY)
    },

    async clearStorage() {
      this.groups = []
      await cartStorage.clear()
    },

    /* ================================
       REMOVE
    ================================= */

    async removeByCompanyId(companyId: string) {
      this.groups = this.groups
        .map(group => ({
          ...group,
          companies: group.companies.filter(c => c.companyId !== companyId),
        }))
        .filter(group => group.companies.length > 0)

      await this.saveCart()
    },

    async removeItem(variantId: string, size: string | null = null) {
      for (const group of this.groups) {
        for (const company of group.companies) {
          const idx = company.items.findIndex(i =>
            i.cartLineId === variantId ||
            (i.id === variantId && i.selectedSize === size)
          )

          if (idx !== -1) {
            company.items.splice(idx, 1)
          }
        }

        group.companies = group.companies.filter(c => c.items.length > 0)
      }

      this.groups = this.groups.filter(g => g.companies.length > 0)
      await this.saveCart()
    },

    /* ================================
       ADD ITEM (FIXED LOGIC)
    ================================= */

    async addItem(
      variant: any,
      sizes: (string | null)[],
      quantity: number = 1
    ) {
      const nearbyStore = useNearbyStore()
      const existingCompanyIds = new Set(
        this.groups
          .flatMap(group => group.companies)
          .filter(company => company.items && company.items.length > 0)
          .map(company => company.companyId)
      )
      const isNewCompany = !existingCompanyIds.has(variant.companyId)

      if (isNewCompany && existingCompanyIds.size >= 3) {
        return {
          success: false,
          reason: 'MAX_STORES_REACHED',
          message: 'You can add items from up to 3 stores in one cart.',
        }
      }

      /* CART LIMITS (10 total / 5 per store) — checked before any mutation */
      const incomingUnits = sizes.length * Math.max(1, Number(quantity || 1))
      const totalInCart = this.groups
        .flatMap(g => g.companies)
        .reduce((sum, c) => sum + (c.items?.length || 0), 0)

      if (totalInCart + incomingUnits > 10) {
        return {
          success: false,
          reason: 'CART_FULL',
          message: 'Cart limit is 10 items.',
        }
      }

      const itemsInThisStore = this.groups
        .flatMap(g => g.companies)
        .filter(c => c.companyId === variant.companyId)
        .reduce((sum, c) => sum + (c.items?.length || 0), 0)

      if (itemsInThisStore + incomingUnits > 5) {
        return {
          success: false,
          reason: 'STORE_LIMIT',
          message: 'You can add at most 5 items from a single store.',
        }
      }

      const linkedCartNumber =
        nearbyStore.getCartNumberForCompany(variant.companyId)

      let targetGroup: CartGroup | undefined
      targetGroup = this.groups.find(g =>
        g.companies.some(c => c.companyId === variant.companyId)
      )

      /* --------------------------------
         CASE 1 — Nearby linked store
         (existing logic unchanged)
      -------------------------------- */
      if (linkedCartNumber && !targetGroup) {
        targetGroup = this.groups.find(
          g => g.cartNumber === linkedCartNumber
        )
      }

      /* --------------------------------
         CASE 2 — Non-nearby store
         NEW RULE:
         If cart already has items → block
      -------------------------------- */
      if (!linkedCartNumber && !targetGroup) {
        const cartHasItems = this.groups.some(
          g => g.companies.length > 0
        )

        if (cartHasItems) {
          return {
            success: false,
            reason: 'CART_HAS_ITEMS',
            message:
              'Cart already has products. Can add from nearby store only.',
          }
        }
      }

      /* --------------------------------
         CREATE GROUP IF NONE
      -------------------------------- */
      if (!targetGroup) {
        targetGroup = {
          cartNumber:
            linkedCartNumber || this.getNextCartNumber(),
          companies: [],
        }
        this.groups.push(targetGroup)
      }

      /* --------------------------------
         COMPANY
      -------------------------------- */
      let targetCompany = targetGroup.companies.find(
        c => c.companyId === variant.companyId
      )

      if (!targetCompany) {
        targetCompany = {
          companyId: variant.companyId,
          companyName: variant.companyName,
          companyLogo: variant.companyLogo,
          companyLat: variant.companyLat,
          companyLng: variant.companyLng,
          companyLocationId: variant.companyLocationId,
          items: [],
        }

        targetGroup.companies.push(targetCompany)
      }

      /* --------------------------------
         ITEMS
      -------------------------------- */
      sizes.forEach(size => {
        const units = Math.max(1, Number(quantity || 1))
        for (let index = 0; index < units; index++) {
          targetCompany!.items.push({
            ...variant,
            cartLineId: this.createCartLineId(),
            selectedSize: size,
            quantity: 1,
          })
        }
      })

      await this.saveCart()
      await nearbyStore.fetchNearbyShops()

      return { success: true }
    },

    /* ================================
       MERGE
    ================================= */

    async mergeGroups(
      cartNumber1: number,
      cartNumber2: number
    ) {
      const group1 = this.groups.find(
        g => g.cartNumber === cartNumber1
      )
      const group2 = this.groups.find(
        g => g.cartNumber === cartNumber2
      )

      if (!group1 || !group2) return

      group2.companies.forEach(comp => {
        const existing = group1.companies.find(
          c => c.companyId === comp.companyId
        )

        if (existing) existing.items.push(...comp.items)
        else group1.companies.push(comp)
      })

      this.groups = this.groups.filter(
        g => g.cartNumber !== cartNumber2
      )

      await this.saveCart()
    },
  },
})
