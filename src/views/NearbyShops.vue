<template>
  <ion-page>
    <ion-content class="relative shop-page" :fullscreen="true" @ionScroll="onScroll" :scrollEvents="true">
      <div slot="fixed" class="w-full z-50 transition-all duration-300 ease-out fixed-shell" :class="showFixedSearch
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-2 pointer-events-none'">
        <div class="fixed-surface">
          <div class="fixed-search">
            <div class="fixed-topbar-host">
              <Topbar :location="location" :collapsed="true" :show-address-selector="false" @search="onSearch"
                @location-change="onLocationChange" />
            </div>
            <div class="fixed-filters transition-all duration-400 ease-out"
              :class="showFixedFilters ? 'opacity-100 translate-y-0' : 'fixed-filters--hidden opacity-0 -translate-y-2 pointer-events-none'">
              <div class="px-4 pb-3">
                <Category @select="subCategoryFilter = $event" :selectedCategory="selectedCategory || ''" />
              </div>
              <div class="grid grid-cols-4 gap-2 w-full px-4 pb-3">
                <ion-button v-for="(btn, i) in categoryButtons" :key="`fixed-${i}`" size="small" expand="block"
                  class="gender-btn" :fill="activeCategory === i ? 'solid' : 'outline'" @click="toggleCategory(i)">
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
          <Topbar :location="location" :collapsed="isCollapsed" :show-address-selector="false" @search="onSearch"
            @location-change="onLocationChange" />
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
        <div class="transition-all duration-300"
          :class="hideGender ? 'opacity-0 -translate-y-3 pointer-events-none' : 'opacity-100'">
          <div class="grid grid-cols-4 gap-2 w-full my-4">
            <ion-button v-for="(btn, i) in categoryButtons" :key="i" size="small" expand="block" class="gender-btn"
              :fill="activeCategory === i ? 'solid' : 'outline'" @click="toggleCategory(i)">
              {{ btn }}
            </ion-button>
          </div>
        </div>

        <div class="top-0 z-30 py-4 transition-all duration-300 category-sticky"
          :class="hideCategory ? '-translate-y-3 pointer-events-none' : ''">
          <Category @select="subCategoryFilter = $event" :selectedCategory="selectedCategory || ''" />
        </div>

        <div v-if="loading" class="grid gap-4">
          <ShopCardSkeleton v-for="n in 4" :key="n" />
        </div>

        <div v-else-if="subCategoryFilter" class="subcat-store-list">
          <div v-if="subcategoryLoading" class="subcat-loading text-center py-8">
            <ion-spinner name="crescent" color="primary" />
            <div class="text-gray-500 mt-2">Loading products...</div>
          </div>
          <div v-else-if="subcategoryShopGroups.length" class="grid gap-4">
            <div v-for="(shop, index) in subcategoryShopGroups" :key="`${shop.id}-${index}`" class="subcat-store-card">
              <div class="subcat-store-header"
                @click="() => router.push({ name: 'shop', params: { companyId: shop.id, companyName: shop.name } })">
                <div>
                  <div class="subcat-store-name">{{ formatShopName(shop.name) }}</div>
                  <p class="subcat-store-meta">
                    {{ shop.products.length }} products in this subcategory
                  </p>
                </div>
                <ion-button size="small" fill="outline">Open</ion-button>
              </div>

              <div class="subcat-product-scroll" ref="scrollContainerRef" @wheel.passive @touchmove.passive>
                <div class="subcat-product-track" :style="{ width: trackWidth + 'px' }">
                  <button v-for="product in shop.products" :key="product.id" class="subcat-product-tile" type="button"
                    @click="() => router.push({ name: 'product', params: { variantId: product.id } })">
                    <div class="subcat-product-image-wrap">
                      <img v-if="product.images?.length" :src="imageUrl(product.images[0])"
                        :alt="formatLabel(product.productName || product.name)" class="subcat-product-image" />
                    </div>
                    <div class="subcat-product-name">{{ formatLabel(product.productName || product.name) }}</div>
                    <div class="subcat-product-brand">{{ formatLabel(product.brandName) }}</div>
                    <div class="subcat-product-price">
                      <template v-if="product.discount > 0 && product.dprice">
                        <span class="subcat-product-price-discount">{{ formatPrice(product.dprice) }}</span>
                        <span class="subcat-product-price-strike">{{ formatPrice(product.sprice) }}</span>
                      </template>
                      <template v-else>
                        <span class="subcat-product-price-discount">{{ formatPrice(product.sprice) }}</span>
                      </template>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div class="text-gray-500 mb-4">No products found for this subcategory</div>
          </div>
        </div>

        <div v-else class="shop-list">
          <div v-for="(shop, index) in shopsList" :key="shop.id" class="shop-item"
            :style="{ animationDelay: `${Math.min(index * 70, 420)}ms` }">
            <ShopCard :shop="{ ...shop, name: formatShopName(shop.name) }"
              @click="() => router.push({ name: 'shop', params: { companyId: shop.id, companyName: shop.name } })" />
          </div>
          <div v-if="!filteredShops.length" class="text-center py-8">
            <div class="text-gray-500 mb-4">
              No stores match this route yet.
            </div>
            <ion-button shape="round" color="primary"
              @click="() => router.push({ name: 'account-address-add', params: { redirect: 'nearby' } })"
              class="modal-btn">
              Change Address
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
import {
  IonPage,
  IonFooter,
  IonButton,
  IonContent,
  IonSpinner,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useIonRouter } from '@ionic/vue'
