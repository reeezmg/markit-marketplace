<template>
  <ion-page>
    <Topbar />
    <ion-content :fullscreen="true" color="light">
      <!-- Show cart when we have any groups -->
      <div v-if="hasCart">
        <!-- Item component emits nearby company clusters -->
        <Item @groupedCart="updateGroupedCart" />

        <!-- Add products from nearby store -->
        <div
          class="border-2 border-dashed border-gray-300 rounded-xl m-2 p-6 bg-white shadow-sm flex flex-col items-center justify-center text-center hover:border-green-500 transition-all duration-200 cursor-pointer"
          @click="goToNearbyShops"
        >
          <IonIcon :icon="addOutline" class="text-gray-500 w-10 h-10 mb-2" />
          <p class="text-sm text-gray-500">Add product from nearby store</p>
        </div>

        <!-- Checkout Section -->
        <div v-if="hasActiveItems">
          <CheckoutMethod v-model:method="checkoutMethod" />
          <Address />
          <Pricing
            :subtotal="subtotal"
            :shipping="shipping"
            :totalDiscount="totalDiscount"
            :waitingFee="waitingFee"
            :waitingTime="waitingTime"
            :totalItem="totalItem"
          />
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="flex flex-col items-center justify-center h-full text-center">
        <p class="text-gray-600 mb-4">No Products in cart.</p>
        <ion-button
          fill="solid"
          color="primary"
          shape="round"
          size="small"
          @click="router.push('/')"
        >
          Go to Home
        </ion-button>
      </div>
    </ion-content>

    <!-- Footer -->
    <ion-footer v-if="hasActiveItems" class="bg-white rounded-t-xl">
      <div v-if="deliveryType" class="p-3 mx-2 my-2">
        <p class="text-gray-700 font-medium">
          Delivery Time: {{ formattedDeliveryTime }}
        </p>
      </div>

      <div class="m-2">
        <ion-button
          expand="block"
          :disabled="loading"
          @click="deliveryType ? checkout() : openPickTimeModal()"
        >
          <template v-if="loading">
            <ion-spinner name="crescent"></ion-spinner>
          </template>
          <template v-else>
            {{ deliveryType ? 'Place Order' : 'Pick a time' }}
          </template>
        </ion-button>
      </div>

      <PickTimeModal
        :is-open="isPickTimeModalOpen"
        @close="closePickTimeModal"
        @proceed="getDeliveryTime"
      />
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import CheckoutMethod from '@/components/Cart/CheckoutMethod.vue'
import Item from '@/components/Cart/Item.vue'
import Pricing from '@/components/Cart/Pricing.vue'
import Topbar from '@/components/Topbar.vue'
import Address from '@/components/Cart/Address.vue'
import PickTimeModal from '@/components/Cart/PickTimeModal.vue'
import { addOutline } from 'ionicons/icons'
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
import { ref, computed } from 'vue'
import { useCartStore } from '@/store/useCartStore'
import { useLocationStore } from '@/composables/useLocationStore'
import { postOrder } from '@/api/api'
import { format, addHours } from 'date-fns'
import { useRouter } from 'vue-router'
import { getDistanceInKm } from '@/composables/useDistance'
import { usePackStore } from '@/store/usePackStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { Preferences } from '@capacitor/preferences';

// store instance
const packStore = usePackStore()
const tryHistoryStore = useTryHistoryStore()


const router = useRouter()
const cart = useCartStore()
const tryHistory = useTryHistoryStore()
const { getLocation } = useLocationStore()

console.log(cart)

const loading = ref(false)
const location = ref<any>(null)
const checkoutMethod = ref<'trynbuy' | 'standard' | string>('trynbuy')

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
  const total = distance.value.forwardKm * 10 + distance.value.backwardKm * 5
  return Math.max(30, Math.round(total))
})

/* ✅ Total Item Count */
const totalItem = computed(() =>
  activeGroups.value
    .flatMap(g => g.companies)
    .flatMap(c => c.items)
    .reduce((sum, item) => sum + (item.quantity || 0), 0)
)

/* ✅ Waiting Time & Fees */
const waitingTime = computed(() => {
  if (totalItem.value <= 0) return 0
  return totalItem.value <= 5
    ? 20
    : 20 + (totalItem.value - 5) * 4
})
const waitingFee = computed(() => waitingTime.value * 0.5)

/* ========== PICK TIME MODAL ========== */
const isPickTimeModalOpen = ref(false)
const closePickTimeModal = () => (isPickTimeModalOpen.value = false)

const openPickTimeModal = async () => {
  const { value: token } = await Preferences.get({ key: 'token' })

  if (token) {
    isPickTimeModalOpen.value = true
  } else {
    router.push('/login')
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
  } catch (err) {
    console.error('Init error:', err)
  }
})

/* ========== CHECKOUT ========== */
const checkout = async () => {
  loading.value = true
  await cart.loadCart()

  const locationToast = await toastController.create({
    message: 'Please set a delivery address',
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

  if (!location.value) {
    await locationToast.present()
    loading.value = false
    return
  }

  try {
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
      locationId: location.value.id,
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

     const existing = packStore.getById(orderRes.trynbuy.trynbuy_id)
      if (existing) {
        packStore.update(orderRes.trynbuy.trynbuy_id, orderRes.trynbuy)
      } else {
        packStore.add(orderRes.trynbuy)
      }
      tryHistoryStore.updateOrderStatus(orderRes.trynbuy.trynbuy_id, orderRes.order_status)
    

    await tryHistory.fetchFromApi()

    for (const group of activeGroups.value) {
      for (const company of group.companies) {
        await cart.removeByCompanyId(company.companyId)
      }
    }

    deliveryTime.value = null
    deliveryType.value = null
    activeGroups.value = []

    router.push('/ordersuccess')
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

  const query = new URLSearchParams()
  coords.forEach(coord => query.append('coords', coord))
  router.push(`/nearbyshops?${query.toString()}`)
}
</script>
