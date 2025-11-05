<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="bg-white ion-no-border">
      <div 
        class="ion-no-border relative rounded-b-3xl transition-all duration-300 ease-in-out"
        :style="headerStyle"
      >
        <div class="ion-padding">
          <Topbar :location="location" :collapsed="isCollapsed" @search="onSearch" />
        </div>

        <!-- Tagline + Button -->
        <div v-if="!isCollapsed" class="transition-opacity duration-300">
          <div class="text-xl text-[#097D4C] font-bold py-3 px-2 flex flex-col items-center justify-center">
           
            <div class="bg-[#F4FBE3] w-fit text-center">Add products from shops on your way</div>

          </div>
          
          <!-- 🔹 Store & Cloud (moved up here, grid style) -->
          
        </div>
      </div>

         <!-- 🔹 Men/Women/Kids/Newborn (moved down here, IonButton style) -->
      <div class="grid grid-cols-4 gap-2 w-full px-3 my-5">
        <ion-button
          v-for="(btn, i) in categoryButtons"
          :key="i"
          size="small"
          expand="block"
          :color="activeCategory === i ? 'primary' : 'gray'"
          :fill="activeCategory === i ? 'solid' : 'outline'"
          @click="activeCategory = i"
        >
          {{ btn }}
        </ion-button>
      </div>

      <!-- Sticky Category -->
      <div class="my-3 sticky top-0 z-50 bg-white">
        <Category @select="searchTerm = $event" :selectedCategory="selectedCategory" />
      </div>

    </ion-header>

    <ion-content
      class="ion-padding relative"
      :fullscreen="true"
      @ionScroll="onScroll"
      scrollEvents="true"
    >
      <!-- Main Content -->
      <Heading title="Explore Shops" />
      <div v-if="loading" class="grid gap-4">
        <!-- Skeletons -->
      </div>
      <div v-else class="mb-25">
        <Shopcard
          v-for="shop in filteredShops"
          :key="shop.id"
          :shop="shop"
          @click="() => router.push(`shop/${shop.id}/${shop.name}`)"
        />
        <div v-if="!filteredShops.length" class="text-center py-8 text-gray-500">
          No shops found.
        </div>
      </div>

      <!-- ✅ Floating Try & Pay Banner(s) -->
     <!-- ✅ Floating Try & Pay Slider -->
<div
  v-if="packStore.packList.length"
  class="fixed left-0 right-0 bottom-16 z-50 overflow-x-auto no-scrollbar px-4"
>
  <div
    class="flex gap-4 pb-3 transition-all duration-300 ease-in-out"
    :class="{
      'justify-center': packStore.packList.length === 1,
      'w-full': packStore.packList.length === 1,
      'w-max': packStore.packList.length > 1
    }"
  >
    <div
      v-for="(pack, i) in packStore.packList"
      :key="pack.trynbuy_id"
      class="flex-shrink-0 bg-black text-white rounded-xl py-3 px-4 shadow-lg flex justify-between items-center"
      :class="packStore.packList.length === 1 ? 'w-full' : 'w-[90%]'"
    >
      <div>
        <div class="text-green-400 font-bold">
          Order #{{ pack.order_number }} {{ formatStatus(pack.order_status) }}
        </div>
        <div class="text-gray-400 text-sm">Pay after your trial</div>
      </div>
      <ion-button
        color="success"
        size="small"
        fill="solid"
        expand="block"
        @click="() => router.push(`/pack/${pack.trynbuy_id}`)"
      >
        Try & Pay
      </ion-button>
    </div>
  </div>
</div>


    </ion-content>

    <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonFooter,IonButton, IonHeader, IonContent, onIonViewWillEnter } from '@ionic/vue'
import Topbar from '@/components/Index/Topbar.vue'
import Shopcard from '@/components/Index/Shopcard.vue'
import Heading from '@/components/Heading.vue'
import { getNearbyShop } from '@/api/api'
import { ref, computed } from 'vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter } from 'vue-router'
import TabsPage from './TabsPage.vue'
import Category from '@/components/Store/Category.vue'
import { usePackStore } from '@/store/usePackStore'
import { useRoute } from 'vue-router'

const route = useRoute()

const shopCoords = (() => {
  const coords = route.query.coords

  if (!coords) return []

  // Ensure it's always an array
  const arr = Array.isArray(coords) ? coords : [coords]

  // Parse each "lat,lng" string into { lat, lng } object
  return arr
    .map(c => {
      const [lat, lng] = c.split(',').map(Number)
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
      return null
    })
    .filter(Boolean)
})()

let customerCoord = {}
const packStore = usePackStore()
const router = useRouter()
const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const isCollapsed = ref(false)

const { getLocation } = useLocationStore()

interface Location {
  name: string
  formattedAddress: string
  lat: number
  lng: number
}

// 🔹 Swapped logic
const tabButtons = ['Store', 'Cloud']
const activeTab = ref<'store' | 'cloud'>('store')

const categoryButtons = ['Men', 'Women', 'Kids', 'Newborn']
const activeCategory = ref(0)

const location = ref<Location>({
  name: '',
  formattedAddress: '',
  lat: 0,
  lng: 0,
})

onIonViewWillEnter(async () => {


  const saved = await getLocation()
  if (saved) {
    location.value = saved
    customerCoord = { lat: saved.lat, lng: saved.lng}
  }
  await packStore.loadFromStorage()
  try {
    const response = await getNearbyShop(customerCoord, shopCoords)
    console.log('Nearby shops response:', response)
    shops.value = response.data
  } catch (error) {
    console.error('Failed to fetch shops:', error)
  } finally {
    loading.value = false
  }
}) // ✅ now properly closed


const firstPack = computed(() => packStore.packList[0] || null)

function onSearch(value: string) {
  searchTerm.value = (value || '').toLowerCase().trim()
}

const headerStyle = computed(() => {
  if (isCollapsed.value) {
    return {
      backgroundColor:'#ffffff'
    }
  }
  return {
    backgroundImage: "url('design.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

// ✅ Scroll collapse
function onScroll(ev: CustomEvent) {
  const scrollTop = ev.detail.scrollTop
  isCollapsed.value = scrollTop > 0
}

// 🔹 Selected category
const selectedCategory = computed(() => categoryButtons[activeCategory.value].toLowerCase())

// 🔹 Filtering logic
const filteredShops = computed(() => {
  const q = searchTerm.value
  const categoryFilter = selectedCategory.value

  return shops.value.filter((shop) => {
    const nameMatch = (shop.name || '').toLowerCase().includes(q)

    const shopCategory = (shop.category || []).map((c: string) => c.toLowerCase())
    const shopCategories = (shop.categories || []).map((c: any) =>
      typeof c === 'string' ? c.toLowerCase() : (c?.name || '').toLowerCase()
    )

    const categoryMatch = shopCategory.includes(categoryFilter)

    const matchesSearch = q
      ? nameMatch ||
        shopCategory.some((c) => c.includes(q)) ||
        shopCategories.some((c) => c.includes(q))
      : true

    return matchesSearch && categoryMatch
  })
})

function formatStatus(status: string | null): string {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>
