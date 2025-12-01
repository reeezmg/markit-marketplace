<template>
  <!-- Header: Switch between cart groups -->
  <div class="flex justify-between items-center mb-4 bg-white p-3 mx-2 my-3 rounded-lg">
    <Badge
      size="lg"
      v-if="groupCount > 1"
      @click="prevGroup"
      color="secondary"
      variant="outline"
    >&lt;</Badge>

    <!-- Active cart group display -->
    <div class="flex flex-row justify-center items-center gap-4">
      <template v-for="(company, idx) in activeGroup.companies" :key="company.companyId">
        <div
          class="flex flex-row items-center gap-2 transition-all duration-300"
          :class="{ 'opacity-100': idx === 0, 'opacity-75': idx !== 0 }"
        >
          <div class="flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden bg-gray-100">
            <img
              :src="`https://images.markit.co.in/${company.companyLogo}`"
              alt="logo"
              class="w-full h-full object-fill"
            />
          </div>
          <div class="flex flex-col justify-between py-[1px]">
            <div class="text-base font-semibold leading-none">{{ company.companyName }}</div>
            <div class="text-xs text-[#097D4C]">View Products</div>
          </div>
        </div>
      </template>
    </div>

    <Badge
      size="lg"
      v-if="groupCount > 1"
      @click="nextGroup"
      color="secondary"
      variant="outline"
    >&gt;</Badge>
  </div>

  <!-- Item list -->
  <div>
    <template v-if="activeGroup && activeGroup.companies?.length">
      <div
        v-for="company in activeGroup.companies"
        :key="company.companyId"
        class="bg-white p-3 mx-2 my-3 rounded-lg"
      >
        <div
          class="flex items-center justify-center gap-2 text-lg font-semibold mb-3 w-full border-b border-gray-300 pb-1"
        >
          <IonIcon :icon="bagHandleOutline" class="text-gray-600 mb-2 w-7 h-7" />
          {{ company.companyName }}’s Items
        </div>

        <ul role="list" class="divide-y divide-gray-200">
          <li
            v-for="cartItem in company.items"
            :key="`${cartItem.id}-${cartItem.selectedSize || 'nosize'}`"
            class="flex py-6"
          >
            <div class="flex justify-between w-full gap-x-5">
              <div class="w-32 h-32 rounded-md">
                <img
                  v-if="cartItem.images?.length"
                  :src="`https://images.markit.co.in/${cartItem.images[0]}`"
                  class="w-full h-full object-cover rounded-md"
                />
              </div>

              <div class="flex flex-col w-full justify-between p-1">
                <div class="min-w-0">
                  <div class="text-md">
                    <a :href="`products/${cartItem.id}`" class="font-medium">
                      {{ cartItem.productName }} - {{ cartItem.name }}
                    </a>
                  </div>

                  <p v-if="cartItem.selectedSize" class="mt-1 text-sm text-gray-500">
                    Size: {{ cartItem.selectedSize }}
                  </p>

                  <div>
                    <p class="text-sm font-medium">
                      <span v-if="cartItem.discount > 0">
                        <del class="text-gray-400">₹{{ cartItem.sprice.toFixed(2) }}</del>
                        <span class="ml-1 text-green-500">
                          ₹{{ (cartItem.sprice * (1 - cartItem.discount / 100)).toFixed(2) }}
                        </span>
                      </span>
                      <span v-else>₹{{ cartItem.sprice.toFixed(2) }}</span>
                    </p>
                  </div>
                </div>

                <div class="flex flex-row justify-between items-center">
                  <div class="flex items-center gap-3 me-4">
                    <Badge size="lg" @click="decrement(cartItem)" color="secondary" variant="outline">-</Badge>
                    <span class="text-sm">{{ cartItem.quantity }}</span>
                    <Badge size="lg" @click="increment(cartItem)" color="secondary" variant="outline">+</Badge>
                  </div>
                  <button @click="removeAll(cartItem)" class="text-gray-500 hover:text-red-500">
                    <ion-icon :icon="trash" class="w-6 h-6 text-red-500"></ion-icon>
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
import { IonIcon, onIonViewWillEnter, createGesture } from '@ionic/vue'
import Badge from '../Badge.vue'
import { useCartStore } from '@/store/useCartStore'
import { ref, computed, onMounted, watch } from 'vue'

const emit = defineEmits<{
  (e: 'groupedCart', payload: {
    cartNumber: number
    companies: {
      companyId: string
      companyName: string
      companyLogo: string
      companyLat: string
      companyLng: string
      companyLocationId: string
      items: any[]
    }[]
  }): void
}>()

const cart = useCartStore()

/* --- Navigation between cart groups --- */
const activeGroupIndex = ref(0)
const groupCount = computed(() => cart.groups.length)
const activeGroup = computed(() => cart.groups[activeGroupIndex.value] || { companies: [] })

function nextGroup() {
  activeGroupIndex.value = (activeGroupIndex.value + 1) % groupCount.value
}
function prevGroup() {
  activeGroupIndex.value = (activeGroupIndex.value - 1 + groupCount.value) % groupCount.value
}

/* --- Emit active group --- */
watch([() => cart.groups, activeGroupIndex], () => {
  const currentGroup = activeGroup.value
  emit('groupedCart', {
    cartNumber: currentGroup.cartNumber,
    companies: currentGroup.companies || [],
  })
}, { deep: true, immediate: true })

/* --- Cart item controls --- */
function increment(item: any) {
  item.quantity += 1
  cart.saveCart()
}
function decrement(item: any) {
  if (item.quantity > 1) item.quantity -= 1
  else removeAll(item)
  cart.saveCart()
}
function removeAll(item: any) {
  for (const group of cart.groups) {
    for (const company of group.companies) {
      const idx = company.items.findIndex(
        (i: any) => i.id === item.id && i.selectedSize === item.selectedSize
      )
      if (idx !== -1) {
        company.items.splice(idx, 1)
      }
    }
    group.companies = group.companies.filter(c => c.items.length > 0)
  }

  // Remove empty groups
  cart.groups = cart.groups.filter(g => g.companies.length > 0)
  cart.saveCart()
}

/* --- Load cart when view opens --- */
onIonViewWillEnter(async () => {
  await cart.loadCart()
})

/* --- Swipe gesture between cart groups --- */
onMounted(() => {
  if (groupCount.value > 1) {
    const gesture = createGesture({
      el: document.querySelector('.bg-white') as HTMLElement,
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