import Topbar from '@/components/Index/Topbar.vue'
import ShopCard from '@/components/Index/ShopCard.vue'
import ShopCardSkeleton from '@/components/Index/ShopCardSkeleton.vue'
import TabsPage from './TabsPage.vue'
import Category from '@/components/Store/Category.vue'
import { categories as allSubCategories } from '@/components/Store/utils/category'
import { getNearbyShop } from '@/api/api'
import api from '@/api/client'
import { useLocationStore } from '@/composables/useLocationStore'
import { useNearbyStore } from '@/store/useNearbyStore'
import { getDeviceLocation } from '@/utils/geolocation'

type ShopCoord = {
  lat: number
  lng: number
}

type LocationState = {
  name: string
  formattedAddress: string
  lat: number
  lng: number
  houseDetails?: string
  id?: string
  active?: boolean
}

type SubcategoryProduct = {
  id: string
  name?: string
  productName?: string
  brandName?: string
  images?: string[]
  sprice?: number
  dprice?: number
  discount?: number
}

type SubcategoryShopGroup = {
  id: string
  name: string
  products: SubcategoryProduct[]
}

const route = useRoute()
const router = useIonRouter()
const nearbyStore = useNearbyStore()
const { getLocation, setLocation } = useLocationStore()

const shops = ref<any[]>([])
const loading = ref(true)
const searchTerm = ref('')
const subCategoryFilter = ref('')
const filteredBySubcategoryShops = ref<any[]>([])
const subcategoryShopGroups = ref<SubcategoryShopGroup[]>([])
const subcategoryLoading = ref(false)
const isCollapsed = ref(false)
const scrollY = ref(0)
const hideCategory = ref(false)
const scrollContainerRef = ref<HTMLElement | null>(null)
const trackWidth = ref(0)
let subcategoryRequestSeq = 0
let scrollRaf: number | null = null
let latestScrollTop = 0

const categoryButtons = ['Men', 'Women', 'Girls', 'Boys']
const activeCategory = ref<number | null>(null)

const location = ref<LocationState>({
  name: '',
  formattedAddress: '',
  lat: 0,
  lng: 0,
})

const showFixedSearch = computed(() => scrollY.value > 80)
const showFixedFilters = computed(() => scrollY.value > 260)
const hideGender = computed(() => scrollY.value > 200)
const selectedCategory = computed(() => {
  if (activeCategory.value == null) return null
  return categoryButtons[activeCategory.value].toLowerCase()
})
const selectedSubCategoryLabel = computed(() => {
  const value = subCategoryFilter.value
  if (!value) return ''
  return allSubCategories.find((c: any) => c.value === value)?.label || value
})
const shopsList = computed(() => {
  const list = subCategoryFilter.value ? filteredBySubcategoryShops.value : filteredShops.value
  return [...list].sort((a, b) => {
    const aNearby = nearbyStore.isNearbyCompany(a.id) ? 1 : 0
    const bNearby = nearbyStore.isNearbyCompany(b.id) ? 1 : 0
    return bNearby - aNearby
  })
})

