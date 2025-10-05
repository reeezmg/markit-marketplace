import { defineStore } from 'pinia'
import { Preferences } from '@capacitor/preferences'

const STORAGE_KEY = 'likes'

export const useLikeStore = defineStore('likes', {
  state: () => ({
    liked: [] as any[], // full variant objects
  }),

  actions: {
    async loadLikes() {
      const { value } = await Preferences.get({ key: STORAGE_KEY })
      if (value) {
        this.liked = JSON.parse(value)
      }
    },

    async toggleLike(variant: any) {
      const exists = this.liked.find(v => v.id === variant.id)
      if (exists) {
        this.liked = this.liked.filter(v => v.id !== variant.id)
      } else {
        this.liked.push(variant)
      }
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(this.liked),
      })
    },

    isLiked(variantId: string) {
      return this.liked.some(v => v.id === variantId)
    },
  },
})
