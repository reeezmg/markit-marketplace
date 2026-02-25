<template>
  <ion-page>
    <ion-content class="relative shop-page" :fullscreen="true" @ionScroll="onScroll" :scrollEvents="true">
      <!-- 🔒 FIXED SEARCH BAR (STAYS ON TOP AFTER SCROLL) -->
      <div slot="fixed" class="w-full z-50 transition-all duration-300 ease-out fixed-shell" :class="showFixedSearch
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-2 pointer-events-none'">
        <div class="fixed-surface">
          <div class="fixed-search">
            <div class="fixed-topbar-host">
              <Topbar :location="location" :collapsed="true" @search="onSearch" @location-change="onLocationChange" />
            </div>
            <div class="fixed-filters transition-all duration-400 ease-out"
              :class="showFixedFilters ? 'opacity-100 translate-y-0' : 'fixed-filters--hidden opacity-0 -translate-y-2 pointer-events-none'">
              <!-- <div class="px-4 pb-3">
              <Category @select="subCategoryFilter = $event" :selectedCategory="selectedCategory" />
            </div> -->
              <div class="grid grid-cols-4 gap-2 w-full px-4 pb-3">
                <ion-button v-for="(btn, i) in categoryButtons" :key="i" size="small" expand="block" class="gender-btn"
                  :fill="activeCategory === i ? 'solid' : 'outline'" @click="activeCategory = i">
                  {{ btn }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ✅ HEADER SECTION MOVED INTO CONTENT -->
      <div ref="heroContainer" class="ion-no-border relative transition-all duration-300 ease-in-out hero-header">

        <div class="hero-overlay"></div>

        <div class="relative z-10 droplet-shell">
          <Topbar :location="location" :collapsed="isCollapsed" @search="onSearch"
            @location-change="onLocationChange" />
        </div>

        <!-- Tagline + Button -->
        <div class="transition-all duration-300 ease-out text-center will-change-transform hero-copy" :class="isCollapsed
          ? 'opacity-0 -translate-y-6 pointer-events-none'
          : 'opacity-100 translate-y-0'
          ">
          <div class="text-xl font-bold py-3 px-2 flex flex-col items-center justify-center hero-title">

            <h1 class="hero-main">
              <span class="hero-small">Try Before</span>
              <span class="hero-big">You Buy</span>
            </h1>

            <p class="hero-tagline">
              Try outfits at home. Pay only for what you keep.
            </p>

            <div class="mt-6 flex justify-center">
              <ion-button class="mt-4 hero-cta" color="primary" fill="solid" size="small" @click="openKnowMoreModal">
                Know more
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <div class="ion-padding content-wrap">
        <!-- Category Buttons -->
        <div class="transition-all duration-300"
          :class="hideGender ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100'">
          <div class="grid grid-cols-4 gap-2 w-full my-4">
            <ion-button v-for="(btn, i) in categoryButtons" :key="i" size="small" expand="block" class="gender-btn"
              :fill="activeCategory === i ? 'solid' : 'outline'" @click="activeCategory = i">
              {{ btn }}
            </ion-button>
          </div>
        </div>


        <!-- Category Filter -->
        <!-- <div class=" top-0 z-30 py-4 transition-all duration-300  category-sticky"
          :class="hideCategory ? '-translate-y-3 pointer-events-none' : ''">
          <Category @select="subCategoryFilter = $event" :selectedCategory="selectedCategory" />
        </div> -->



        <div v-if="loading" class="grid gap-4">
          <ShopCardSkeleton v-for="n in 4" :key="n" />
        </div>

        <div v-else class="mb-24 shop-list">
          <div v-for="(shop, index) in shopsList" :key="shop.id" class="shop-item"
            :style="{ animationDelay: `${Math.min(index * 70, 420)}ms` }">
            <ShopCard :shop="shop"
              @click="() => router.push({ name: 'shop', params: { companyId: shop.id, companyName: shop.name } })" />
          </div>
          <div v-if="!filteredShops.length" class="text-center py-8">
            <div class="text-gray-500 mb-4">
              “We’re not offering this service in your location at the moment.”
            </div>
            <ion-button shape="round" color="primary"
              @click="() => router.push({ name: 'account-address-add', params: { redirect: 'nearby' } })"
              class="modal-btn">
              Add New Address
            </ion-button>
          </div>
        </div>

        <!-- ✅ Floating Try & Pay Banner (Swipe + Drag) -->
        <div v-if="packStore.packList.length"
          class=" fixed bottom-[65px] left-0 right-0 bg-black text-white z-50 m-2 rounded-2xl select-none">
          <div class="flex items-center justify-center pt-3 overflow-hidden relative" @touchstart="startTouch"
            @touchend="endTouch" @mousedown="startMouseDrag" @mouseup="endMouseDrag">
            <Transition :name="`slide-${slideDirection}`" mode="out-in">
              <div v-if="activePack" :key="activePack.trynbuy_id"
                class="flex justify-between items-center w-full px-6 transition-all duration-500 ease-in-out">
                <!-- Left Column -->
                <div class="flex flex-col justify-center">
                  <div class="text-green-400 font-semibold text-sm">
                    Order #{{ activePack.order_number }} {{ formatStatus(activePack.order_status) }}
                  </div>
                  <div class="text-white text-xs">Pay after your trial</div>
                </div>

                <!-- Right Column -->
                <ion-button color="primary" fill="solid" size="small"
                  @click="() => router.push({ name: 'pack', params: { id: activePack.trynbuy_id } })">
                  Try & Pay
                </ion-button>
              </div>
            </Transition>
          </div>

          <!-- Dots -->
          <div class="flex justify-center items-center gap-1 pb-2 mt-1">
            <div v-for="(pack, i) in packStore.packList" :key="pack.trynbuy_id"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300"
              :class="i === activeIndex ? 'bg-white' : 'bg-gray-500'"></div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer>
    <KnowMoreModal :is-open="isKnowMoreModalOpen" @close="closeKnowMoreModal" />
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
import { useIonRouter } from '@ionic/vue'
import Topbar from '@/components/Index/Topbar.vue'
import ShopCard from '@/components/Index/ShopCard.vue'
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
import api from '@/api/client'
import { toastController } from '@ionic/vue'
import { alertCircleOutline } from 'ionicons/icons';




const profileStore = useProfileStore()
const isLoggedIn = computed(() => !!profileStore.profile)

const router = useIonRouter()
const packStore = usePackStore()
const nearbyStore = useNearbyStore()
const addressStore = useAddressStore()
const { setLocation } = useLocationStore()

const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const subCategoryFilter = ref('')
let filteredBySubcategoryShops: any = ref([]);
let shopsList: any = ref([]);
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
const activeCategory = ref()
const selectedCategory = computed(() => {
  if (activeCategory.value == null) return null
  return categoryButtons[activeCategory.value].toLowerCase()
})

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
      router.push({ name: 'account-address' })
      const toast = await toastController.create({
        header: 'Select Address',
        message: 'Please select an address to see nearby shops',
        icon: alertCircleOutline,
        duration: 1700,
        position: 'bottom',
        color: 'danger',
      });
      await toast.present()
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
          active: true,
        } as any

        await setLocation({
          name: location.value.name,
          formattedAddress: location.value.formattedAddress,
          lat: location.value.lat,
          lng: location.value.lng,
          active: true
        })

      } catch (e) {
        console.error('Location access denied', e)
        loading.value = false
        return
      }
    }
  }


  // 3) Fetch nearby shops (common for both)
  await loadShopsByLocation(location.value.lat, location.value.lng)
})

