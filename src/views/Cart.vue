<template>
  <ion-page>
    <Topbar title="Cart" />
    <ion-content :fullscreen="true" class="ion-padding cart-page">
      <!-- Show cart when we have any groups -->
      <div v-if="hasCart">
        <div v-if="stockAlerts.length" class="stock-alert-card">
          <p class="stock-alert-title">Cart updated</p>
          <p v-for="message in stockAlerts" :key="message" class="stock-alert-message">
            {{ message }}
          </p>
        </div>

        <!-- Item component emits nearby company clusters -->
        <Item @groupedCart="updateGroupedCart" />

        <!-- Add products from nearby store -->
        <div class="nearby-add-card my-3 p-5 flex items-center gap-4 cursor-pointer"
          @click="goToNearbyShops">
          <div class="nearby-add-icon-wrap">
            <IonIcon :icon="addOutline" class="nearby-add-icon" />
          </div>
          <div class="min-w-0 flex-1 text-left">
            <p class="nearby-add-title">Add more from nearby stores</p>
            <p class="nearby-add-text">
              Browse nearby shops and top up your cart with matching items.
            </p>
          </div>
        </div>

        <!-- Checkout Section -->
        <div v-if="hasActiveItems">
          <!-- <CheckoutMethod v-model:method="checkoutMethod" /> -->
          <Address />
          <Pricing :subtotal="subtotal" :shipping="shipping" :totalDiscount="totalDiscount" :waitingFee="waitingFee"
            :waitingTime="waitingTime" :totalItem="totalItem" />
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="flex flex-col items-center justify-center min-h-full text-center empty-panel">
        <div class="empty-icon">
          <IonIcon :icon="bagHandleOutline" class="empty-icon-mark" />
        </div>
        <h2 class="empty-title mt-4">Your cart is empty</h2>
        <p class="empty-copy mt-2 max-w-[16rem]">
          Add products you love and they'll show up here.
        </p>
        <ion-button fill="solid" color="primary" class="markit-cta mt-5" @click="router.push({ name: 'shops' })">
          Browse Products
        </ion-button>
      </div>
    </ion-content>

    <!-- Footer -->
    <ion-footer v-if="hasActiveItems" class="cart-footer-glass">
      <div class="cart-footer-bg">
        <div v-if="deliveryType" class="p-3 mx-2 my-2">
          <p class="cart-delivery-time">
            Delivery Time: {{ formattedDeliveryTime }}
          </p>
        </div>

        <div class="cart-footer-action p-3">
          <ion-button class="cart-pick-btn" expand="block" :disabled="loading"
            @click="deliveryType ? checkout() : openPickTimeModal()">
            <template v-if="loading">
              <ion-spinner name="crescent"></ion-spinner>
            </template>
            <template v-else>
              {{ deliveryType ? 'Place Order' : 'Pick a time' }}
            </template>
          </ion-button>
        </div>

        <PickTimeModal :is-open="isPickTimeModalOpen" @close="closePickTimeModal" @proceed="getDeliveryTime" />
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import Item from '@/components/Cart/Item.vue'
import Pricing from '@/components/Cart/Pricing.vue'
import Topbar from '@/components/Topbar.vue'
import Address from '@/components/Cart/Address.vue'
import PickTimeModal from '@/components/Cart/PickTimeModal.vue'
import { addOutline, bagHandleOutline } from 'ionicons/icons'
import {
  IonPage,
  IonFooter,
  IonSpinner,
  IonButton,
  IonContent,
  IonIcon,
  onIonViewWillEnter,
  toastController,
} from '@ionic/vue'
import { ref, computed, watch } from 'vue'
import { useCartStore } from '@/store/useCartStore'
import { useLocationStore } from '@/composables/useLocationStore'
import { postOrder } from '@/api/api'
import { format, addHours } from 'date-fns'
import { useIonRouter } from '@ionic/vue'
import { getDistanceInKm } from '@/composables/useDistance'
import { usePackStore } from '@/store/usePackStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { Preferences } from '@capacitor/preferences';
import { useNearbyStore } from '@/store/useNearbyStore'
import { reconcileCartStock } from '@/utils/cartStock'
import {
  calculateMaxWaitingMinutes,
  calculateMaxWaitingFee,
  calculateDeliveryFee,
  CART_MAX_ITEMS,
  CART_MAX_PER_STORE,
} from '@/utils/feeCalc'


