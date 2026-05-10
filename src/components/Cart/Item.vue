<template>
  <div>
    <template v-if="renderCompanies.length">
      <div
        v-for="company in renderCompanies"
        :key="company.companyId"
        :class="[
          'cart-company-card glass-card p-3 mb-3',
          !isNearbyLoaded
            ? ''
            : !isCompanyDeliverable(company.companyId)
              ? 'opacity-50 pointer-events-none'
              : ''
        ]"
      >
        <div class="cart-company-heading flex items-center gap-2 mb-3 w-full pb-1">
          <div class="cart-company-logo flex-shrink-0 w-16 h-10 overflow-hidden">
            <img
              v-if="hasCompanyLogo(company.companyLogo) && !failedCompanyLogos[company.companyId]"
              :src="`https://images.markit.co.in/${company.companyLogo}`"
              alt=""
              class="w-full h-full object-fill block"
              @error="onCompanyLogoError(company.companyId)"
            />
            <div v-else class="cart-company-logo-fallback">
              {{ companyInitial(company.companyName) }}
            </div>
          </div>

          <div>
            {{ formatCompanyName(company.companyName) }}

            <!-- 🟡 Loading state -->
            <p
              v-if="!isNearbyLoaded"
              class="cart-company-status cart-company-status--loading"
            >
              Checking availability...
            </p>

            <!-- 🔴 Not deliverable (only AFTER load) -->
            <p
              v-else-if="!isCompanyDeliverable(company.companyId)"
              class="cart-company-status cart-company-status--closed"
            >
              Not deliverable to your location
            </p>

            <!-- 🟢 Deliverable -->
            <p
              v-else
              class="cart-company-status cart-company-status--open"
            >
              Deliverable
            </p>
          </div>
        </div>

        <ul role="list" class="divide-y divide-[var(--markit-border)]">
          <li
            v-for="cartItem in company.items"
            :key="cartItem.uiKey"
            class="flex py-6"
          >
            <div class="cart-item-row flex justify-between w-full gap-x-5">
              <RouterLink
                :to="{ name: 'product', params: { variantId: cartItem.id } }"
                class="cart-item-media w-32 h-32 rounded-md"
              >
                <img
                  v-if="cartItem.images?.length"
                  :src="`https://images.markit.co.in/${cartItem.images[0]}`"
                  class="w-full h-full object-cover rounded-md"
                />
              </RouterLink>

              <div class="cart-item-content flex flex-col w-full justify-between p-1">
                <div class="min-w-0">
                  <div class="cart-item-title-wrap">
                    <RouterLink
                      :to="{ name: 'product', params: { variantId: cartItem.id } }"
                      class="cart-item-title"
                    >
                      {{ formatProductTitle(cartItem.productName, cartItem.name) }}
                    </RouterLink>
                  </div>

                  <p v-if="cartItem.selectedSize" class="cart-item-size mt-1">
                    Size: {{ formatSize(cartItem.selectedSize) }}
                  </p>

                  <div>
                    <p class="cart-item-price">
                      <span v-if="cartItem.discount > 0">
                        <del class="cart-item-price-strike">
                          &#8377;{{ Number(cartItem.sprice || 0).toFixed(2) }}
                        </del>
                        <span class="cart-item-price-sale ml-1">
                          &#8377;{{
                            (Number(cartItem.sprice || 0) *
                              (1 - Number(cartItem.discount || 0) / 100)
                            ).toFixed(2)
                          }}
                        </span>
                      </span>
                      <span v-else class="cart-item-price-main">
                        &#8377;{{ Number(cartItem.sprice || 0).toFixed(2) }}
                      </span>
                    </p>
                  </div>
                </div>

                <div class="cart-item-actions flex flex-row justify-between items-center">
                  <div class="cart-item-qty-controls flex items-center gap-3 me-4">
                    <Badge
                      size="lg"
                      @click="decrement(cartItem)"
                      color="secondary"
                      variant="outline"
                    >
                      -
                    </Badge>
                    <span class="cart-item-qty">{{ cartItem.quantity }}</span>
                    <Badge
                      size="lg"
                      @click="increment(cartItem)"
                      color="secondary"
                      variant="outline"
                    >
                      +
                    </Badge>
                  </div>

                  <button @click="removeAll(cartItem)" class="cart-item-delete">
                    <ion-icon :icon="trash" class="w-6 h-6"></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <p v-else class="cart-empty-group">
      No items in this group.
    </p>
  </div>
