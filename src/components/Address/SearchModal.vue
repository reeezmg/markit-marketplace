<!-- components/SearchLocationModal.vue -->
<template>
  <ion-modal
    class="search-modal markit-filter-sheet"
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
    <div class="search-modal-body">
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

      <ion-list v-else-if="searchResults.length > 0" class="search-results-list">
      <ion-item
        v-for="(result, index) in searchResults"
        :key="index"
        button
        lines="none"
        @click="select(result)"
        class="search-result-item"
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
  if (place?.geometry?.location || !props.placesService || !place?.place_id) {
    emit('select', place)
    close()
    return
  }

  props.placesService.getDetails(
    {
      placeId: place.place_id,
      fields: ['name', 'formatted_address', 'geometry'],
    },
    (details, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        emit('select', details)
      } else {
        emit('select', place)
      }
      close()
    }
  )
}
</script>

<style scoped>
.search-modal::part(content) {
  border-radius: 24px 24px 0 0;
  overflow: hidden;
}

.search-modal-body {
  padding: 14px 14px 18px;
  background: var(--markit-bg);
}

ion-searchbar {
  --background: transparent;
  --box-shadow: none;
  --placeholder-color: var(--markit-text-muted);
  --color: var(--markit-text);
  margin-bottom: 8px;
}

ion-searchbar::part(container) {
  min-height: 52px;
  border-radius: var(--markit-radius-xl);
}

.search-results-list {
  background: transparent;
  padding: 4px 0 2px;
}

.search-result-item {
  --background: var(--markit-glass-surface-strong);
  --border-color: transparent;
  border: 1px solid var(--markit-glass-border);
  border-radius: 16px;
  margin-bottom: 8px;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
}

.search-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 0 1rem 0;
}

.no-results {
  text-align: center;
  padding: 1rem;
  color: var(--markit-text-muted);
}

ion-label h3 {
  font-weight: 700;
  color: var(--markit-text);
}

ion-label p {
  color: var(--markit-text-muted);
  font-size: 0.8rem;
  margin-top: 0.25rem;
}
</style> 