/* ✅ FINAL LIST WITH NEARBY FIRST */
shopsList = computed(() => {
  const list = subCategoryFilter?.value
    ? filteredBySubcategoryShops.value
    : filteredShops.value

  return [...list].sort((a, b) => {
    const aNearby = nearbyStore.isNearbyCompany(a.id) ? 1 : 0
    const bNearby = nearbyStore.isNearbyCompany(b.id) ? 1 : 0
    return bNearby - aNearby
  })
})


const loadShopsByLocation = async (lat: number, lng: number) => {
  try {
    const response = await getAllShop(lat, lng)
    shops.value = response.data
  } catch (error) {
    console.error('Failed to fetch shops:', error)
  } finally {
    loading.value = false
  }
}

const onLocationChange = async (newLocation: any) => {
  location.value = newLocation
  loading.value = true
  subCategoryFilter.value = ''
  filteredBySubcategoryShops.value = []
  await nearbyStore.$reset()
  await nearbyStore.fetchNearbyShops()
  await loadShopsByLocation(newLocation.lat, newLocation.lng)
}

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

const filteredShops = computed(() => {
  // For now , filter on FE for search, Backend api is available but not integrated yet
  const q = searchTerm.value.toLowerCase().trim()
  const genderCategory = selectedCategory.value?.toLowerCase()

  return shops.value.filter((shop) => {
    // ---- Search (FE) ----
    const name = (shop.name || '').toLowerCase()
    const matchesSearch = q ? name.includes(q) : true

    // ---- Gender Category (FE) ----
    const shopCategories = Array.isArray(shop.category)
      ? shop.category.map((c: string) => c.toLowerCase())
      : []
    console.log(genderCategory)
    const matchesGender =
      !genderCategory || genderCategory === 'all'
        ? true
        : shopCategories.includes(genderCategory)

    return matchesSearch && matchesGender
  })
})


