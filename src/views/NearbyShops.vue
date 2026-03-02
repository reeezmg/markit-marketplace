<template>
  <ion-page>
    <ion-content class="ion-padding relative nearby-content" :fullscreen="true" @ionScroll="onScroll"
      scrollEvents="true">
      <div slot="fixed" class="w-full z-50 transition-all duration-300 ease-out fixed-shell"
        :class="showFixedSearch ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'">
        <div class="fixed-surface">
          <div class="fixed-search">
            <div class="fixed-topbar-host">
              <Topbar :location="location" :collapsed="true" @search="onSearch" />
            </div>
            <div class="fixed-filters transition-all duration-400 ease-out"
              :class="showFixedFilters ? 'opacity-100 translate-y-0' : 'fixed-filters--hidden opacity-0 -translate-y-2 pointer-events-none'">
              <!-- <div class="px-4 pb-3">
                <Category @select="searchTerm = $event" :selectedCategory="selectedCategory" />
              </div> -->
              <div class="nearby-gender-wrap grid grid-cols-4 gap-2 w-full px-4 pb-3">
                <ion-button v-for="(btn, i) in categoryButtons" :key="`fixed-${i}`" size="small" expand="block"
                  class="gender-btn" :fill="activeCategory === i ? 'solid' : 'outline'" @click="activeCategory = i">
                  {{ btn }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ion-no-border relative transition-all duration-300 ease-in-out hero-header">
        <div class="hero-overlay"></div>

        <div class="relative z-10 droplet-shell">
          <Topbar :location="location" :collapsed="isCollapsed" @search="onSearch" />
        </div>

        <div class="transition-all duration-300 ease-out text-center will-change-transform hero-copy"
          :class="isCollapsed ? 'opacity-0 -translate-y-6 pointer-events-none' : 'opacity-100 translate-y-0'">
          <div class="text-xl font-bold py-3 px-2 flex flex-col items-center justify-center hero-title">
            <h1 class="hero-main">
              <span class="hero-small">Try Before</span>
              <span class="hero-big">You Buy</span>
            </h1>

            <p class="hero-tagline">
              Try outfits at home. Pay only for what you keep.
            </p>

            <div class="mt-6 flex justify-center">
              <ion-button class="mt-4 hero-cta" color="primary" fill="solid" size="small"
                @click="() => router.push({ name: 'know-more' })">
                Know more
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <div class="ion-padding content-wrap">
        <div class="nearby-gender-wrap grid grid-cols-4 gap-2 w-full transition-all duration-300"
          :class="hideGender ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100'">
          <ion-button v-for="(btn, i) in categoryButtons" :key="i" size="small" expand="block" class="gender-btn"
            :fill="activeCategory === i ? 'solid' : 'outline'" @click="activeCategory = i">
            {{ btn }}
          </ion-button>
        </div>

        <!-- <div class="nearby-category-wrap transition-all duration-300"
          :class="hideCategory ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100'">
          <Category @select="searchTerm = $event" :selectedCategory="selectedCategory" />
        </div> -->

        <div v-if="loading" class="grid gap-4"></div>

        <div v-else class="nearby-shop-list">
          <ShopCard v-for="shop in filteredShops" :key="shop.id" :shop="shop"
            @click="() => router.push({ name: 'shop', params: { companyId: shop.id, companyName: shop.name } })" />
          <div v-if="!filteredShops.length" class="text-center py-8">
            <div class="text-gray-500 mb-4">
              “No store's at this location”
            </div>
          </div>
        </div>
      </div>

      <div v-if="packStore.packList.length"
        class="nearby-pack-slider fixed left-0 right-0 bottom-16 z-50 overflow-x-auto no-scrollbar px-4">
        <div class="flex gap-4 pb-3 transition-all duration-300 ease-in-out" :class="{
          'justify-center': packStore.packList.length === 1,
          'w-full': packStore.packList.length === 1,
          'w-max': packStore.packList.length > 1
        }">
          <div v-for="(pack, i) in packStore.packList" :key="pack.trynbuy_id"
            class="flex-shrink-0 bg-black text-white rounded-xl py-3 px-4 shadow-lg flex justify-between items-center"
            :class="packStore.packList.length === 1 ? 'w-full' : 'w-[90%]'">
            <div>
              <div class="text-green-400 font-bold">
                Order #{{ pack.order_number }} {{ formatStatus(pack.order_status) }}
              </div>
              <div class="text-gray-400 text-sm">Pay after your trial</div>
            </div>
            <ion-button color="success" size="small" fill="solid" expand="block"
              @click="() => router.push({ name: 'pack', params: { id: pack.trynbuy_id } })">
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
import { IonPage, IonFooter, IonButton, IonContent, onIonViewWillEnter } from '@ionic/vue'
import Topbar from '@/components/Index/Topbar.vue'
import ShopCard from '@/components/Index/ShopCard.vue'
import { getNearbyShop } from '@/api/api'
import { ref, computed } from 'vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { useIonRouter } from '@ionic/vue'
import TabsPage from './TabsPage.vue'
import Category from '@/components/Store/Category.vue'
import { usePackStore } from '@/store/usePackStore'
import { useRoute } from 'vue-router'
const route = useRoute()

