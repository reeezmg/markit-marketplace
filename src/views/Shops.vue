<template>
  <ion-page>
    <!-- Header -->
    <ion-header class="bg-white ion-no-border">
      <div
        class="ion-no-border relative rounded-b-3xl transition-all duration-300 ease-in-out"
        :style="headerStyle"
      >
        <div class="ion-padding">
          <Topbar :location="location" @search="onSearch" />
        </div>

        <!-- Tagline + Button -->
        <div v-if="!isCollapsed" class="transition-opacity duration-300 text-center">
          <div class="text-xl text-[#097D4C] font-bold py-3 px-2 flex flex-col items-center justify-center">
            <div class="bg-[#F4FBE3] w-fit px-2 rounded-md">Choose • Try • Buy</div>
            <div class="bg-[#F4FBE3] w-fit px-2 rounded-md mt-1">Make your home trial room</div>

            <ion-button
              class="mt-3"
              color="primary"
              fill="solid"
              size="small"
              shape="round"
              @click="() => router.push('/knowmore')"
            >
              Know more
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Category Buttons -->
      <div class="grid grid-cols-4 gap-2 w-full px-3 my-5">
        <ion-button
          v-for="(btn, i) in categoryButtons"
          :key="i"
          size="small"
          expand="block"
          :color="activeCategory === i ? 'primary' : 'medium'"
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

    <!-- Content -->
    <ion-content
      class="ion-padding relative"
      :fullscreen="true"
      @ionScroll="onScroll"
      scrollEvents="true"
    >
      <Heading title="Explore Shops" />

      <div v-if="loading" class="grid gap-4">
        <!-- Skeletons -->
      </div>

      <div v-else class="mb-24">
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

      <!-- ✅ Floating Try & Pay Banner (Manual Swipe Only) -->
      <div
        v-if="packStore.packList.length"
        class="fixed bottom-[70px] left-0 right-0 bg-black text-white z-50 m-2 rounded-2xl"
      >
        <div
          class="flex items-center justify-center pt-3 overflow-hidden relative"
          @touchstart="startTouch"
          @touchend="endTouch"
        >
          <Transition name="slide-fade" mode="out-in">
            <div
              v-if="activePack"
              :key="activePack.trynbuy_id"
              class="flex justify-between items-center w-full px-6 transition-all duration-500 ease-in-out"
            >
              <!-- Left Column -->
              <div class="flex flex-col justify-center">
                <div class="text-green-400 font-semibold text-sm">
                  Order #{{ activePack.order_number }} {{ formatStatus(activePack.order_status) }}
                </div>
                <div class="text-gray-400 text-xs">Pay after your trial</div>
              </div>

              <!-- Right Column -->
              <ion-button
                color="success"
                size="small"
                fill="solid"
                shape="round"
                @click="() => router.push(`/pack/${activePack.trynbuy_id}`)"
              >
                Try & Pay
              </ion-button>
            </div>
          </Transition>
        </div>

        <!-- Dots -->
        <div class="flex justify-center items-center gap-1 pb-2 mt-1">
          <div
            v-for="(pack, i) in packStore.packList"
            :key="pack.trynbuy_id"
            class="w-1.5 h-1.5 rounded-full transition-all duration-300"
            :class="i === activeIndex ? 'bg-white' : 'bg-gray-500'"
          ></div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonFooter,
  IonButton,
  IonHeader,
  IonContent,
  onIonViewWillEnter,
} from '@ionic/vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import Topbar from '@/components/Index/Topbar.vue'
import Shopcard from '@/components/Index/Shopcard.vue'
import Heading from '@/components/Heading.vue'
import Category from '@/components/Store/Category.vue'
import TabsPage from './TabsPage.vue'
import { usePackStore } from '@/store/usePackStore'
import { useLocationStore } from '@/composables/useLocationStore'
import { useNearbyStore } from '@/store/useNearbyStore'
import { getAllShop } from '@/api/api'

const router = useRouter()
const packStore = usePackStore()
const nearbyStore = useNearbyStore()

const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const isCollapsed = ref(false)

const activeIndex = ref(0)
const activePack = computed(() => packStore.packList[activeIndex.value] || null)

/* ✅ Removed auto-slide — manual swipe only */
function nextPack() {
  if (packStore.packList.length === 0) return
  activeIndex.value = (activeIndex.value + 1) % packStore.packList.length
}
function prevPack() {
  if (packStore.packList.length === 0) return
  activeIndex.value = (activeIndex.value - 1 + packStore.packList.length) % packStore.packList.length
}

/* ---- Swipe gestures ---- */
let touchStartX = 0
function startTouch(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX
}
function endTouch(e: TouchEvent) {
  const diff = e.changedTouches[0].screenX - touchStartX
  if (diff > 60) prevPack()
  else if (diff < -60) nextPack()
}

function formatStatus(status: string | null): string {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/* ---- Location + Categories ---- */
const { getLocation } = useLocationStore()
const location = ref({ name: '', formattedAddress: '', lat: 0, lng: 0 })

const categoryButtons = ['Men', 'Women', 'Kids', 'Newborn']
const activeCategory = ref(0)
const selectedCategory = computed(() => categoryButtons[activeCategory.value].toLowerCase())

onIonViewWillEnter(async () => {
  await packStore.loadFromStorage()
  const saved = await getLocation()
  if (saved) location.value = saved

  await nearbyStore.fetchNearbyShops()
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

/* ---- Filtering ---- */
const filteredShops = computed(() => {
  const q = searchTerm.value
  const categoryFilter = selectedCategory.value

  return shops.value.filter((shop) => {
    const nameMatch = (shop.name || '').toLowerCase().includes(q)
    const shopCategory = (shop.category || []).map((c: string) => c.toLowerCase())
    const categoryMatch = shopCategory.includes(categoryFilter)

    const matchesSearch = q
      ? nameMatch || shopCategory.some((c) => c.includes(q))
      : true

    return matchesSearch && categoryMatch
  })
})

/* ---- Collapsible Header ---- */
function onScroll(ev: CustomEvent) {
  const scrollTop = ev.detail.scrollTop
  isCollapsed.value = scrollTop > 0
}

const headerStyle = computed(() => {
  if (isCollapsed.value) return { backgroundColor: '#ffffff' }
  return {
    backgroundImage: "url('design.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
