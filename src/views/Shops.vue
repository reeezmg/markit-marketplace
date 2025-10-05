<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="bg-white ion-no-border">
<div 
  class="ion-no-border relative rounded-b-3xl transition-all duration-300 ease-in-out"
  :style="headerStyle">
  <div class="ion-padding">
    <Topbar :location="location" :collapsed="isCollapsed" @search="onSearch" />
  </div>

  <!-- Tagline + Button -->
  <div
    v-if="!isCollapsed"
    class="transition-opacity duration-300"
  >
  <div class="text-xl text-[#097D4C] font-bold py-3 px-2 flex flex-col items-center justify-center">
    <div class="bg-[#F4FBE3] w-fit">Choose • Try • Buy</div>
    <div class="bg-[#F4FBE3] w-fit">Make your home trial room</div>

    <button
      class="my-2 bg-[#097D4C] text-lg text-white px-6! py-2! rounded-lg! font-medium!"
      @click="() => router.push('/knowmore')"
    >
      Know more
    </button>
    </div>
     
    <div class="grid grid-cols-4 border-t border-gray-200">
    <button
      v-for="(btn, i) in categoryButtons"
      :key="i"
      @click="activeCategory = i"
      class="flex flex-col items-center py-2"
    >
      <span
        class="text-lg font-bold mt-1 bg-[#F4FBE3]"
        :class="activeCategory === i ? 'text-[#097D4C]' : 'text-gray-400'"
      >
        {{ btn }}
      </span>
      <div
        class="w-full mt-1 transition-all duration-300"
        :class="activeCategory === i ? 'border-b-[4px] border-[#097D4C]' : 'border-b-[4px] border-transparent'"
      ></div>
    </button>

    </div>
    
  </div>
  
  </div>
      <!-- Sticky Category -->
      <div class="my-3 sticky top-0 z-50 bg-white">
        <Category class="" @select="searchTerm = $event" />
      </div>

</ion-header>


    <!-- Content -->
    <ion-content
      class="ion-padding"
      :fullscreen="true"
      @ionScroll="onScroll"
      scrollEvents="true"
    >

      <Heading title="Explore Shops" />

      <!-- Loading Skeletons -->
      <div v-if="loading" class="grid gap-4">
        <div
          v-for="n in 5"
          :key="n"
          class="flex flex-col space-y-4 p-3 border border-gray-300 rounded-lg animate-pulse"
        >
          <div class="w-full h-52 rounded-xl bg-gray-300"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-3/4"></div>
            <div class="h-3 bg-gray-300 rounded w-full"></div>
            <div class="h-3 bg-gray-300 rounded w-5/6"></div>
            <div class="h-3 bg-gray-300 rounded w-1/3"></div>
          </div>
        </div>
      </div>

      <!-- Shops List -->
      <div v-else>
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
    </ion-content>

    <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonFooter, IonHeader, IonContent, onIonViewWillEnter } from '@ionic/vue'
import Topbar from '@/components/Index/Topbar.vue'
import Shopcard from '@/components/Index/Shopcard.vue'
import Heading from '@/components/Heading.vue'
import { getAllShop } from '@/api/api'
import { ref, computed } from 'vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter } from 'vue-router'
import TabsPage from './TabsPage.vue'
import Category from '@/components/Store/Category.vue'

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
  }
  try {
    const response = await getAllShop(location.value.lat, location.value.lng)
    shops.value = response.data
  } catch (error) {
    console.error('Failed to fetch shops:', error)
  } finally {
    loading.value = false
  }
})

function onSearch(value: string) {
  searchTerm.value = (value || '').toLowerCase().trim()
}

const headerStyle = computed(() => {
  if (isCollapsed.value) {
    return {
      backgroundColor:'#ffffff'
    } // no background when collapsed
  }
  return {
    backgroundImage: "url('design.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})


function onScroll(ev: CustomEvent) {
  const scrollTop = ev.detail.scrollTop
  isCollapsed.value = scrollTop > 80 // collapse header after 50px scroll
}


// ----------------------------
// 🔹 Category filter (shop.category[])
// ----------------------------
const categoryButtons = ['Men', 'Women', 'Kids', 'Newborn']
const activeCategory = ref(0)
const selectedCategory = computed(() => categoryButtons[activeCategory.value].toLowerCase())

// ----------------------------
// 🔹 Filtering logic (separate category & categories)
// ----------------------------
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
</script>
