import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    debouncedQuery: '',
    timer: null as number | null
  }),
  
  actions: {
    setQuery(value: string) {
      this.query = value
    },
    
    setDebouncedQuery(value: string) {
      this.debouncedQuery = value
    },
    
    clearSearch() {
      this.query = ''
      this.debouncedQuery = ''
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    }
  }
})