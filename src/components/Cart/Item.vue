<template>
  <div
    class="flex justify-between items-center mb-4 bg-white p-3 mx-2 my-3 rounded-lg"
  >
    <Badge
      size="lg"
      v-if="companyIds.length > 1"
      @click="prevGroup"
      color="secondary"
      variant="outline"
    >
      &lt;
    </Badge>

    <div class="flex flex-row justify-center">
      <div class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
        <img
          :src="`https://images.markit.co.in/${activeCompanyLogo}`"
          alt="product"
          class="w-full h-full object-cover"
        />
      </div>
      <div class="flex flex-col justify-between ms-3 py-[0.5px]">
        <div class="text-xl leading-none">
          {{ activeCompanyName }}
        </div>
        <div class="text-sm font-semibold text-[#097D4C]">
          View Products
        </div>
      </div>
    </div>

    <Badge
      size="lg"
      v-if="companyIds.length > 1"
      @click="nextGroup"
      color="secondary"
      variant="outline"
    >
      &gt;
    </Badge>
  </div>

  <div class="">
    <!-- Bags inside active group -->
    <template v-if="bagsByCompany[activeCompanyId]">
      <div
        v-for="(bag, bagIndex) in bagsByCompany[activeCompanyId]"
        :key="bagIndex"
        class="bg-white p-3 mx-2 my-3 rounded-lg"
      >
        <!-- Bag Heading -->
        <div
          class="flex items-center justify-center gap-2 text-lg font-semibold mb-3 w-full border-b border-gray-300 pb-1"
        >
          <IonIcon :icon="bagHandleOutline" class="text-gray-600 mb-2 w-7 h-7" />
          Bag {{ bagIndex + 1 }}
        </div>

        <!-- Items in bag -->
        <ul role="list" class="divide-y divide-gray-200">
          <li
            v-for="cartItem in bag"
            :key="`${cartItem.id}-${cartItem.selectedSize || 'nosize'}`"
            class="flex py-6"
          >
            <div class="flex justify-between w-full gap-x-5">
              <!-- Image -->
              <div>
                <img
                  v-if="cartItem.images?.length"
                  :src="`https://images.markit.co.in/${cartItem.images[0]}`"
                  class="w-44 h-34 rounded-md"
                />
              </div>

              <!-- Details -->
              <div class="flex flex-col w-full justify-between p-1">
                <div class="min-w-0">
                  <div class="text-md">
                    <a :href="`products/${cartItem.id}`" class="font-medium">
                      {{ cartItem.productName }} - {{ cartItem.name }}
                    </a>
                  </div>

                  <!-- Size -->
                  <p
                    v-if="cartItem.selectedSize"
                    class="mt-1 text-sm text-gray-500"
                  >
                    Size: {{ cartItem.selectedSize }}
                  </p>

                  <!-- Price -->
                  <div>
                    <p class="text-sm font-medium">
                      <span v-if="cartItem.discount > 0">
                        <del class="text-gray-400"
                          >₹{{ cartItem.sprice.toFixed(2) }}</del
                        >
                        <span class="ml-1 text-green-500">
                          ₹{{
                            (
                              cartItem.sprice *
                              (1 - cartItem.discount / 100)
                            ).toFixed(2)
                          }}
                        </span>
                      </span>
                      <span v-else>
                        ₹{{ cartItem.sprice.toFixed(2) }}
                      </span>
                    </p>
                  </div>
                </div>

                <!-- Qty controls -->
                <div class="flex flex-row justify-between items-center">
                  <div class="flex items-center gap-3 me-4">
                    <Badge
                      size="lg"
                      @click="decrement(cartItem)"
                      color="secondary"
                      variant="outline"
                    >
                      -
                    </Badge>
                    <span class="text-sm">{{ cartItem.quantity }}</span>
                    <Badge
                      size="lg"
                      @click="increment(cartItem)"
                      color="secondary"
                      variant="outline"
                    >
                      +
                    </Badge>
                  </div>
                  <button
                    @click="removeAll(cartItem)"
                    class="text-gray-500 hover:text-red-500"
                  >
                    <ion-icon
                      :icon="trash"
                      class="w-6 h-6 text-red-500"
                    ></ion-icon>
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>

    <p v-else class="text-center text-gray-500">No items in this group.</p>
  </div>
</template>