// store instance
const packStore = usePackStore()
const tryHistoryStore = useTryHistoryStore()
const nearbyStore = useNearbyStore()

const router = useIonRouter()
const cart = useCartStore()
const tryHistory = useTryHistoryStore()
const { getLocation } = useLocationStore()

console.log(cart)

const loading = ref(false)
const location = ref<any>(null)
const checkoutMethod = ref<'trynbuy' | 'standard' | string>('trynbuy')
const isFinalizingCheckout = ref(false)
const stockAlerts = ref<string[]>([])

/* ========= ACTIVE GROUPS ========= */
const activeGroups = ref<
  {
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
  }[]
>([])

/* ✅ When Item.vue emits groupedCart */
const updateGroupedCart = async (payload: { companies: any[]; cartNumber?: number }) => {
  activeGroups.value = cart.groups || []

  if (location.value && activeGroups.value.length) {
    const shopCoords = activeGroups.value
      .flatMap(g => g.companies)
      .map(c => `${c.companyLat},${c.companyLng}`)
    const customerCoord = `${location.value.lat},${location.value.lng}`
    distance.value = await getDistanceInKm(shopCoords, customerCoord)
  }
}

/* ========== CART COMPUTED VALUES ========== */
const hasCart = computed(() => Array.isArray(cart.groups) && cart.groups.length > 0)
const hasActiveItems = computed(() =>
  activeGroups.value.some(g =>
    g.companies.some(c => c.items && c.items.length > 0)
  )
)



watch(
  () => cart.groups,
  async (newGroups) => {
    if (isFinalizingCheckout.value) return

    if(!newGroups || newGroups.length === 0) {
      await nearbyStore.clearNearby()
      return
    }
    await nearbyStore.fetchNearbyShops()
    
  },
  { deep: true, immediate: true }
)

/* Totals */
const subtotal = computed(() =>
  activeGroups.value
    .flatMap(g => g.companies)
    .flatMap(c => c.items)
    .reduce((sum, item) => sum + (item.sprice || 0) * (item.quantity || 0), 0)
)

const productDiscount = computed(() =>
  activeGroups.value
    .flatMap(g => g.companies)
    .flatMap(c => c.items)
    .reduce((sum, item) => {
      const price = item.sprice || 0
      const discPct = item.discount || 0
      const qty = item.quantity || 0
      return sum + price * (discPct / 100) * qty
    }, 0)
)

const couponDiscount = computed(() => 0)
const totalDiscount = computed(() => productDiscount.value + couponDiscount.value)

/* Shipping */
const distance = ref<{ forwardKm: number; backwardKm: number } | null>(null)
const shipping = computed(() => {
  if (!distance.value) return 0
  return calculateDeliveryFee(distance.value)
})

/* ✅ Total Item Count */
const totalItem = computed(() =>
  activeGroups.value
    .flatMap(g => g.companies)
    .flatMap(c => c.items)
    .reduce((sum, item) => sum + (item.quantity || 0), 0)
)

const uniqueStoreCount = computed(() =>
  new Set(
    activeGroups.value
      .flatMap(g => g.companies)
      .map(company => company.companyId)
      .filter(Boolean)
  ).size
)

/* ✅ Waiting Time & Fees */
const waitingTime = computed(() => calculateMaxWaitingMinutes(totalItem.value))
const waitingFee = computed(() => calculateMaxWaitingFee(waitingTime.value))

/* ========== PICK TIME MODAL ========== */
const isPickTimeModalOpen = ref(false)
const closePickTimeModal = () => (isPickTimeModalOpen.value = false)

const openPickTimeModal = async () => {
  const { value: token } = await Preferences.get({ key: 'token' })

  if (token) {
    isPickTimeModalOpen.value = true
  } else {
    router.push({ name: 'login' })
  }
}

/* ========== DELIVERY TIME ========== */
const deliveryTime = ref<string | null>(null)
const deliveryType = ref<string | null>(null)
const getDeliveryTime = (time: { slot: string; type: string }) => {
  deliveryTime.value = time.slot
  deliveryType.value = time.type
}