const shopCoords = (() => {
  const coords = route.query.coords

  if (!coords) return []

  const arr = Array.isArray(coords) ? coords : [coords]

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
const router = useIonRouter()
const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const isCollapsed = ref(false)
const scrollY = ref(0)

const { getLocation } = useLocationStore()

interface Location {
  name: string
  formattedAddress: string
  lat: number
  lng: number
}

const tabButtons = ['Store', 'Cloud']
const activeTab = ref<'store' | 'cloud'>('store')

const categoryButtons = ['Men', 'Women', 'Girls', 'Boys']
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
    customerCoord = { lat: saved.lat, lng: saved.lng }
  }
  await packStore.loadFromStorage()
  try {
    const response = await getNearbyShop(customerCoord, shopCoords)
    shops.value = response.data
  } catch (error) {
    console.error('Failed to fetch shops:', error)
  } finally {
    loading.value = false
  }
})

const firstPack = computed(() => packStore.packList[0] || null)

function onSearch(value: string) {
  searchTerm.value = (value || '').toLowerCase().trim()
}

const showFixedSearch = computed(() => scrollY.value > 80)
const showFixedFilters = computed(() => scrollY.value > 260)
const hideGender = computed(() => scrollY.value > 200)
const hideCategory = computed(() => scrollY.value > 300)

function onScroll(ev: CustomEvent) {
  const scrollTop = ev.detail.scrollTop
  scrollY.value = scrollTop
  isCollapsed.value = scrollTop > 80
}

const selectedCategory = computed(() => categoryButtons[activeCategory.value].toLowerCase())

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

<style scoped>
.nearby-hero {
  min-height: 188px;
  border-bottom: 1px solid var(--markit-border);
  background-position: center;
  background-size: cover;
  overflow: hidden;
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

.droplet-shell :deep(.rounded-xl) {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  box-shadow: none;
  backdrop-filter: none;
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

.hero-cta {
  --border-radius: var(--markit-btn-radius);
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

.content-wrap {
  position: relative;
  z-index: 1;
  padding-top: 6px;
  padding-bottom: calc(88px + var(--markit-bottom-inset));
  max-width: 980px;
  margin: 0 auto;
}

.nearby-gender-wrap {
  margin: 0 0 14px;
}

.nearby-gender-wrap :deep(.gender-btn) {
  --border-radius: var(--markit-btn-radius);
  --padding-top: 10px;
  --padding-bottom: 10px;
  --background: var(--markit-glass-surface-strong);
  --color: #2d5444;
  --border-color: var(--markit-glass-border);
  --box-shadow: none;
  font-weight: 600;
  text-transform: none;
}

.nearby-gender-wrap :deep(.gender-btn.button-outline) {
  --background: var(--markit-glass-surface-strong);
  --color: #2d5444;
  --border-color: var(--markit-glass-border);
  --box-shadow: none;
}

.nearby-gender-wrap :deep(.gender-btn.button-solid) {
  --background: var(--ion-color-primary);
  --color: #f8fffb;
  --border-color: var(--markit-border);
  --box-shadow: none;
}

.nearby-category-wrap {
  margin: 0 0 14px;
  padding: 10px 0 6px;
  border-radius: var(--markit-radius-lg);
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
}

.nearby-content {
  --background: var(--markit-bg);
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: calc(18px + var(--markit-bottom-inset));
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
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
}

.fixed-search {
  background: transparent;
}

.fixed-topbar-host {
  padding: 0;
}

.fixed-filters {
  background: color-mix(in srgb, var(--markit-glass-surface) 80%, transparent);
  box-shadow: none;
  overflow: hidden;
  padding-top: 6px;
  transition: max-height 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  max-height: 220px;
}

.fixed-filters--hidden {
  max-height: 0;
  overflow: hidden;
  padding-top: 0;
  padding-bottom: 0;
}

.nearby-shop-list {
  display: grid;
  gap: 14px;
  padding: 0;
}

.nearby-pack-slider {
  padding-left: 12px;
  padding-right: 12px;
  bottom: var(--markit-bottom-inset);
}

@media (max-width: 390px) {
  .nearby-gender-wrap {
    gap: 6px;
  }
}

@media (min-width: 768px) {
  .hero-small {
    font-size: 34px;
  }

  .hero-big {
    font-size: 52px;
  }
}
</style>
