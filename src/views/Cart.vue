<template>
  <ion-page>
    <Topbar/>
    <ion-content :fullscreen="true" color="light">
      <!-- Items (grouped by companyId) -->
       <div v-if="cart.items.length">
      <Item @groupedCart="updateGroupedCart" />

      <!-- Checkout flow -->
      <CheckoutMethod v-model:method="checkoutMethod" />
      <!-- <Applycoupon /> -->
      <Address />
      <Pricing
        :subtotal="subtotal"
        :shipping="shipping"
        :totalDiscount="totalDiscount"
        :handling = "handling"
        :bagCount = "bagCount"
      />
      </div>

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

    <ion-footer  v-if="cart.items.length" class="bg-white rounded-t-xl">
       <!-- ✅ Delivery Time Box -->
      <div v-if="deliveryType" class="p-3 mx-2 my-2 ">
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
import { IonPage, IonFooter,IonSpinner, IonButton, IonContent, onIonViewWillEnter } from '@ionic/vue'
import { ref, computed } from 'vue'
import { useCartStore } from '@/store/useCartStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import PickTimeModal from '@/components/Cart/PickTimeModal.vue'
import { useLocationStore } from '@/composables/useLocationStore'
import { postCheckout } from '@/api/api'
import { format, addHours } from 'date-fns'
import { toastController } from '@ionic/vue'
import { useRouter } from 'vue-router';
import { getDistanceInKm } from '@/composables/useDistance'

const router = useRouter();
const cart = useCartStore()
const tryHistory = useTryHistoryStore()
const { removeByCompanyId } = useCartStore()
const { getLocation } = useLocationStore()

const loading = ref(false)

// ✅ active group from child
const activeGroup = ref<{ companyId: string; companyName: string; companyLogo:string; companyLat:string; companyLng:string; items: any[] }>({
  companyId: '',
  companyName:'',
  companyLat:'',
  companyLng:'',
  companyLogo:'',
  items: []
})

const updateGroupedCart = (grouped: { companyId: string; companyName: string; companyLogo:string; companyLat:string; companyLng:string; items: any[] }) => {
  activeGroup.value = grouped
  console.log('Active group in parent:', grouped)
}

// ✅ checkout method
const checkoutMethod = ref('trynbuy')

// ✅ coupon state in parent
const appliedCoupon = ref<string | null>(null)
const setCoupon = (code: string) => {
  appliedCoupon.value = code
  console.log('Applied coupon in parent:', code)
}

// 🧮 subtotal = sum of (price * qty)
const subtotal = computed(() =>
  activeGroup.value.items.reduce((sum, item) => sum + item.sprice * item.quantity, 0)
)

// 🧮 discount = product discounts + coupon
const productDiscount = computed(() =>
  activeGroup.value.items.reduce(
    (sum, item) =>
      sum + (item.sprice * (item.discount / 100)) * item.quantity,
    0
  )
)

// Example: flat 10% off coupon "SAVE10"
const couponDiscount = computed(() => {
  if (appliedCoupon.value === 'SAVE10') {
    return subtotal.value * 0.1
  }
  return 0
})

const totalDiscount = computed(() => productDiscount.value + couponDiscount.value)

const distance = ref<{ forwardKm: number; backwardKm: number } | null>(null)

const shipping = computed(() => {
  if (!distance.value) return 0

  // Forward = ₹10/km, Backward = ₹5/km
  const forwardCost = distance.value.forwardKm * 10
  const backwardCost = distance.value.backwardKm * 5

  const total = Math.round(forwardCost + backwardCost)

  // Minimum shipping ₹30
  return total < 30 ? 30 : total
})

// 🧮 Bag count (5 items per bag)
const bagCount = computed(() => {
  if (!activeGroup.value.items.length) return 0
  return Math.ceil(activeGroup.value.items.length / 5)
})

// 🧮 Handling = bagCount * 20
const handling = computed(() => {
  return bagCount.value * 20
})

// ✅ Pick time modal
const isPickTimeModalOpen = ref(false)
const closePickTimeModal = () => {
  isPickTimeModalOpen.value = false
}
const openPickTimeModal = () => {
  isPickTimeModalOpen.value = true
}

