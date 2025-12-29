import { defineStore } from 'pinia'
import localforage from 'localforage'
import type { Address } from '@/api/address'
import { getAddresses } from '@/api/address'

const addressStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'addresses',
})

export const useAddressStore = defineStore('address', {
  state: () => ({
    addresses: [] as Address[],
  }),

  actions: {
    async loadFromStorage() {
      const stored = await addressStorage.getItem<Address[]>('list')
      this.addresses = stored || []
    },

    async fetchFromApi() {
      const res = await getAddresses()
      this.addresses = res
      await addressStorage.setItem('list', JSON.parse(JSON.stringify(this.addresses)))
    },

    async add(address: Address) {
      this.addresses.push(address)
      await addressStorage.setItem('list', JSON.parse(JSON.stringify(this.addresses)))
    },

    async edit(id: string, updated: Partial<Address>) {
      this.addresses = this.addresses.map(a =>
        a.id === id ? { ...a, ...updated } : a
      )
      await addressStorage.setItem('list', JSON.parse(JSON.stringify(this.addresses)))
    },

    async remove(id: string) {
      this.addresses = this.addresses.filter(a => a.id !== id)
      await addressStorage.setItem('list', JSON.parse(JSON.stringify(this.addresses)))
    },

    // ⭐ NEW FUNCTION
    async clear() {
      this.addresses = []
      await addressStorage.removeItem('list')   // delete only this item
      // OR: await addressStorage.clear()      // clears entire address storage
    },

    async clearStorage() {
      this.addresses = []
      await addressStorage.clear()
    },
  },
})
