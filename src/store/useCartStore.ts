import { defineStore } from 'pinia'
import localforage from 'localforage'

const STORAGE_KEY = 'cart'

const cartStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'cartStore',
})

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as any[], // full variant objects, each item should have `quantity` and optional `size`
  }),

  actions: {
    async loadCart() {
      const value = await cartStorage.getItem<string>(STORAGE_KEY)
      if (value) {
        this.items = JSON.parse(value)
      }
    },

    async saveCart() {
      await cartStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

    async addItem(variant: any, sizes: (string | null)[], quantity: number = 1) {
      sizes.forEach(size => {
        const existing = this.items.find(
          v => v.id === variant.id && v.selectedSize === size
        )

        if (existing) {
          existing.quantity += quantity
        } else {
          this.items.push({
            ...variant,
            selectedSize: size,
            quantity,
          })
        }
      })

      await this.saveCart()
    },

    async removeItem(variantId: string, size: string | null = null) {
      const index = this.items.findIndex(
        v => v.id === variantId && v.selectedSize === size
      )

      if (index !== -1) {
        const item = this.items[index]
        if (item.quantity && item.quantity > 1) {
          item.quantity -= 1
        } else {
          this.items.splice(index, 1)
        }
        await this.saveCart()
      }
    },

    async clearCart() {
      this.items = []
      await cartStorage.removeItem(STORAGE_KEY)
    },

    // ✅ New function
    async removeByCompanyId(companyId: string) {
      this.items = this.items.filter(item => item.companyId !== companyId)
      await this.saveCart()
    },
  },
})