const parseShopCoords = (): ShopCoord[] => {
  const coords = route.query.coords
  if (!coords) return []

  const values = Array.isArray(coords) ? coords : [coords]
  return values
    .map((value) => {
      const [lat, lng] = String(value).split(',').map(Number)
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null
      return { lat, lng }
    })
    .filter(Boolean) as ShopCoord[]
}

const routeShopIds = computed(() => new Set(shops.value.map((shop: any) => String(shop.id))))

const updateTrackWidth = (productsCount: number) => {
  const tileWidth = 132
  const gap = 10
  trackWidth.value = productsCount > 0 ? (productsCount * tileWidth) + ((productsCount - 1) * gap) : 0
}

const formatShopName = (value?: string | null) => {
  if (!value) return ''
  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
        .join('-')
    )
    .join(' ')
}

const formatPrice = (price?: number) => {
  if (price == null) return ''
  return `Rs.${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatLabel = (value?: string | null) => {
  if (!value) return ''
  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join('-')
    )
    .join(' ')
}

const imageUrl = (imgPath?: string) => {
  if (!imgPath) return ''
  return imgPath.startsWith('http') ? imgPath : `https://images.markit.co.in/${imgPath}`
}

const normalizeToken = (value?: string | null) => {
  if (!value) return ''
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
}

const hasShopImage = (shop: any) => {
  return !!String(shop?.logo || '').trim()
}

const filteredShops = computed(() => {
  const q = searchTerm.value.toLowerCase().trim()
  const genderCategory = selectedCategory.value?.toLowerCase()

  return shops.value.filter((shop) => {
    if (!hasShopImage(shop)) return false

    const name = (shop.name || '').toLowerCase()
    const shopCategories = Array.isArray(shop.category)
      ? shop.category.map((c: string) => c.toLowerCase())
      : []

    const matchesSearch = q ? name.includes(q) : true
    const matchesGender = !genderCategory || genderCategory === 'all'
      ? true
      : shopCategories.includes(genderCategory)

    return matchesSearch && matchesGender
  })
})

const toProduct = (raw: any): SubcategoryProduct | null => {
  const id = raw?.id || raw?.variantId || raw?.variant_id
  if (!id) return null
  return {
    id: String(id),
    name: raw?.name || raw?.variantName || raw?.variant_name || '',
    productName: raw?.productName || raw?.product_name || '',
    brandName: raw?.brandName || raw?.brand_name || '',
    images: Array.isArray(raw?.images) ? raw.images : [],
    sprice: Number(raw?.sprice ?? raw?.price ?? 0),
    dprice: Number(raw?.dprice ?? 0),
    discount: Number(raw?.discount ?? 0),
  }
}

const extractProducts = (shopOrGroup: any): SubcategoryProduct[] => {
  const sources = [
    shopOrGroup?.products,
    shopOrGroup?.variants,
    shopOrGroup?.items,
    shopOrGroup?.productVariants,
    shopOrGroup?.product_variants,
  ]
  for (const source of sources) {
    if (!Array.isArray(source)) continue
    return source.map(toProduct).filter(Boolean) as SubcategoryProduct[]
  }
  return []
}

const normalizeSubcategoryData = (data: any): SubcategoryShopGroup[] => {
  if (!Array.isArray(data)) return []
  const grouped = new Map<string, SubcategoryShopGroup>()

  const upsertShopProduct = (shopId: string, shopName: string, product: SubcategoryProduct) => {
    if (!routeShopIds.value.has(shopId)) return
    if (!grouped.has(shopId)) {
      grouped.set(shopId, {
        id: shopId,
        name: shopName || 'Store',
        products: [],
      })
    }
    grouped.get(shopId)!.products.push(product)
  }

  data.forEach((entry: any) => {
    const entryProducts = extractProducts(entry)
    if (entryProducts.length) {
      const shopId = String(entry?.id || entry?.companyId || entry?.company_id || '')
      if (!shopId) return
      const shopName = entry?.name || entry?.companyName || entry?.company_name || 'Store'
      entryProducts.forEach((product) => upsertShopProduct(shopId, shopName, product))
      return
    }

    const product = toProduct(entry)
    if (!product) return
    const shopId = String(entry?.companyId || entry?.company_id || entry?.company?.id || '')
    if (!shopId) return
    const shopName =
      entry?.companyName ||
      entry?.company_name ||
      entry?.company?.name ||
      'Store'
    upsertShopProduct(shopId, shopName, product)
  })

  const groups = [...grouped.values()]
    .filter((group) => group.products.length > 0)
    .sort((a, b) => {
      const aNearby = nearbyStore.isNearbyCompany(a.id) ? 1 : 0
      const bNearby = nearbyStore.isNearbyCompany(b.id) ? 1 : 0
      return bNearby - aNearby
    })

  updateTrackWidth(Math.max(...groups.map((group) => group.products.length), 0))
  return groups
}