const formattedDeliveryTime = computed(() => {
  if (!deliveryType.value) return ''
  const now = new Date()

  const baseDate =
    deliveryType.value === 'instant'
      ? addHours(now, 1)
      : deliveryType.value === 'later' && deliveryTime.value
        ? new Date(deliveryTime.value)
        : now

  const today = now.toDateString()
  const tomorrow = addHours(now, 24).toDateString()
  const dateLabel =
    baseDate.toDateString() === today
      ? 'Today'
      : baseDate.toDateString() === tomorrow
        ? 'Tomorrow'
        : format(baseDate, 'EEEE, d MMM')

  return `${format(baseDate, 'h:mm a')}, ${dateLabel}`
})

/* ========== LOAD LOCATION & CART ========== */
onIonViewWillEnter(async () => {
  try {
    location.value = await getLocation()
    await cart.loadCart()
    await validateCartStock()
  } catch (err) {
    console.error('Init error:', err)
  }
})

async function validateCartStock() {
  const messages = await reconcileCartStock(cart)
  if (messages.length) {
    stockAlerts.value = messages
    const stockToast = await toastController.create({
      message: messages[0],
      duration: 3500,
      color: 'warning',
      position: 'top',
      cssClass: 'markit-toast markit-toast-warning'
    })
    await stockToast.present()
  }
  activeGroups.value = cart.groups || []
  return messages
}

/* ========== CHECKOUT ========== */
const checkout = async () => {
  loading.value = true
  await cart.loadCart()
  const savedLocation = await getLocation()
  location.value = savedLocation

  const locationToast = await toastController.create({
    message: 'Please select a saved delivery address',
    duration: 2000,
    color: 'danger',
    position: 'bottom'
  })
  const noInternetToast = await toastController.create({
    message: 'No internet connection. Please check your network.',
    duration: 3000,
    color: 'danger',
    position: 'bottom'
  })

  if (!savedLocation?.id) {
    await locationToast.present()
    loading.value = false
    return
  }

  if (uniqueStoreCount.value > 3) {
    const storeLimitToast = await toastController.create({
      message: 'You can checkout items from up to 3 stores only.',
      duration: 2500,
      color: 'danger',
      position: 'bottom'
    })
    await storeLimitToast.present()
    loading.value = false
    return
  }

  if (totalItem.value > CART_MAX_ITEMS) {
    const itemLimitToast = await toastController.create({
      message: `Cart limit is ${CART_MAX_ITEMS} items.`,
      duration: 2500,
      color: 'danger',
      position: 'bottom'
    })
    await itemLimitToast.present()
    loading.value = false
    return
  }

  const overStore = activeGroups.value
    .flatMap(g => g.companies)
    .find(c => (c.items?.length || 0) > CART_MAX_PER_STORE)
  if (overStore) {
    const perStoreToast = await toastController.create({
      message: `Max ${CART_MAX_PER_STORE} items from a single store (${overStore.companyName}).`,
      duration: 2500,
      color: 'danger',
      position: 'bottom'
    })
    await perStoreToast.present()
    loading.value = false
    return
  }

  try {
    const stockMessages = await validateCartStock()
    if (stockMessages.length) {
      loading.value = false
      return
    }

    const payloadGroups = activeGroups.value.map(group => ({
      cartNumber: group.cartNumber,
      companies: group.companies.map(company => ({
        companyId: company.companyId,
        companyName: company.companyName,
        companyLogo: company.companyLogo,
        companyLat: company.companyLat,
        companyLng: company.companyLng,
        companyLocationId: company.companyLocationId,
        items: company.items
      }))
    }))



    const Orderres = await postOrder({
      groups: payloadGroups,
      locationId: savedLocation.id,
      checkoutMethod: checkoutMethod.value,
      subtotal: subtotal.value,
      productDiscount: productDiscount.value,
      totalDiscount: totalDiscount.value,
      shipping: shipping.value,
      deliveryType: deliveryType.value,
      deliveryTime: deliveryTime.value,
      waitingTime: waitingTime.value,
      waitingFee: waitingFee.value,
      totalItem: totalItem.value
    })
    const orderRes = Orderres.data
    console.log('✅ Order placed successfully:', orderRes)
    console.log(deliveryTime.value)

    const createdOrders = Array.isArray(orderRes.trynbuys) && orderRes.trynbuys.length
      ? orderRes.trynbuys
      : orderRes.trynbuy
        ? [orderRes.trynbuy]
        : []

    for (const createdOrder of createdOrders) {
      const existing = packStore.getById(createdOrder.trynbuy_id)
      if (existing) {
        await packStore.update(createdOrder.trynbuy_id, createdOrder)
      } else {
        await packStore.add(createdOrder)
      }
      await tryHistoryStore.updateOrderStatus(createdOrder.trynbuy_id, createdOrder.order_status)
    }


    await tryHistory.fetchFromApi()

    isFinalizingCheckout.value = true

    for (const group of activeGroups.value) {
      for (const company of group.companies) {
        await cart.removeByCompanyId(company.companyId)
      }
    }

    await nearbyStore.clearNearby()

    deliveryTime.value = null
    deliveryType.value = null
    activeGroups.value = []

    router.push({ name: 'order-success' })
  } catch (error: any) {
    console.error('❌ Checkout failed:', error)

    if (!error?.response) {
      await noInternetToast.present()
    } else {
      const message = error.response.data?.error || 'Something went wrong'
      const stockToast = await toastController.create({
        message,
        duration: 5000,
        color: 'danger',
        position: 'bottom'
      })
      await stockToast.present()
    }
  } finally {
    isFinalizingCheckout.value = false
    loading.value = false
  }
}

