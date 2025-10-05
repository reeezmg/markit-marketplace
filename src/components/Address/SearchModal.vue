<!-- components/SearchLocationModal.vue -->
<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="close"
    :initial-breakpoint="0.65"
    :breakpoints="[0, 0.6, 0.75]"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <div class="p-4">
      <ion-searchbar
        v-model="searchQuery"
        @ionInput="handleSearchInput"
        placeholder="Search place..."
        animated
        debounce="300"
      ></ion-searchbar>

      <div v-if="isSearching" class="search-loading">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <ion-list v-else-if="searchResults.length > 0">
        <ion-item
          v-for="(result, index) in searchResults"
          :key="index"
          @click="select(result)"
        >
          <ion-label class="py-2">
            <h3>{{ result.name }}</h3>
            <p>{{ result.formatted_address }}</p>
          </ion-label>
        </ion-item>
      </ion-list>

      <div v-else-if="searchQuery && !searchResults.length" class="no-results">
        <p>No results found</p>
      </div>
    </div>
  </ion-modal>
</template>

<script setup>
import {
  IonModal,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonSpinner,
} from '@ionic/vue'
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  map: Object,
  placesService: Object,
})
const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

const handleSearchInput = () => {
  if (searchQuery.value) {
    isSearching.value = true
    searchPlaces(searchQuery.value)
  } else {
    searchResults.value = []
    isSearching.value = false
  }
}

const searchPlaces = (query) => {
  if (!props.placesService) return

  const request = {
    query,
    fields: ['name', 'formatted_address', 'geometry'],
    region: 'in',
    locationBias: {
      north: 37.6,
      south: 6.5,
      east: 97.25,
      west: 68.7,
    },
  }

  props.placesService.textSearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      searchResults.value = results
    } else {
      searchResults.value = []
    }
    isSearching.value = false
  })
}

const close = () => {
  emit('close')
  searchQuery.value = ''
  searchResults.value = []
}

const select = (place) => {
  emit('select', place)
  close()
}
</script>

<style scoped>
.search-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0 1rem 0;
}

.no-results {
  text-align: center;
  padding: 1rem;
  color: #666;
}

ion-label h3 {
  font-weight: 500;
}

ion-label p {
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style> 
