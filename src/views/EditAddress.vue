<template>
  <ion-page>
    <ion-header>
      <Topbar />
    </ion-header>

    <ion-content>
      <div class="map-container-wrapper">
        <!-- FIXED: shows map without affecting saved address -->
        <div ref="mapContainer" class="map-container"></div>
      </div>

      <div class="ion-padding bottom-div">
        <!-- SEARCH BAR -->
        <div class="relative w-full" @click="openSearchModal">
          <div class="mt-4 relative w-full">
            <div
              class="flex items-center w-full px-4 py-3 rounded-xl bg-gray-100 focus-within:ring-2 ring-gray-300"
            >
              <ion-icon
                :icon="searchOutline"
                class="text-gray-600 me-3 w-6 h-6"
              ></ion-icon>
              <input
                type="text"
                placeholder="Search..."
                class="bg-transparent w-full focus:outline-none text-base"
                disabled
              />
            </div>
          </div>
        </div>

        <!-- ADDRESS PREVIEW -->
        <div class="latlng-display">
          <div class="flex flex-col">
            <div class="text-2xl font-bold mb-2">{{ name }}</div>
            <div class="text-lg">{{ formattedAddress }}</div>
          </div>
        </div>
      </div>

      <!-- SEARCH MODAL -->
      <SearchModal
        :is-open="isSearchModalOpen"
        @close="closeSearchModal"
        @select="selectLocation"
      />

      <!-- EDIT DETAILS MODAL -->
      <EditMoreDetailsModal
        :is-open="isConfirmProceedModalOpen"
        :name="name"
        :addressId="addressId"
        :formattedAddress="formattedAddress"
        @close="closeConfirmProceedModal"
        @save="confirmLocation"
      />
    </ion-content>

    <ion-footer class="footer-btn">
      <ion-button
        expand="block"
        class="add-details-btn"
        @click="openConfirmProceedModal"
      >
        Confirm & Proceed
      </ion-button>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonHeader,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
} from '@ionic/vue'
import { ref, onMounted, computed } from 'vue'
import { create, searchOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import SearchModal from '@/components/Address/SearchModal.vue'
import EditMoreDetailsModal from '@/components/Address/EditMoreDetailsModel.vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter, useRoute } from 'vue-router'
import { updateAddress } from '@/api/address'
import { useAddressStore } from '@/store/useAddressStore'

const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const addressStore = useAddressStore()
const router = useRouter()
const route = useRoute()

const { setLocation } = useLocationStore()

const isSearchModalOpen = ref(false)
const isConfirmProceedModalOpen = ref(false)
const mapContainer = ref(null)

const lat = ref(null)
const lng = ref(null)
const name = ref('')
const formattedAddress = ref('')

let map = null
let marker = null
let geocoder = null
let placesService = null
let autocomplete = null

// -----------------------------------------
// GET SAVED ADDRESS FROM STORE
// -----------------------------------------
const addressId = route.params.addressId
const redirect = route.params.redirect

const selectedAddress = computed(() =>
  addressStore.addresses.find(a => a.id === addressId)
)

// -----------------------------------------
// MAP INITIALIZATION
// -----------------------------------------
const initMap = () => {
  geocoder = new google.maps.Geocoder()

  map = new google.maps.Map(mapContainer.value, {
    center: { lat: 20.5937, lng: 78.9629 }, // fallback
    zoom: 5,
    mapId: '85423aee1b59e235e896d3e7',
  })

  placesService = new google.maps.places.PlacesService(map)
  const { AdvancedMarkerElement } = google.maps.marker

  marker = new AdvancedMarkerElement({
    map,
    position: map.getCenter(),
    draggable: true,
  })

  // reverse-geocode & update fields
  function updateAddressFromMarker(pos) {
    lat.value = pos.lat
    lng.value = pos.lng

    geocoder.geocode({ location: pos }, (results, status) => {
      if (status === 'OK' && results?.length > 0) {
        name.value = results[0].address_components?.[0]?.long_name || ''
        formattedAddress.value = results[0].formatted_address || ''
      }
    })
  }

  // -----------------------------------------
  // LOAD SAVED ADDRESS FROM STORE
  // -----------------------------------------
  if (selectedAddress.value) {
    const pos = {
      lat: selectedAddress.value.lat,
      lng: selectedAddress.value.lng,
    }

    map.setCenter(pos)
    map.setZoom(17)

    marker.position = pos

    name.value = selectedAddress.value.name
    formattedAddress.value = selectedAddress.value.formattedAddress

    lat.value = pos.lat
    lng.value = pos.lng
  }

  // -----------------------------------------
  // DRAGGING MARKER
  // -----------------------------------------
  marker.addListener('dragend', () => {
    const pos = marker.position
    updateAddressFromMarker(pos)
  })

  // -----------------------------------------
  // CLICKING MAP TO SET LOCATION
  // -----------------------------------------
  map.addListener('click', (e) => {
    const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
    marker.position = pos
    updateAddressFromMarker(pos)
  })
}

// -----------------------------------------
// SEARCH BAR AUTOCOMPLETE
// -----------------------------------------
const openSearchModal = () => {
  isSearchModalOpen.value = true

  setTimeout(() => {
    const input = document.getElementById('searchInput')
    if (!input) return

    autocomplete = new google.maps.places.Autocomplete(input)
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return

      const loc = place.geometry.location
      const pos = { lat: loc.lat(), lng: loc.lng() }

      map.setCenter(pos)
      map.setZoom(17)
      marker.position = pos

      lat.value = pos.lat
      lng.value = pos.lng
      name.value = place.name
      formattedAddress.value = place.formatted_address

      isSearchModalOpen.value = false
    })
  }, 300)
}

const closeSearchModal = () => (isSearchModalOpen.value = false)

// -----------------------------------------
// CONFIRM + SAVE LOCATION
// -----------------------------------------
const confirmLocation = async (data) => {
  if (!lat.value || !lng.value || !formattedAddress.value) {
    alert('Please select a valid location.')
    return
  }

  const location = {
    lat: lat.value,
    lng: lng.value,
    name: name.value,
    formattedAddress: formattedAddress.value,
    houseDetails: data.houseDetails,
    landmark: data.landmark,
    type: data.type,
  }

  await setLocation(location)

  await addressStore.edit(addressId, {
    name: data.name,
    formattedAddress: formattedAddress.value,
    houseDetails: data.houseDetails,
    landmark: data.landmark,
    type: data.type,
    lat: lat.value,
    lng: lng.value,
  })

  await updateAddress(addressId, {
    name: data.name,
    formattedAddress: formattedAddress.value,
    houseDetails: data.houseDetails,
    landmark: data.landmark,
    type: data.type,
    lat: lat.value,
    lng: lng.value,
  })

  await addressStore.fetchFromApi()

  router.push(`/${redirect}`)
}

const openConfirmProceedModal = () => (isConfirmProceedModalOpen.value = true)
const closeConfirmProceedModal = () => (isConfirmProceedModalOpen.value = false)

// -----------------------------------------
// LOAD GOOGLE MAP SCRIPT
// -----------------------------------------
onMounted(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places,marker`
  script.async = true
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
})
</script>


<style scoped>
.footer-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.add-details-btn {
  width: 100%;
  margin: 0;
  --border-radius: 0px;

}

.map-container-wrapper {
  position: relative;
  height: 60%;
}

.bottom-div {
  height: 40%;
}

.use-location-btn {
  margin-top: 0.5rem;
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 10;
  --border-radius: 0px;

}

.map-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.latlng-display {
  margin-top: 1rem;
}

</style>