<script setup lang="ts">
import { trash, bagHandleOutline } from 'ionicons/icons'
import { IonIcon, onIonViewWillEnter } from '@ionic/vue'
import Badge from '../Badge.vue'
import { useCartStore } from '@/store/useCartStore'
import { ref, computed, onMounted, watch } from 'vue'
import { createGesture } from '@ionic/vue'

const emit = defineEmits<{
  (e: 'groupedCart', payload: {
    companyId: string
    companyName: string
    companyLogo: string
    companyLat: string
    companyLng: string
    items: any[]
  }): void
}>()

const cart = useCartStore()

// --- Group items by companyId ---
// Add sort so that company with most recently added item comes first
const groupedCart = computed(() => {
  const groups: Record<string, {
    name: string
    logo: string
    lat: string
    lng: string
    items: any[]
    lastAddedIndex: number
  }> = {}

  cart.items.forEach((item, index) => {
    const cid = item.companyId || 'unknown'
    const cname = item.companyName || 'Unknown'
    const clogo = item.companyLogo || null
    const clat = item.companyLat || null
    const clng = item.companyLng || null

    if (!groups[cid]) {
      groups[cid] = {
        name: cname,
        logo: clogo,
        lat: clat,
        lng: clng,
        items: [],
        lastAddedIndex: index
      }
    }
    groups[cid].items.push(item)
    groups[cid].lastAddedIndex = index // update to latest index seen
  })

  // Sort groups by lastAddedIndex (descending = most recent first)
  const sortedEntries = Object.entries(groups).sort(
    (a, b) => b[1].lastAddedIndex - a[1].lastAddedIndex
  )

  const sortedGroups: typeof groups = {}
  for (const [cid, group] of sortedEntries) {
    sortedGroups[cid] = group
  }

  return sortedGroups
})

// --- Bags: split items into groups of 5 ---
function splitIntoBags(items: any[], size = 5) {
  const bags: any[][] = []
  for (let i = 0; i < items.length; i += size) {
    bags.push(items.slice(i, i + size))
  }
  return bags
}

const bagsByCompany = computed(() => {
  const bags: Record<string, any[][]> = {}
  for (const cid in groupedCart.value) {
    bags[cid] = splitIntoBags(groupedCart.value[cid].items, 5)
  }
  return bags
})

// --- Track active group ---
const companyIds = computed(() => Object.keys(groupedCart.value))
const activeIndex = ref(0)
const activeCompanyId = computed(() => companyIds.value[activeIndex.value] || '')
const activeCompanyName = computed(
  () => groupedCart.value[activeCompanyId.value]?.name || ''
)
const activeCompanyLogo = computed(
  () => groupedCart.value[activeCompanyId.value]?.logo || ''
)

// ✅ emit active group with companyId + companyName
watch([groupedCart, activeIndex], () => {
  const cid = activeCompanyId.value
  if (cid) {
    emit('groupedCart', {
      companyId: cid,
      companyName: groupedCart.value[cid].name,
      companyLogo: groupedCart.value[cid].logo,
      items: groupedCart.value[cid].items,
      companyLat: groupedCart.value[cid].lat,
      companyLng: groupedCart.value[cid].lng,
    })
  }
}, { deep: true, immediate: true })

// --- Navigation ---
function nextGroup() {
  activeIndex.value = (activeIndex.value + 1) % companyIds.value.length
}
function prevGroup() {
  activeIndex.value =
    (activeIndex.value - 1 + companyIds.value.length) % companyIds.value.length
}

// --- Cart actions ---
function increment(item: any) {
  item.quantity += 1
  cart.saveCart()
}
function decrement(item: any) {
  if (item.quantity > 1) {
    item.quantity -= 1
    cart.saveCart()
  } else {
    removeAll(item)
  }
}
function removeAll(item: any) {
  cart.items = cart.items.filter(
    (i) => !(i.id === item.id && i.selectedSize === item.selectedSize)
  )
  cart.saveCart()
}

// --- Load cart ---
onIonViewWillEnter(async () => {
  try {
    await cart.loadCart()
  } catch (error) {
    console.error('Failed to load cart items:', error)
  }
})

// --- Add swipe gestures (only if >1 group) ---
onMounted(() => {
  if (companyIds.value.length > 1) {
    const gesture = createGesture({
      el: document.querySelector('.bg-white') as HTMLElement,
      gestureName: 'swipe',
      onMove: ev => {
        if (ev.deltaX > 100) prevGroup()   // swipe right
        if (ev.deltaX < -100) nextGroup() // swipe left
      },
    })
    gesture.enable()
  }
})
</script>
