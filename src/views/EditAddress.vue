<template>
  <ion-page>
    <ion-header>
      <Topbar/>
    </ion-header>

    <ion-content>
      <div class="map-container-wrapper">
        <div ref="mapContainer" class="map-container"></div>
        <ion-button expand="block" class="use-location-btn" @click="useCurrentLocation">Use Current Location</ion-button>
      </div>

      <div class="ion-padding bottom-div">
        <div class="relative w-full" @click="openSearchModal">
          <div class="mt-4 relative w-full">
            <div class="flex items-center w-full px-4 py-3 rounded-xl bg-gray-100 focus-within:ring-2 ring-gray-300">
              <ion-icon :icon="searchOutline" class="text-gray-600 me-3 w-6 h-6"></ion-icon>
              <input
                type="text"
                placeholder="Search..."
                class="bg-transparent w-full focus:outline-none text-base"
              />
            </div>
          </div>
        </div>
        
        <div class="latlng-display">
          <div class="flex flex-col">
            <div class="text-2xl font-bold mb-2">{{ name }}</div>
            <div class="text-lg">{{ formattedAddress }}</div>
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
      <EditMoreDetailsModal
        :is-open="isConfirmProceedModalOpen"
        :map="map"
        :placesService="placesService"
        :name="name"
        :addressId="addressId"
        :formattedAddress="formattedAddress"
        @close="closeConfirmProceedModal"
        @save="confirmLocation"
      />

    </ion-content>
    
    <ion-footer class="footer-btn">
      <ion-button expand="block" class="add-details-btn" @click="confirmProceed">Confirm & Proceed</ion-button>
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
import { ref, onMounted } from 'vue'
import { create, searchOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import SearchModal from '@/components/Address/SearchModal.vue'
import EditMoreDetailsModal from '@/components/Address/EditMoreDetailsModel.vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter,useRoute } from 'vue-router';
import { updateAddress } from '@/api/address';
import { useAddressStore } from '@/store/useAddressStore';
const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const addressStore = useAddressStore()
const router = useRouter();
const route = useRoute();
const { setLocation } = useLocationStore()
const isSearchModalOpen = ref(false)
const isConfirmProceedModalOpen = ref(false)
const mapContainer = ref(null)
const lat = ref(null)
const lng = ref(null)
const name = ref('')
const formattedAddress = ref('')
let placesService = null
const addressId = route.params.addressId;
const redirect = route.params.redirect;
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

const confirmLocation = async (data) => {
  if (lat.value && lng.value && name.value && formattedAddress.value) {
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

     await addressStore.edit(addressId,{
      name: data.name,
      formattedAddress: formattedAddress.value,
      houseDetails: data.houseDetails,
      landmark: data.landmark,
      type: data.type,
      lat: lat.value,
      lng: lng.value,
    })
     router.push(`/${redirect}`);
    await updateAddress(addressId,{
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