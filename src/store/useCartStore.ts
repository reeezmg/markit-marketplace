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
    /** Generate the next available cartNumber */
    getNextCartNumber(): number {
      const used = new Set(this.groups.map(g => g.cartNumber))
      let n = 1
      while (used.has(n)) n++
      return n
    },

    /** Load and migrate old cart data if needed */
    async loadCart() {
      const value = await cartStorage.getItem<string>(STORAGE_KEY)
      if (!value) return

      const parsed = JSON.parse(value)

      // Migration: Old format CartItem[][]
      if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
        this.groups = (parsed as CartItem[][]).map((arr, idx) => ({
          cartNumber: idx + 1,
          companies: arr.map(item => ({
            companyId: item.companyId,
            companyName: item.companyName,
            companyLogo: item.companyLogo,
            companyLat: item.companyLat,
            companyLng: item.companyLng,
            items: [item],
          })),
        }))
        await this.saveCart()
        return
      }

      // Migration: Old CartGroup[] without companies array
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
              items: old.items,
            },
          ],
        }))
        await this.saveCart()
        return
      }

      // Already new shape
      this.groups = parsed ?? []
    },

    async saveCart() {
      await cartStorage.setItem(STORAGE_KEY, JSON.stringify(this.groups))
    },

    async clearCart() {
      this.groups = []
      await cartStorage.removeItem(STORAGE_KEY)
    },

    /** Remove a company by ID across all groups */
    async removeByCompanyId(companyId: string) {
      this.groups = this.groups
        .map(group => ({
          ...group,
          companies: group.companies.filter(c => c.companyId !== companyId),
        }))
        .filter(group => group.companies.length > 0)
      await this.saveCart()
    },

    /** Remove a specific item from a company */
    async removeItem(variantId: string, size: string | null = null) {
      for (const group of this.groups) {
        for (const company of group.companies) {
          const idx = company.items.findIndex(
            i => i.id === variantId && i.selectedSize === size
          )
          if (idx !== -1) {
            const item = company.items[idx]
            if (item.quantity > 1) {
              item.quantity -= 1
            } else {
              company.items.splice(idx, 1)
            }
          }
        }

        // remove empty companies
        group.companies = group.companies.filter(c => c.items.length > 0)
      }

      // remove empty groups
      this.groups = this.groups.filter(g => g.companies.length > 0)
      await this.saveCart()
    },

    /**
     * Add a variant to the correct group.
     * If NearbyStore has a linked cartNumber, it uses that.
     * Otherwise:
     *  - Find a group with the same company
     *  - If none, create a new cart group
     */
    async addItem(
      variant: any,
      sizes: (string | null)[],
      quantity: number = 1
    ) {
      const nearbyStore = useNearbyStore()

      // check if this company has a known nearby link
      const linkedCartNumber = nearbyStore.getCartNumberForCompany(variant.companyId)

      // Determine target group
      let targetGroup: CartGroup | undefined

      if (linkedCartNumber) {
        targetGroup = this.groups.find(g => g.cartNumber === linkedCartNumber)
      } else {
        // check existing group with this company
        targetGroup = this.groups.find(g =>
          g.companies.some(c => c.companyId === variant.companyId)
        )
      }

      // create new group if none found
      if (!targetGroup) {
        targetGroup = {
          cartNumber: linkedCartNumber || this.getNextCartNumber(),
          companies: [],
        }
        this.groups.push(targetGroup)
      }

      // find or create company inside the group
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
          items: [],
        }
        targetGroup.companies.push(targetCompany)
      }

      // add or update item
      sizes.forEach(size => {
        const existing = targetCompany!.items.find(
          i => i.id === variant.id && i.selectedSize === size
        )
        if (existing) {
          existing.quantity += quantity
        } else {
          targetCompany!.items.push({
            ...variant,
            selectedSize: size,
            quantity,
          })
        }
      })

      await this.saveCart()

      // refresh nearby list
      nearbyStore.fetchNearbyShops()
    },

    /** Merge two cart groups into one */
    async mergeGroups(cartNumber1: number, cartNumber2: number) {
      const group1 = this.groups.find(g => g.cartNumber === cartNumber1)
      const group2 = this.groups.find(g => g.cartNumber === cartNumber2)
      if (!group1 || !group2) return

      // merge companies (avoid duplicates)
      group2.companies.forEach(comp => {
        const existing = group1.companies.find(c => c.companyId === comp.companyId)
        if (existing) {
          existing.items.push(...comp.items)
        } else {
          group1.companies.push(comp)
        }
      })

      // remove group2
      this.groups = this.groups.filter(g => g.cartNumber !== cartNumber2)
      await this.saveCart()
    },
  },
})
