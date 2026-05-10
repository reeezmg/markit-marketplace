<template>
  <ion-page class="no-topbar-bg">
    <Topbar title="Add Address" />

    <ion-content class="address-content" fullscreen="true">
      <div class="map-container-wrapper">
        <div ref="mapContainer" class="map-container"></div>
        <ion-button class="use-location-btn" @click="useCurrentLocation">Use Current Location</ion-button>
      </div>

      <div class="bottom-div">
        <button class="address-search-trigger glass-card" type="button" @click="openSearchModal">
          <ion-icon :icon="searchOutline" class="address-search-icon"></ion-icon>
          <span class="address-search-text">Search for a place</span>
        </button>

        <section class="address-summary glass-card">
          <div class="address-summary-header">
            <span class="address-summary-icon">
              <ion-icon :icon="locationOutline" />
            </span>
            <span class="address-summary-label">Selected Location</span>
          </div>
          <div v-if="name || formattedAddress" class="address-summary-body">
            <div class="address-summary-name">{{ name }}</div>
            <div class="address-summary-line">{{ formattedAddress }}</div>
          </div>
          <div v-else class="address-summary-empty">
            Pick a place from the map or search to continue.
          </div>
        </section>
      </div>

      <SearchModal :is-open="isSearchModalOpen" :map="map" :placesService="placesService" @close="closeSearchModal"
        @select="selectLocation" />
      <MoreDetailsModal :is-open="isConfirmProceedModalOpen" :map="map" :placesService="placesService" :name="name"
        :formattedAddress="formattedAddress" @close="closeConfirmProceedModal" @save="confirmLocation" />

    </ion-content>

    <ion-footer class="footer-btn">
      <div class="markit-glass-footer-shell">
        <ion-button expand="block" class="confirm-btn" :disabled="!hasSelectedLocation" @click="confirmProceed">
          Confirm & Proceed
        </ion-button>
      </div>
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
import { computed, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { searchOutline, locationOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import SearchModal from '@/components/Address/SearchModal.vue'
import MoreDetailsModal from '@/components/Address/MoreDetailsModal.vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useIonRouter } from '@ionic/vue';
import { useRoute } from 'vue-router'
import { createAddress } from '@/api/address';
import { useAddressStore } from '@/store/useAddressStore';
import { v4 as uuidv4 } from 'uuid'
import { getDeviceLocation } from '@/utils/geolocation'

const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const addressStore = useAddressStore()
const router = useIonRouter();
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
const hasSelectedLocation = computed(() => Boolean(lat.value && lng.value && name.value && formattedAddress.value))

let map, marker, autocomplete
let geocoder = null

const useCurrentLocation = async () => {
  try {
    const { lat: latitude, lng: longitude } = await getDeviceLocation()
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
  } catch (error) {
    alert('Unable to retrieve location. Please check location permission and turn on device location services (GPS).')
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

onIonViewWillEnter(() => {
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places,marker`
  script.async = true
  script.defer = true
  script.onload = initMap
  document.head.appendChild(script)
})

const confirmLocation = async (data) => {
  if (lat.value && lng.value && name.value && formattedAddress.value) {
    const addressId = uuidv4()
    const location = {
      id: addressId,
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
      id: addressId,
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
      id: addressId,
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
  background: transparent;
  padding: 8px 10px calc(10px + var(--markit-bottom-inset));
}

.address-content {
  --padding-top: 10px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-bottom: calc(72px + var(--markit-bottom-inset));
}

.map-container-wrapper {
  position: relative;
  height: 42vh;
  border-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  overflow: hidden;
}

.bottom-div {
  min-height: 40vh;
  padding: 14px 0 0;
}

.bottom-div > * {
  margin-left: 0;
  margin-right: 0;
  width: 100%;
}

.use-location-btn {
  width: min(78%, 300px);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 8px;
  z-index: 10;
  --border-radius: var(--markit-btn-radius);
  --background: color-mix(in srgb, var(--ion-color-primary) 14%, rgba(255, 255, 255, 0.52));
  --background-hover: color-mix(in srgb, var(--ion-color-primary) 20%, rgba(255, 255, 255, 0.62));
  --background-activated: color-mix(in srgb, var(--ion-color-primary) 24%, rgba(255, 255, 255, 0.66));
  --border-color: var(--markit-glass-border-hover);
  --color: #2d5444;
  --box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 10px 18px rgba(20, 34, 28, 0.14);
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  font-weight: 700;
  letter-spacing: 0.01em;
}

.use-location-btn::part(native) {
  border: 1px solid rgba(83, 129, 108, 0.34);
  background-image: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.56) 0%,
    rgba(255, 255, 255, 0.12) 52%,
    rgba(83, 129, 108, 0.14) 100%
  );
}

.map-container {
  height: 100%;
  width: 100%;
  position: relative;
}

.address-summary {
  margin-top: 12px;
  padding: 14px 14px 12px;
  border-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
}

.address-summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.address-summary-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.address-summary-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--markit-text-muted);
}

.address-summary-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.address-summary-name {
  font-size: 1.05rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
}

.address-summary-line,
.address-summary-empty {
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
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
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1;
}

.confirm-btn {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --color: #ffffff;
  --border-radius: var(--markit-btn-radius);
  --box-shadow: none;
  width: 100%;
  max-width: none;
  min-height: 38px;
  height: 38px;
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.1px;
  margin: 0;
}

.confirm-btn::part(native) {
  width: 100%;
  min-height: 38px;
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
    width: min(84%, 280px);
    left: 50%;
    transform: translateX(-50%);
    bottom: 6px;
    font-size: 14px;
  }

  .address-search-trigger {
    min-height: 48px;
    padding: 0 14px;
  }

  .address-search-text {
    font-size: 0.92rem;
  }

  .address-summary {
    padding: 14px;
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