const matchBySubCategory = (raw: any, subCategory: string, subCategoryLabel: string) => {
  const targetValue = normalizeToken(subCategory)
  const targetLabel = normalizeToken(subCategoryLabel)
  const tokens = [targetValue, targetLabel].filter(Boolean)
  if (!tokens.length) return false

  const fromArray = (arr: any[]) =>
    arr
      .map((item) => {
        if (item == null) return ''
        if (typeof item === 'string') return item
        return item.name || item.label || item.slug || item.value || ''
      })
      .filter(Boolean)

  const candidates: string[] = [
    raw?.name,
    raw?.productName,
    raw?.product_name,
    raw?.category,
    raw?.categoryName,
    raw?.category_name,
    raw?.subcategory,
    raw?.subCategory,
    raw?.sub_category,
    raw?.subcategoryName,
    raw?.subcategory_name,
    raw?.category?.name,
    raw?.subcategory?.name,
    raw?.subCategory?.name,
    ...fromArray(Array.isArray(raw?.categories) ? raw.categories : []),
    ...fromArray(Array.isArray(raw?.subcategories) ? raw.subcategories : []),
    ...fromArray(Array.isArray(raw?.tags) ? raw.tags : []),
  ].filter(Boolean)

  const normalizedCandidates = candidates.map((candidate) => normalizeToken(candidate))
  return normalizedCandidates.some((candidate) =>
    tokens.some((token) => candidate.includes(token) || token.includes(candidate))
  )
}

const apiUrl = import.meta.env.VITE_API_URL as string

const fetchProductsForMatchedShops = async (
  shopsData: any[],
  subCategory: string,
  subCategoryLabel: string
): Promise<SubcategoryShopGroup[]> => {
  const fetchShopProductsFromStream = async (shopId: string, queryParams?: URLSearchParams): Promise<any[]> => {
    try {
      const query = queryParams?.toString() ? `?${queryParams.toString()}` : ''
      const res = await fetch(`${apiUrl}/products/company/${shopId}${query}`)
      if (!res.ok) return []

      const reader = res.body?.getReader()
      if (!reader) {
        const payload = await res.json().catch(() => [])
        return Array.isArray(payload) ? payload : []
      }

      const decoder = new TextDecoder()
      let buffer = ''
      const products: any[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            products.push(JSON.parse(trimmed))
          } catch {
            // Ignore malformed chunks from stream boundaries.
          }
        }
      }

      const finalChunk = buffer.trim()
      if (finalChunk) {
        try {
          products.push(JSON.parse(finalChunk))
        } catch {
          // Ignore final malformed chunk.
        }
      }

      return products
    } catch (error) {
      console.error(`Failed streaming products for shop ${shopId}`, error)
      return []
    }
  }

  const findCategoryIdForShop = async (shopId: string): Promise<string | null> => {
    try {
      const response = await api.get(`/products/categories/${shopId}`)
      const payload = response?.data
      const categories = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : []

      const targetTokens = [normalizeToken(subCategory), normalizeToken(subCategoryLabel)].filter(Boolean)
      if (!targetTokens.length) return null

      const matched = categories.find((cat: any) => {
        const candidates = [
          cat?.name,
          cat?.label,
          cat?.slug,
          cat?.value,
        ]
          .filter(Boolean)
          .map((value) => normalizeToken(String(value)))

        return candidates.some((candidate) =>
          targetTokens.some((token) => candidate.includes(token) || token.includes(candidate))
        )
      })

      return matched?.id ? String(matched.id) : null
    } catch (error) {
      console.error(`Failed to fetch categories for shop ${shopId}`, error)
      return null
    }
  }

  const groups = await Promise.all(
    shopsData.map(async (shop: any) => {
      const shopId = String(shop?.id || shop?.companyId || shop?.company_id || '')
      if (!shopId) return null

      try {
        const categoryId = await findCategoryIdForShop(shopId)
        const query = new URLSearchParams()
        if (categoryId) {
          query.append('categoryId', categoryId)
        }

        const variants = await fetchShopProductsFromStream(shopId, query)
        const matched = (categoryId
          ? variants
          : variants.filter((variant: any) => matchBySubCategory(variant, subCategory, subCategoryLabel)))
          .map(toProduct)
          .filter(Boolean) as SubcategoryProduct[]

        if (!matched.length) return null

        return {
          id: shopId,
          name: formatShopName(shop?.name || shop?.companyName || 'Store'),
          products: matched,
        } as SubcategoryShopGroup
      } catch (error) {
        console.error(`Failed to fetch products for shop ${shopId}`, error)
        return null
      }
    })
  )

  const filteredGroups = groups.filter(Boolean) as SubcategoryShopGroup[]
  updateTrackWidth(Math.max(...filteredGroups.map((group) => group.products.length), 0))
  return filteredGroups
}