async function fetchShopsBySubCategory() {
  const subCategory = subCategoryFilter.value
  if (!subCategory) return

  const { lat, lng } = location.value

  try {
    const res = await api.get('/shops/by-category', {
      params: {
        lat,
        lng,
        category: subCategory // 👈 casual_shirt, sports_shoes
      }
    })

    console.log('SUB CATEGORY RESULT:', res.data)
    filteredBySubcategoryShops.value = res.data
  } catch (err) {
    console.error('Failed to fetch shops by sub category', err)
  }
}

watch(subCategoryFilter, (newVal) => {
  if (!newVal) return
  fetchShopsBySubCategory()
})

shopsList = computed(() => {
  return subCategoryFilter?.value ? filteredBySubcategoryShops.value : filteredShops.value;
});

console.log(shopsList, 'filtered after subc');
// shopsList = subCategoryFilter?.value ? filteredShops : shops;

/* ---- Collapsible Header ---- */
const scrollY = ref(0)
const showFixedSearch = computed(() => scrollY.value > 80)
const showFixedFilters = computed(() => scrollY.value > 260)
const hideGender = computed(() => scrollY.value > 200)
const hideCategory = computed(() => scrollY.value > 300)

function onScroll(ev: CustomEvent) {
  scrollY.value = ev.detail.scrollTop
  isCollapsed.value = scrollY.value > 80
}
const headerStyle = computed(() => ({}))

</script>

<style scoped>
/* Page atmosphere */
.shop-page {
  --background: var(--markit-bg);
  color: var(--markit-text);
  --padding-bottom: calc(96px + var(--markit-bottom-inset));
}

.fixed-shell {
  top: 0;
  left: 0;
  right: 0;
}

.fixed-surface {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--markit-glass-surface);
  border-bottom: none;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 8px 18px rgba(20, 34, 28, 0.08);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.fixed-search {
  background: transparent;
}

.fixed-topbar-host {
  padding: 0;
}

.droplet-shell :deep(.rounded-xl) {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  box-shadow: none;
  backdrop-filter: none;
}

.fixed-filters {
  background: color-mix(in srgb, var(--markit-glass-surface) 80%, transparent);
  border-top: none;
  box-shadow: none;
  overflow: hidden;
  padding-top: 8px;
  transition: max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  max-height: 220px;
}