</template>

<script setup lang="ts">
import { trash, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons'
import { IonIcon, createGesture, toastController, useIonRouter } from '@ionic/vue'
import Badge from '../Badge.vue'
import { useCartStore } from '@/store/useCartStore'
import { useNearbyStore } from '@/store/useNearbyStore'
import { computed, ref, watch, onMounted } from 'vue'
import { reconcileCartStock } from '@/utils/cartStock'

const emit = defineEmits<{
  (e: 'groupedCart', payload: {
    cartNumber: number
    companies: {
      companyId: string
      companyName: string
      companyLogo: string
      companyLat: number
      companyLng: number
      companyLocationId: string
      items: any[]
    }[]
  }): void
}>()

const cart = useCartStore()
const nearbyStore = useNearbyStore()
const router = useIonRouter()

const failedCompanyLogos = ref<Record<string, boolean>>({})

/* --- Group logic --- */
const activeGroupIndex = ref(0)
const groupCount = computed(() => cart.groups.length)
const activeGroup = computed(() => cart.groups[activeGroupIndex.value] || { companies: [] })

/* --- UI bindings --- */
const itemGroupKey = (item: any) =>
  `${item.id || 'variant'}::${item.selectedSize ?? 'nosize'}`

const renderCompanies = computed(() =>
  (activeGroup.value?.companies || []).map(company => {
    const groupedItems = new Map<string, any>()

    for (const item of company.items || []) {
      const key = itemGroupKey(item)
      const existing = groupedItems.get(key)

      if (existing) {
        existing.quantity += Math.max(1, Number(item.quantity || 1))
        existing.unitItems.push(item)
        continue
      }

      groupedItems.set(key, {
        ...item,
        uiKey: `${company.companyId}-${key}`,
        quantity: Math.max(1, Number(item.quantity || 1)),
        unitItems: [item],
      })
    }

    return {
      ...company,
      items: Array.from(groupedItems.values()),
    }
  })
)

/* ✅ NEW: track loading */
const isNearbyLoaded = computed(() => {
  return Array.isArray(nearbyStore.nearbyShops) && nearbyStore.nearbyShops.length > 0
})

/* --- Deliverable companies --- */
const deliverableCompanyIds = computed(() => {
  if (!isNearbyLoaded.value) return []

  return nearbyStore.nearbyShops
    .filter((shop: any) => shop.road_distance <= 10000)
    .map((shop: any) => shop.id)
})

/* ✅ FIX: default TRUE until loaded */
const isCompanyDeliverable = (companyId: string) => {
  if (!isNearbyLoaded.value) return true
  return deliverableCompanyIds.value.includes(companyId)
}

/* --- Helpers --- */
function hasCompanyLogo(logo?: string | null) {
  const value = String(logo || '').trim().toLowerCase()
  return value !== '' && value !== 'undefined' && value !== 'null'
}

function companyInitial(name?: string | null) {
  const value = String(name || '').trim()
  return value ? value[0].toUpperCase() : 'S'
}

function onCompanyLogoError(companyId: string) {
  failedCompanyLogos.value[companyId] = true
}

function formatLabel(value?: string | null) {
  if (!value) return ''
  return String(value)
    .replace(/&/g, ' & ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word =>
      word
        .split('-')
        .map(part => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join('-')
    )
    .join(' ')
}

function formatCompanyName(value?: string | null) {
  if (!value) return ''
  return String(value)
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word =>
      word
        .split('-')
        .map(part => (part ? part[0].toUpperCase() + part.slice(1) : ''))
        .join('-')
    )
    .join(' ')
}

function formatProductTitle(productName?: string | null, colorName?: string | null) {
  const base = formatLabel(productName)
  const color = formatLabel(colorName)
  if (!base) return color
  if (!color || color.toLowerCase() === base.toLowerCase()) return base
  return `${base} (${color})`
}

function formatSize(size?: string | null) {
  return String(size || '').trim().toUpperCase()
}

/* --- Navigation --- */
function nextGroup() {
  if (!groupCount.value) return
  activeGroupIndex.value = (activeGroupIndex.value + 1) % groupCount.value
}

function prevGroup() {
  if (!groupCount.value) return
  activeGroupIndex.value = (activeGroupIndex.value - 1 + groupCount.value) % groupCount.value
}

/* --- Emit grouped cart --- */
watch([() => cart.groups, activeGroupIndex], () => {
  const currentGroup = activeGroup.value || { cartNumber: 0, companies: [] }
  emit('groupedCart', {
    cartNumber: currentGroup.cartNumber,
    companies: currentGroup.companies || [],
  })
}, { deep: true, immediate: true })

watch(() => cart.groups, (groups) => {
  if (!groups.length) {
    activeGroupIndex.value = 0
    return
  }
  if (activeGroupIndex.value > groups.length - 1) {
    activeGroupIndex.value = groups.length - 1
  }
}, { deep: true })

/* --- Cart actions --- */
async function increment(item: any) {
  const unit = item.unitItems?.[0] || item
  const group = cart.groups.find(g =>
    g.companies.some(c => c.items.some((i: any) => i.cartLineId === unit.cartLineId))
  )
  const company = group?.companies.find(c =>
    c.items.some((i: any) => i.cartLineId === unit.cartLineId)
  )
  if (!company) return

  // Cart limits: 10 total / 5 per store (mirrors useCartStore.addItem)
  const totalInCart = cart.groups
    .flatMap(g => g.companies)
    .reduce((sum, c) => sum + (c.items?.length || 0), 0)
  if (totalInCart >= 10) {
    const t = await toastController.create({
      message: 'Cart limit is 10 items.',
      duration: 2000,
      color: 'warning',
      position: 'bottom',
    })
    await t.present()
    return
  }

  const itemsInThisStore = cart.groups
    .flatMap(g => g.companies)
    .filter(c => c.companyId === company.companyId)
    .reduce((sum, c) => sum + (c.items?.length || 0), 0)
  if (itemsInThisStore >= 5) {
    const t = await toastController.create({
      message: 'Max 5 items from a single store.',
      duration: 2000,
      color: 'warning',
      position: 'bottom',
    })
    await t.present()
    return
  }

  company.items.push({
    ...unit,
    cartLineId: cart.createCartLineId(),
    quantity: 1,
  })
  cart.saveCart()
  validateAfterCartChange()
}

function decrement(item: any) {
  removeAll(item, true)
  cart.saveCart()
}

function removeAll(item: any, single = false) {
  const units = item.unitItems || [item]
  const unitIds = new Set(units.map((unit: any) => unit.cartLineId).filter(Boolean))
  const firstUnitId = units[0]?.cartLineId

  for (const group of cart.groups) {
    for (const company of group.companies) {
      if (single && firstUnitId) {
        const idx = company.items.findIndex((i: any) => i.cartLineId === firstUnitId)
        if (idx !== -1) company.items.splice(idx, 1)
      } else {
        company.items = company.items.filter(
          (i: any) => !(unitIds.has(i.cartLineId) || (i.id === item.id && i.selectedSize === item.selectedSize))
        )
      }
    }
    group.companies = group.companies.filter(c => c.items.length > 0)
  }

  cart.groups = cart.groups.filter(g => g.companies.length > 0)
  cart.saveCart()
}

async function validateAfterCartChange() {
  try {
    const messages = await reconcileCartStock(cart)
    if (!messages.length) return
    const toast = await toastController.create({
      message: messages[0],
      duration: 3000,
      color: 'warning',
      position: 'top',
      cssClass: 'markit-toast markit-toast-warning',
    })
    await toast.present()
  } catch (error) {
    console.error('Failed to validate cart stock', error)
  }
}

/* --- Lifecycle --- */
onMounted(async () => {
  await cart.loadCart()

  // ⚠️ Make sure nearby shops are fetched here if not already
  if (!nearbyStore.nearbyShops?.length) {
    try {
      await nearbyStore.fetchNearbyShops?.()
    } catch (e) {
      console.error('Failed to load nearby shops', e)
    }
  }

  if (groupCount.value > 1) {
    const el = document.querySelector('.cart-company-card') as HTMLElement
    if (!el) return

    const gesture = createGesture({
      el,
      gestureName: 'swipe',
      onMove: ev => {
        if (ev.deltaX > 100) prevGroup()
        if (ev.deltaX < -100) nextGroup()
      },
    })

    gesture.enable()
  }
})
</script>

<style scoped>
.cart-group-switch {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
}

.cart-group-strip {
  gap: 10px;
}

.cart-switch-arrow {
  width: 34px;
  min-width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--markit-border);
  color: var(--markit-text);
  background: var(--markit-surface-muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color .2s ease, color .2s ease, background-color .2s ease;
}

.cart-switch-arrow:hover {
  border-color: var(--ion-color-primary);
  color: var(--ion-color-primary);
}

.cart-group-companies {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.cart-company-chip {
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.cart-company-chip.is-active {
  border-color: var(--markit-border);
  background: color-mix(in srgb, var(--ion-color-primary) 7%, #ffffff);
}

.cart-all-inline {
  justify-content: flex-start;
}

.cart-company-logo {
  border: 1px solid var(--markit-border);
  border-radius: 10px;
  background: var(--markit-surface);
  position: relative;
  z-index: 1;
}

.cart-company-logo-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  color: var(--ion-color-primary);
  background: color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff);
}

.cart-company-link {
  font-size: 0.78rem;
  line-height: 1.25;
  font-weight: 600;
  color: var(--markit-primary);
}

.cart-company-card {
  border-radius: var(--markit-radius-xl);
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-glass-border);
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    var(--markit-glass-shadow);
}

.cart-company-heading {
  border-bottom: 1px solid var(--markit-border);
  position: relative;
  z-index: 1;
}

.cart-company-heading-icon {
  color: var(--markit-text-muted);
}

.cart-company-heading-text {
  font-size: 1.06rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
}

.cart-company-status {
  margin-top: 4px;
  font-size: 0.74rem;
  line-height: 1.2;
  font-weight: 700;
}

.cart-company-status--loading {
  color: var(--markit-text-muted);
}

.cart-company-status--closed {
  color: #dc2626;
}

.cart-company-status--open {
  color: var(--ion-color-primary);
}

.cart-item-media {
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
  flex: 0 0 128px;
}

.cart-item-title {
  font-size: 0.95rem;
  line-height: 1.35;
  font-weight: 600;
  color: var(--markit-text);
}

.cart-item-size {
  font-size: 0.8rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}

.cart-item-price {
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.cart-item-price-main {
  font-size: 0.93rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--markit-text);
}

.cart-item-price-strike {
  font-size: 0.83rem;
  color: var(--markit-text-muted);
}

.cart-item-price-sale {
  font-size: 0.93rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--ion-color-primary);
}

.cart-item-qty {
  min-width: 22px;
  text-align: center;
  font-size: 0.88rem;
  line-height: 1.2;
  font-weight: 600;
  color: var(--markit-text);
}

.cart-item-delete {
  color: #d33c3c;
}

.cart-item-delete :deep(ion-icon) {
  font-size: 22px;
}

.cart-empty-group {
  text-align: center;
  color: var(--markit-text-muted);
  font-size: 0.9rem;
  line-height: 1.35;
  padding: 8px 0 2px;
}

@media (max-width: 420px) {
  .cart-company-chip {
    width: 100%;
  }

  .cart-item-row {
    gap: 12px;
  }

  .cart-item-media {
    width: 106px;
    height: 106px;
    flex-basis: 106px;
  }

  .cart-item-content {
    min-width: 0;
  }

  .cart-item-title {
    font-size: 0.88rem;
    line-height: 1.25;
  }

  .cart-item-size {
    font-size: 0.74rem;
  }

  .cart-item-actions {
    margin-top: 8px;
  }

  .cart-item-qty-controls {
    gap: 8px;
    margin-right: 8px;
  }

  .cart-item-delete :deep(ion-icon) {
    font-size: 20px;
  }
}
</style>