const ensureLocation = async () => {
  const saved = await getLocation()
  if (saved?.lat && saved?.lng) {
    location.value = saved
    return saved
  }

  const gps = await getDeviceLocation()
  const currentLocation = {
    name: 'Current Location',
    formattedAddress: 'Near you',
    lat: gps.lat,
    lng: gps.lng,
    active: true,
  }
  location.value = currentLocation
  await setLocation(currentLocation as any)
  return currentLocation
}

const loadNearbyRouteShops = async (home: ShopCoord) => {
  const shopCoords = parseShopCoords()
  if (!shopCoords.length) {
    shops.value = []
    loading.value = false
    return
  }

  try {
    const response = await getNearbyShop(home, shopCoords)
    const data = Array.isArray(response.data) ? response.data : []
    shops.value = data.map((shop: any) => ({
      ...shop,
      name: formatShopName(shop?.name),
      displayName: formatShopName(shop?.name),
    }))
  } catch (error) {
    console.error('Failed to fetch nearby route shops:', error)
    const toast = await toastController.create({
      message: 'Could not load nearby shops for this route.',
      duration: 2200,
      color: 'warning',
      position: 'bottom',
    })
    await toast.present()
    shops.value = []
  } finally {
    loading.value = false
  }
}

const fetchShopsBySubCategory = async () => {
  const subCategory = subCategoryFilter.value
  if (!subCategory) return

  const { lat, lng } = location.value
  const requestId = ++subcategoryRequestSeq
  subcategoryLoading.value = true
  subcategoryShopGroups.value = []

  try {
    const res = await api.get('/shops/by-category', {
      params: {
        lat,
        lng,
        category: subCategory,
      }
    })

    if (requestId !== subcategoryRequestSeq) return

    const filteredShopsData = Array.isArray(res.data)
      ? res.data
        .filter((shop: any) => hasShopImage(shop))
        .map((shop: any) => ({
          ...shop,
          name: formatShopName(shop?.name),
          displayName: formatShopName(shop?.name),
        }))
        .filter((shop: any) => routeShopIds.value.has(String(shop.id)))
      : []

    filteredBySubcategoryShops.value = filteredShopsData
    let groups = normalizeSubcategoryData(res.data)
    if (!groups.length && filteredShopsData.length) {
      groups = await fetchProductsForMatchedShops(
        filteredShopsData,
        subCategory,
        selectedSubCategoryLabel.value
      )
    }

    if (requestId !== subcategoryRequestSeq) return
    subcategoryShopGroups.value = groups
  } catch (err) {
    if (requestId !== subcategoryRequestSeq) return
    console.error('Failed to fetch shops by sub category', err)
    subcategoryShopGroups.value = []
  } finally {
    if (requestId === subcategoryRequestSeq) {
      subcategoryLoading.value = false
    }
  }
}

