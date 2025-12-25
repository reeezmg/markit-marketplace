<template>
  <ion-page>
    <ion-content
      class="relative"
      :fullscreen="true"
      @ionScroll="onScroll"
      scrollEvents="true"
    >
      <!-- ✅ HEADER SECTION MOVED INTO CONTENT -->
      <div
        class="ion-no-border relative rounded-b-3xl transition-all duration-300 ease-in-out"
        :style="headerStyle"
      >
        <div class="ion-padding">
          <Topbar :location="location" @search="onSearch" />
        </div>

        <!-- Tagline + Button -->
        <div v-if="!isCollapsed" class="transition-opacity duration-300 text-center">
          <div class="text-xl text-[#53816C] font-bold py-3 px-2 flex flex-col items-center justify-center">
            <div class="w-fit px-2 rounded-md">Choose • Try • Buy</div>
            <div class="w-fit px-2 rounded-md mt-1">Make your home trial room</div>

            <ion-button
              class="mt-3"
              color="primary"
              fill="solid"
              size="small"
              shape="round"
              @click="openKnowMoreModal"
            >
              Know more
            </ion-button>
          </div>
        </div>
      </div>
      <div class="ion-padding ">
      <!-- Category Buttons -->
      <div class="grid grid-cols-4 gap-2 w-full my-4">
        <ion-button
          v-for="(btn, i) in categoryButtons"
          :key="i"
          size="small"
          expand="block"
          :color="activeCategory === i ? 'primary' : 'primary'"
          :fill="activeCategory === i ? 'solid' : 'outline'"
          @click="activeCategory = i"
        >
          {{ btn }}
        </ion-button>
      </div>

      <!-- Category Filter -->
      <div class="sticky top-0 z-30 bg-white py-4">
        <Category @select="searchTerm = $event" :selectedCategory="selectedCategory" />
      </div>

      <!-- Shops Section -->
      <Heading title="Explore Shops" />

      <div v-if="loading" class="grid gap-4">
       <ShopCardSkeleton v-for="n in 4" :key="n" />
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

      <!-- ✅ Floating Try & Pay Banner (Swipe + Drag) -->
      <div
        v-if="packStore.packList.length"
        class="fixed bottom-[70px] left-0 right-0 bg-black text-white z-50 m-2 rounded-2xl select-none"
      >
        <div
          class="flex items-center justify-center pt-3 overflow-hidden relative"
          @touchstart="startTouch"
          @touchend="endTouch"
          @mousedown="startMouseDrag"
          @mouseup="endMouseDrag"
        >
          <Transition :name="`slide-${slideDirection}`" mode="out-in">
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
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer>
    <KnowMoreModal
      :is-open="isKnowMoreModalOpen"
      @close="closeKnowMoreModal"/>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonFooter,
  IonButton,
  IonContent,
  onIonViewWillEnter,
} from '@ionic/vue'
import { ref, computed, watch } from 'vue'
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
import { useAddressStore } from '@/store/useAddressStore';
import { modalController } from '@ionic/vue'
import KnowMoreModal from '../components/KnowMore.vue'
import ShopCardSkeleton from '@/components/Index/ShopCardSkeleton.vue'
import { useProfileStore } from '@/store/useProfileStore'


const profileStore = useProfileStore()
const isLoggedIn = computed(() => !!profileStore.profile)

const router = useRouter()
const packStore = usePackStore()
const nearbyStore = useNearbyStore()
const addressStore = useAddressStore()

const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const isCollapsed = ref(false)
const isKnowMoreModalOpen = ref(false)

const activeIndex = ref(0)
const activePack = computed(() => packStore.packList[activeIndex.value] || null)
watch(
  () => packStore.packList,
  (newList) => {
    console.log('Pack list updated:', newList)
  }
)
const slideDirection = ref<'left' | 'right'>('left')
const openKnowMoreModal = () => {
  isKnowMoreModalOpen.value = true
}
const closeKnowMoreModal = () => {
  isKnowMoreModalOpen.value = false
}

/* ---- Swipe + Mouse Drag Support ---- */
let startX = 0
let isDragging = false

function startTouch(e: TouchEvent) {
  startX = e.changedTouches[0].screenX
}
function endTouch(e: TouchEvent) {
  const diff = e.changedTouches[0].screenX - startX
  handleSwipe(diff)
}
function startMouseDrag(e: MouseEvent) {
  isDragging = true
  startX = e.clientX
}
function endMouseDrag(e: MouseEvent) {
  if (!isDragging) return
  isDragging = false
  const diff = e.clientX - startX
  handleSwipe(diff)
}
function handleSwipe(diff: number) {
  if (diff > 60) prevPack()
  else if (diff < -60) nextPack()
}

/* ---- Pack Navigation ---- */
function nextPack() {
  if (packStore.packList.length === 0) return
  slideDirection.value = 'left'
  activeIndex.value = (activeIndex.value + 1) % packStore.packList.length
}
function prevPack() {
  if (packStore.packList.length === 0) return
  slideDirection.value = 'right'
  activeIndex.value = (activeIndex.value - 1 + packStore.packList.length) % packStore.packList.length
}

/* ---- Helpers ---- */
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

const categoryButtons = ['Men', 'Women', 'Girls', 'Boys']
const activeCategory = ref(0)
const selectedCategory = computed(() => categoryButtons[activeCategory.value].toLowerCase())

onIonViewWillEnter(async () => {
  await packStore.loadFromStorage()

  // 1️⃣ Logged-in user → use saved address
  if (isLoggedIn.value) {
    if (addressStore.addresses.length === 0) {
      await addressStore.fetchFromApi()
    }

    const saved = await getLocation()

    if (saved) {
      location.value = saved
    } else {
      router.push('/account/address')
      return
    }
  }

// 2️⃣ Logged-out user → GPS fallback
else {
  const cached = await getLocation()

  if (cached) {
    location.value = cached
  } else {
    try {
      const gps = await getCurrentLocation()

      location.value = {
        name: 'Current Location',
        formattedAddress: 'Near you',
        lat: gps.lat,
        lng: gps.lng,
      } as any

      console.log(location.value, 'lll')

      await setLocation(location.value) // ✅ SAME INSTANCE
    } catch (e) {
      console.error('Location access denied', e)
      loading.value = false
      return
    }
  }
}


  // 3️⃣ Fetch nearby shops (common for both)
  try {
  console.log(location.value, 'ccc') // ✅ WILL PRINT NOW

  const { lat, lng } = location.value
  const response = await getAllShop(lat, lng)

  shops.value = response.data
} catch (error) {
  console.error('Failed to fetch shops:', error)
} finally {
  loading.value = false
}
}) // ✅ now properly closed

const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported')
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  })
}

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
  isCollapsed.value = scrollTop > 50
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
/* ✅ Slide Transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

/* Slide Left (Next) */
.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide Right (Previous) */
.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