// ✅ delivery time + type
const deliveryTime = ref<string | null>(null)
const deliveryType = ref<string | null>(null)

const getDeliveryTime = (time: { slot: string; type: string }) => {
  deliveryTime.value = time.slot
  deliveryType.value = time.type
}


// ✅ checkout using only active group
const location = ref()

onIonViewWillEnter(async () => {
  try {
    await cart.loadCart()
    location.value = await getLocation()

    if (activeGroup.value.companyId && location.value) {
      // shop address (replace with real shop lat,lng)
      const shopLatLng = `${activeGroup.value.companyLat},${activeGroup.value.companyLng}`
      // customer address
      const customerLatLng = `${location.value.lat},${location.value.lng}`

      distance.value = await getDistanceInKm(shopLatLng, customerLatLng)
      console.log('Distance:', distance.value, 'km')
    }
  } catch (error) {
    console.error('Failed to load cart items:', error)
  }
})


// ✅ Format delivery time
const formattedDeliveryTime = computed(() => {
  if (!deliveryType.value) return ''

  const now = new Date()

  // ✅ Case 1: Instant delivery
  if (deliveryType.value === 'instant') {
    let delivery = addHours(now, 1)

    // Round minutes to nearest 0 or 30
    const minutes = delivery.getMinutes()
    if (minutes < 15) {
      delivery.setMinutes(0, 0, 0)
    } else if (minutes < 45) {
      delivery.setMinutes(30, 0, 0)
    } else {
      delivery.setHours(delivery.getHours() + 1)
      delivery.setMinutes(0, 0, 0)
    }

    deliveryTime.value = delivery.toISOString()

    const today = new Date().toDateString()
    const tomorrow = addHours(now, 24).toDateString()

    const dateLabel =
      delivery.toDateString() === today
        ? 'Today'
        : delivery.toDateString() === tomorrow
        ? 'Tomorrow'
        : format(delivery, 'EEEE, d MMM')

    return `${format(delivery, 'h:mm a')}, ${dateLabel}`
  }

  // ✅ Case 2: Later delivery (user-selected slot)
  if (deliveryType.value === 'later' && deliveryTime.value) {
    const selected = new Date(deliveryTime.value)

    const today = new Date().toDateString()
    const tomorrow = addHours(now, 24).toDateString()

    const dateLabel =
      selected.toDateString() === today
        ? 'Today'
        : selected.toDateString() === tomorrow
        ? 'Tomorrow'
        : format(selected, 'EEEE, d MMM')

    return `${format(selected, 'h:mm a')}, ${dateLabel}`
  }

  return ''
})



const checkout = async () => {
  loading.value = true
  await cart.loadCart()
  const locationToast = await toastController.create({
        message: 'Please set a delivery address',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
  const errorToast = await toastController.create({
        message: 'Something went wrong',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });

    const noInternetToast = await toastController.create({
      message: 'No internet connection. Please check your network.',
      duration: 3000,
      color: 'danger',
      position: 'bottom'
    });

  if (!location.value) {
      await locationToast.present();
      return
  }

  try{ 

  await postCheckout({
    companyId: activeGroup.value.companyId,
    cartItems: activeGroup.value.items,
    locationId: location.value.id,
    checkoutMethod: checkoutMethod.value,
    subtotal: subtotal.value,
    productDiscount: productDiscount.value,
    totalDiscount: totalDiscount.value,
    shipping: shipping.value,
    deliveryType: deliveryType.value,
    deliveryTime: deliveryTime.value,
  })
  router.push('/ordersuccess');
  tryHistory.fetchFromApi()
  removeByCompanyId(activeGroup.value.companyId)
  }
  catch (error) {
  if (!error.response) {
    // No server response = network error
    await noInternetToast.present()
  } else {
    // Server responded with an error
    const serverMessage = error.response.data?.error || 'Something went wrong'

    const stockToast = await toastController.create({
      message: serverMessage,  // will show "Insufficient stock for item xyz"
      duration: 5000,
      color: 'danger',
      position: 'bottom'
    });

    await stockToast.present()
  }

}finally{
  loading.value = false
}

}


</script>
