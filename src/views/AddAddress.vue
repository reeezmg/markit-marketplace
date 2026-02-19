<template>
  <ion-page class="no-topbar-bg">
    <Topbar title="Add Address" />

    <ion-content class="address-content">
      <div class="map-container-wrapper">
        <div ref="mapContainer" class="map-container"></div>
        <ion-button expand="block" class="use-location-btn" @click="useCurrentLocation">Use Current Location</ion-button>
      </div>

      <div class="mt-5 bottom-div">
        <button class="address-search-trigger glass-card" type="button" @click="openSearchModal">
          <ion-icon :icon="searchOutline" class="address-search-icon"></ion-icon>
          <span class="address-search-text">Search place...</span>
        </button>
        
        <div v-if="name || formattedAddress" class="latlng-display">
          <div class="flex flex-col">
            <div class="text-xl font-bold mb-2">{{ name }}</div>
            <div class="text-md">{{ formattedAddress }}</div>
          </div>
        </div>
      </div>

      <SearchModal
        :is-open="isSearchModalOpen"
        :map="map"
        :placesService="placesService"
        @close="closeSearchModal"
        @select="selectLocation"
      />
      <MoreDetailsModal
        :is-open="isConfirmProceedModalOpen"
        :map="map"
        :placesService="placesService"
        :name="name"
        :formattedAddress="formattedAddress"
        @close="closeConfirmProceedModal"
        @save="confirmLocation"

      />

    </ion-content>
    
    <ion-footer class="footer-btn">
      <div expand="block" class="add-details-btn" @click="confirmProceed">Confirm & Proceed</div>
    </ion-footer>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
} from '@ionic/vue'
import { ref, onMounted } from 'vue'
import { create, searchOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import SearchModal from '@/components/Address/SearchModal.vue'
import MoreDetailsModal from '@/components/Address/MoreDetailsModal.vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter, useRoute } from 'vue-router';
import { createAddress } from '@/api/address';
import { useAddressStore } from '@/store/useAddressStore';
import { v4 as uuidv4 } from 'uuid'

const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const addressStore = useAddressStore()
const router = useRouter();
const route = useRoute();
const redirect = route.params.redirect;
const { setLocation } = useLocationStore()
const isSearchModalOpen = ref(false)
const isConfirmProceedModalOpen = ref(false)
const mapContainer = ref(null)
const lat = ref(null)
const lng = ref(null)
const name = ref('')
const formattedAddress = ref('')
let placesService = null

let map, marker, autocomplete
let geocoder = null

const useCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const location = { lat: latitude, lng: longitude }
        map.setCenter(location)
        map.setZoom(15)
        if (marker) marker.position = location
        if (geocoder) {
          geocoder.geocode({ location }, (results, status) => {
            if (status === 'OK' && results && results.length > 0) {
              name.value = results[0].address_components?.[0]?.long_name || ''
              formattedAddress.value = results[0].formatted_address || ''
            } else {
              name.value = ''
              formattedAddress.value = ''
            }
          });
        }
        lat.value = latitude
        lng.value = longitude
      },
      (error) => {
        alert('Unable to retrieve your location.')
      }
    )
  } else {
    alert('Geolocation is not supported by this browser.')
  }
}

const initMap = () => {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(mapContainer.value, {
    center: { lat: 20.5937, lng: 78.9629 },
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

  lat.value = marker.position.lat
  lng.value = marker.position.lng

  function updateAddressFromMarker(pos) {
    lat.value = pos.lat;
    lng.value = pos.lng;
    if (geocoder) {
      geocoder.geocode({ location: pos }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          name.value = results[0].address_components?.[0]?.long_name || ''
          formattedAddress.value = results[0].formatted_address || ''
        } else {
          name.value = ''
          formattedAddress.value = ''
        }
      });
    }
  }

  marker.addListener('dragend', () => {
    const pos = marker.position
    updateAddressFromMarker(pos)
  })

  map.addListener('click', (e) => {
    marker.position = e.latLng
    updateAddressFromMarker({ lat: e.latLng.lat(), lng: e.latLng.lng() })
  })

  useCurrentLocation()
  updateAddressFromMarker(marker.position)
}

const selectLocation = (place) => {
  if (!place.geometry || !place.geometry.location) return
  const location = place.geometry.location
  map.setCenter(location)
  map.setZoom(15)
  marker.position = location
  lat.value = location.lat()
  lng.value = location.lng()
  name.value = place.name
  formattedAddress.value = place.formatted_address
  closeSearchModal()
}

const openConfirmProceedModal = () => {
  isConfirmProceedModalOpen.value = true
}
const closeConfirmProceedModal = () => {
  isConfirmProceedModalOpen.value = false
}