.fixed-filters--hidden {
  max-height: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
}

.hero-header {
  position: relative;
  z-index: 40;
  min-height: 260px;
  padding-bottom: 20px;
  overflow: hidden;

  background-image: url('/hero-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}


.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;

  background: linear-gradient(to bottom,
      rgba(0, 30, 20, 0.75),
      rgba(0, 45, 30, 0.6),
      rgba(0, 30, 20, 0.75));
}


.hero-copy {
  position: relative;
  z-index: 2;
  margin-top: 4px;
}

.hero-title {
  font-size: 1.7rem;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.hero-subtitle {
  font-size: 0.98rem;
  line-height: 1.35;
  font-weight: 600;
  color: var(--markit-text-muted);
}

.hero-cta {
  --border-radius: var(--markit-radius-lg);
  --padding-start: 24px;
  --padding-end: 24px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  --background: var(--ion-color-primary);
  --box-shadow: none;
  font-size: 0.96rem;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.hero-heading-text {
  background: linear-gradient(90deg, #2d5444, #4aa87b, #2d5444);
  background-size: 220% 220%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: hero-text-shift 10s ease-in-out infinite;
}

@keyframes hero-text-shift {
  0% {
    background-position: 0% 50%;
    letter-spacing: 0.02em;
  }

  50% {
    background-position: 100% 50%;
    letter-spacing: 0.08em;
  }

  100% {
    background-position: 0% 50%;
    letter-spacing: 0.02em;
  }
}

.content-wrap {
  position: relative;
  z-index: 1;
  padding-top: 14px;
  padding-bottom: calc(88px + var(--markit-bottom-inset));
  max-width: 980px;
  margin: 0 auto;
}

.shop-pack-banner {
  bottom: var(--markit-bottom-inset);
}

.gender-btn {
  --border-radius: var(--markit-radius-lg);
  --padding-top: 10px;
  --padding-bottom: 10px;
  --background: var(--markit-glass-surface-strong);
  --color: #2d5444;
  --border-color: var(--markit-glass-border);
  --box-shadow: none;
  font-weight: 600;
  text-transform: none;
}

.gender-btn.button-outline {
  --background: var(--markit-glass-surface-strong);
  --color: #2d5444;
  --border-color: var(--markit-glass-border);
  --box-shadow: none;
}

.gender-btn.button-solid {
  --background: var(--ion-color-primary);
  --color: #f8fffb;
  --border-color: var(--markit-border);
  --box-shadow: none;
}

.category-sticky {
  margin-top: 0;
  border-radius: var(--markit-radius-lg);
  border: none;
  background: var(--markit-glass-surface-strong);
  box-shadow: none;
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.shop-list {
  display: grid;
  gap: 14px;
}

.shop-item {
  animation: shop-rise 0.5s ease both;
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  border-radius: 20px;
}


.hero-main {
  text-align: center;
  line-height: 1.1;
  letter-spacing: -0.5px;
  text-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.hero-small {
  display: block;
  font-size: 28px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.hero-big {
  display: block;
  font-size: 40px;
  font-weight: 800;
  margin-top: 4px;
  color: #ffffff;
}

.hero-tagline {
  margin-top: 14px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.75);
  text-align: center;
}

@media (min-width: 768px) {
  .hero-small {
    font-size: 34px;
  }

  .hero-big {
    font-size: 52px;
  }
}

@keyframes shop-rise {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .shop-item {
    animation: none;
    background: var(--markit-glass-surface);
    backdrop-filter: blur(20px) saturate(145%);
    -webkit-backdrop-filter: blur(20px) saturate(145%);
  }
}

@media (min-width: 900px) {
  .content-wrap {
    padding-left: 12px;
    padding-right: 12px;
  }

  .shop-list {
    gap: 18px;
  }
}

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

/* Ultra smooth scroll + header animation */
.will-change-transform {
  will-change: transform, opacity;
}
</style>