const onLocationChange = async (newLocation: any) => {
  location.value = newLocation
  loading.value = true
  subCategoryFilter.value = ''
  filteredBySubcategoryShops.value = []
  subcategoryShopGroups.value = []
  await nearbyStore.$reset()
  await nearbyStore.fetchNearbyShops()
  await loadNearbyRouteShops({ lat: newLocation.lat, lng: newLocation.lng })
}

function onSearch(value: string) {
  searchTerm.value = (value || '').toLowerCase().trim()
}

function toggleCategory(index: number) {
  activeCategory.value = activeCategory.value === index ? null : index
}

const applyScrollState = (top: number) => {
  scrollY.value = top
  isCollapsed.value = top > 80
  hideCategory.value = top > 300
}

function onScroll(ev: CustomEvent) {
  latestScrollTop = Number(ev.detail?.scrollTop || 0)
  if (scrollRaf !== null) return
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = null
    applyScrollState(latestScrollTop)
  })
}

watch(subCategoryFilter, (newVal) => {
  if (!newVal) {
    subcategoryRequestSeq++
    subcategoryLoading.value = false
    filteredBySubcategoryShops.value = []
    subcategoryShopGroups.value = []
    updateTrackWidth(0)
    return
  }
  fetchShopsBySubCategory()
})

watch(selectedCategory, () => {
  subcategoryRequestSeq++
  subcategoryLoading.value = false
  subCategoryFilter.value = ''
  filteredBySubcategoryShops.value = []
  subcategoryShopGroups.value = []
  updateTrackWidth(0)
})

onIonViewWillEnter(async () => {
  loading.value = true
  try {
    const currentLocation = await ensureLocation()
    await nearbyStore.$reset()
    await nearbyStore.fetchNearbyShops()
    await loadNearbyRouteShops({ lat: currentLocation.lat, lng: currentLocation.lng })
  } catch (error) {
    console.error('Nearby shops location setup failed:', error)
    const toast = await toastController.create({
      message: 'Enable location or add an address to see nearby shops.',
      duration: 2200,
      color: 'warning',
      position: 'bottom',
    })
    await toast.present()
    shops.value = []
    loading.value = false
  }
})
</script>

<style scoped>
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
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
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
  max-height: 340px;
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

.content-wrap {
  position: relative;
  z-index: 1;
  padding-top: 6px;
  padding-bottom: calc(88px + var(--markit-bottom-inset));
  max-width: 980px;
  margin: 0 auto;
}

.shop-list,
.subcat-store-list {
  display: grid;
  gap: 14px;
}

.shop-item {
  animation: shop-rise 0.5s ease both;
  background: var(--markit-glass-surface);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-radius: 20px;
  contain: layout paint;
}

.gender-btn {
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

.subcat-loading {
  display: grid;
  place-items: center;
}

.subcat-store-card {
  background: #ffffff;
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-lg);
  padding: 12px;
}

.subcat-store-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  cursor: pointer;
}

.subcat-store-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--markit-text);
}

.subcat-store-meta {
  margin-top: 2px;
  font-size: 0.82rem;
  color: var(--markit-text-muted);
}

.subcat-product-scroll {
  display: flex;
  gap: 10px;
  width: 100%;
  overflow-x: scroll;
}

.subcat-product-scroll::-webkit-scrollbar {
  display: none;
}

.subcat-product-track {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  width: max-content;
  min-width: 100%;
}

.subcat-product-tile {
  width: 132px;
  min-width: 132px;
  flex: 0 0 auto;
  border: 1px solid var(--markit-border);
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
  text-align: left;
  padding: 8px;
  scroll-snap-align: start;
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-tap-highlight-color: transparent;
}

.subcat-product-image-wrap {
  width: 100%;
  aspect-ratio: 4 / 5;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
}

.subcat-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.subcat-product-name {
  margin-top: 8px;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--markit-text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.subcat-product-brand {
  margin-top: 2px;
  font-size: 0.74rem;
  color: var(--markit-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.subcat-product-price {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.subcat-product-price-discount {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--markit-text);
}

.subcat-product-price-strike {
  font-size: 0.72rem;
  color: #7f8897;
  text-decoration: line-through;
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

@media (min-width: 768px) {
  .hero-small {
    font-size: 34px;
  }

  .hero-big {
    font-size: 52px;
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

.will-change-transform {
  will-change: transform, opacity;
}
</style>