const closeSearchModal = () => {
  isSearchModalOpen.value = false
}

const openSearchModal = () => {
  isSearchModalOpen.value = true

  setTimeout(() => {
    const input = document.getElementById('searchInput')
    if (!input) return

    autocomplete = new google.maps.places.Autocomplete(input)
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry || !place.geometry.location) return

      const location = place.geometry.location
      map.setCenter(location)
      map.setZoom(15)
      marker.position = location
      lat.value = location.lat()
      lng.value = location.lng()
      name.value = place.name
      formattedAddress.value = place.formatted_address
      isSearchModalOpen.value = false
    })
  }, 300)
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places,marker`
  script.async = true
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
})

const uuid = uuidv4()

const confirmLocation = async (data) => {
  if (lat.value && lng.value && name.value && formattedAddress.value) {
    const location = {
      id: uuid,
      lat: lat.value,
      lng: lng.value,
      name: name.value,
      formattedAddress: formattedAddress.value,
      houseDetails: data.houseDetails,
      landmark: data.landmark,
      type: data.type,
    }

    await setLocation(location)
  
    await addressStore.add({
      id: uuid,
      name: data.name,
      formattedAddress: formattedAddress.value,
      houseDetails: data.houseDetails,
      landmark: data.landmark,
      type: data.type,
      lat: lat.value,
      lng: lng.value,
    })

     if (redirect === 'cart') {
      router.push({ name: 'cart' })
     } else if (redirect === 'account') {
      router.push({ name: 'account' })
     } else {
      router.push({ name: 'shops' })
     }

     await createAddress({
      id: uuid,
      name: data.name,
      formattedAddress: formattedAddress.value,
      houseDetails: data.houseDetails,
      landmark: data.landmark,
      type: data.type,
      lat: lat.value,
      lng: lng.value,
    })
    await addressStore.fetchFromApi()


  } else {
    alert('Please select a valid location.')
  }
}

const confirmProceed = () => {
  openConfirmProceedModal();
}

</script>

<style scoped>
.footer-btn {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  padding-bottom: var(--markit-bottom-inset);
}

.add-details-btn {
  width: 100%;
  text-align: center;
    font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  margin: 0;
  background-color: var(--ion-color-primary);
  color: white;
  padding: 12px 0;
  font-weight: 600;
  font-size: 1.1rem;

}

.address-content {
  --padding-top: 10px;
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-bottom: calc(106px + var(--markit-bottom-inset));
}

.map-container-wrapper {
  position: relative;
  height: 44vh;
  border-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  overflow: hidden;
}

.bottom-div {
  min-height: 38vh;
}

.use-location-btn {
  width: calc(100% - 16px);
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 10;
  --border-radius: var(--markit-radius-pill);
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.map-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.latlng-display {
  margin-top: 12px;
  padding: 16px;
  border-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
}

.address-search-trigger {
  width: 100%;
  margin-top: 4px;
  min-height: 52px;
  border-radius: var(--markit-radius-xl);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: var(--markit-text-muted);
}

.address-search-icon {
  width: 20px;
  height: 20px;
}

.address-search-text {
  font-size: 18px;
  line-height: 1;
}

@media (max-height: 780px) {
  .map-container-wrapper {
    height: 40vh;
  }

  .bottom-div {
    min-height: 42vh;
  }
}

@media (max-height: 700px) {
  .address-content {
    --padding-top: 8px;
    --padding-bottom: calc(98px + var(--markit-bottom-inset));
  }

  .map-container-wrapper {
    height: 36vh;
  }

  .bottom-div {
    min-height: 44vh;
  }

  .use-location-btn {
    width: calc(100% - 12px);
    left: 6px;
    bottom: 6px;
    font-size: 14px;
  }

  .address-search-trigger {
    min-height: 48px;
    padding: 0 14px;
  }

  .address-search-text {
    font-size: 16px;
  }
}

:deep(.gm-style .gm-style-mtc button),
:deep(.gm-fullscreen-control),
:deep(.gm-svpc),
:deep(.gm-bundled-control .gmnoprint) {
  border-radius: 14px !important;
  border: 1px solid var(--markit-glass-border) !important;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow) !important;
}

:deep(.gm-style .gm-style-mtc button) {
  background: rgba(255, 255, 255, 0.92) !important;
  color: var(--markit-text) !important;
}

:deep(.gm-style .gm-style-mtc button[aria-pressed="true"]) {
  background: color-mix(in srgb, var(--ion-color-primary) 22%, #ffffff) !important;
  color: var(--ion-color-primary-shade) !important;
}

</style>
