<!-- components/SearchLocationModal.vue -->
<template>
  <ion-modal
    class="search-modal"
    :is-open="isOpen"
    @didDismiss="close"
    :initial-breakpoint="0.8"
    :breakpoints="[0, 0.8, 1]"
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
        class="search-bar"
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
import { ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  map: Object,
  placesService: Object,
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

/* ===============================
   Handle Search Input
=============================== */
const handleSearchInput = () => {
  if (searchQuery.value) {
    isSearching.value = true
    searchPlaces(searchQuery.value)
  } else {
    searchResults.value = []
    isSearching.value = false
  }
}

/* ===============================
   Search Places (LIMIT 5)
=============================== */
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
    if (
      status === google.maps.places.PlacesServiceStatus.OK &&
      results?.length
    ) {
      // ✅ LIMIT RESULTS TO 5
      searchResults.value = results.slice(0, 5)
    } else {
      searchResults.value = []
    }

    isSearching.value = false
  })
}

/* ===============================
   Close Modal
=============================== */
const close = () => {
  emit('close')
  searchQuery.value = ''
  searchResults.value = []
}

/* ===============================
   Select Place
=============================== */
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
  border-radius: var(--markit-radius-xl) var(--markit-radius-xl) 0 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 249, 0.96) 100%);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  border: 1px solid var(--markit-glass-border);
  border-bottom: 0;
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    0 -10px 32px rgba(15, 23, 42, 0.08);
}

.search-modal::part(handle) {
  width: 42px;
  height: 5px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.35);
}

.search-modal-body {
  margin: 20px 15px 10px 15px;
  padding-bottom: calc(var(--markit-bottom-inset) + 12px);
}

.search-bar {
  --background: var(--markit-surface-muted);
  --box-shadow: none;
  --placeholder-color: var(--markit-text-muted);
  --color: var(--markit-text);
  --border-radius: var(--markit-radius-lg);
  margin-bottom: 8px;
  padding: 0;
}

.search-bar::part(container) {
  min-height: 50px;
  border-radius: var(--markit-radius-lg);
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border-strong);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 1px 2px rgba(15, 23, 42, 0.04);
}

.search-bar.searchbar-has-focus::part(container),
.search-bar:hover::part(container) {
  border-color: var(--ion-color-primary);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 0 0 3px color-mix(in srgb, var(--ion-color-primary) 14%, transparent);
}

.search-results-list {
  background: transparent !important;
  --background: transparent !important;
  --ion-background-color: transparent !important;
  padding: 4px 0 2px;
}

.search-result-item {
  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;
  --border-color: transparent;
  --inner-border-width: 0;
  border: 1px solid var(--markit-border);
  border-radius: 16px;
  margin-bottom: 8px;
  background: transparent;
}

.search-result-item::part(native) {
  background: transparent;
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