/* ========== NAVIGATE TO NEARBY SHOPS ========== */
const goToNearbyShops = () => {
  if (!activeGroups.value.length) {
    console.warn('No active groups to fetch nearby shops for.')
    return
  }

  const coords = activeGroups.value
    .flatMap(g => g.companies)
    .map(c => `${c.companyLat},${c.companyLng}`)

  router.push({ name: 'nearby-shops', query: { coords } })
}
</script>

<style scoped>
.cart-page {
  --background: var(--markit-bg);
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--markit-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  box-shadow: var(--markit-shadow-soft);
}

.empty-icon-mark {
  font-size: 1.85rem;
  color: var(--ion-color-primary);
}

.empty-panel {
  width: 100%;
  background: var(--markit-bg);
  border-radius: var(--markit-radius-lg);
  padding: 48px 16px 56px;
  margin: 0 4px;
}

.empty-title {
  font-size: 1.5rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: var(--markit-text);
}

.empty-copy {
  color: var(--markit-text-muted);
  font-size: 0.92rem;
  line-height: 1.45;
}


.nearby-add-card {
  border: 1px dashed var(--markit-glass-border-hover);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.stock-alert-card {
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: var(--markit-radius-lg);
  background: #fff7ed;
  padding: 12px 14px;
  margin: 0 0 12px;
  box-shadow: var(--markit-glass-shadow);
}

.stock-alert-title {
  font-size: 0.86rem;
  line-height: 1.25;
  font-weight: 800;
  color: #92400e;
}

.stock-alert-message {
  margin-top: 3px;
  font-size: 0.78rem;
  line-height: 1.35;
  color: #9a3412;
}

.nearby-add-card:hover {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow-lg);
  transform: translateY(-1px);
}

.nearby-add-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  background: color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 22%, var(--markit-border));
}

.nearby-add-icon {
  font-size: 1.4rem;
  color: var(--ion-color-primary);
}

.nearby-add-title {
  font-size: 0.98rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
}

.nearby-add-text {
  margin-top: 2px;
  font-size: 0.84rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
}

.cart-footer-glass {
  --background: transparent !important;
  background: var(--markit-glass-surface) !important;
  border-bottom: none;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 8px 18px rgba(20, 34, 28, 0.08);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  overflow: hidden;
  padding-bottom: calc(var(--markit-bottom-inset) + 4px);
}

/* Override Ionic's default footer background */
ion-footer.cart-footer-glass {
  background: transparent !important;
}

ion-footer.cart-footer-glass::part(container) {
  background: transparent !important;
}

.cart-delivery-time {
  color: var(--markit-text);
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.3;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
  border-radius: 12px;
  padding: 8px 10px;
}

.cart-pick-btn {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --background-focused: var(--ion-color-primary);
  --border-radius: 14px;
  --box-shadow: none;
  --color: #ffffff;
  width: 100%;
  max-width: none;
  min-height: 46px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.cart-pick-btn::part(native) {
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 70%, #ffffff);
  width: 100%;
}

.cart-footer-action {
  width: 100%;
}

.cart-footer-action .cart-pick-btn {
  max-width: none;
}
</style>
