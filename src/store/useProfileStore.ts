import { defineStore } from 'pinia'
import localforage from 'localforage'
import type { Profile } from '@/api/types'        // <-- replace with your actual Profile type
import { getProfile, updateProfile, deleteProfile } from '@/api/api'

const profileStorage = localforage.createInstance({
  name: 'markit',
  storeName: 'profile'
})

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as Profile | null
  }),

  actions: {
    // ✅ load from local storage
    async loadFromStorage() {
      const stored = await profileStorage.getItem<Profile>('profile')
      this.profile = stored || null
    },

    // ✅ fetch latest profile from API and cache
    async fetchFromApi() {
      const { data } = await getProfile()
      this.profile = data
      await profileStorage.setItem('profile', JSON.parse(JSON.stringify(this.profile)))
    },

    // ✅ add a profile (e.g. first-time save after login)
    async add(newProfile: Profile) {
      this.profile = newProfile
      await profileStorage.setItem('profile', JSON.parse(JSON.stringify(this.profile)))
    },

    // ✅ edit/update profile both API + local cache
    async edit(updated: Partial<Profile>) {
      if (!this.profile) return
      // Update on server
      await updateProfile(updated)
      // Update locally
      this.profile = { ...this.profile, ...updated }
      await profileStorage.setItem('profile', JSON.parse(JSON.stringify(this.profile)))
    },

    // ✅ remove (soft delete on server + clear local cache)
    async remove() {
      if (!this.profile) return
      await deleteProfile() // call server to mark deleted
      this.profile = null
      await profileStorage.removeItem('profile')
    }
  }
})
