<template>
  <div class="text-[#097D4C]">
    <!-- Location & Profile -->
    <div
      class="flex justify-between items-center transition-all duration-300 ease-in-out"
      :class="collapsed ? 'opacity-0 -translate-y-4 h-0 overflow-hidden' : 'opacity-100 translate-y-0 h-auto'"
    >
      <!-- Left Section -->
      <div class="flex-1 min-w-0" @click="setLocation">
        <div class="flex items-center space-x-1">
          <ion-icon :icon="navigate" class="text-[#097D4C] w-7 h-7"></ion-icon>
          <span class="font-semibold text-xl">
            {{ location.houseDetails || location.name }}
          </span>
          <ion-icon :icon="chevronDownOutline" class="w-5 h-5 text-[#097D4C]"></ion-icon>
        </div>
        <p class="text-md text-[#097D4C] font-semibold truncate">
          {{ location.formattedAddress }}
        </p>
      </div>

      <!-- Right Section -->
      <div class="pl-5">
        <ion-icon
          @click="router.push('/account')"
          :icon="personCircleOutline"
          class="text-[#097D4C] w-8 h-8"
        ></ion-icon>
      </div>
    </div>

    <!-- Search bar (always visible) -->
    <div class="mt-4 relative w-full">
      <div
        class="flex items-center w-full px-4 py-3 rounded-xl border border-gray-200  bg-white focus-within:ring-2 ring-gray-300"
      >
        <ion-icon :icon="searchOutline" class="text-gray-600 me-3 w-6 h-6"></ion-icon>
        <input
          v-model="q"
          @input="onInput"
          type="text"
          placeholder="Search..."
          class="bg-transparent w-full focus:outline-none text-base"
        />
        <button v-if="q" @click="clear" class="ms-2 text-sm">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  navigate,
  chevronDownOutline,
  personCircleOutline,
  searchOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import type { Address } from '@/api/address'

defineProps<{ location: Address; collapsed?: boolean }>()

const router = useRouter()
const q = ref('')
let timer: number | null = null

const emit = defineEmits<{ (e: 'search', value: string): void }>()

function setLocation() {
  router.push('/account/address')
}

function onInput() {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    emit('search', q.value.trim())
  }, 300)
}

function clear() {
  q.value = ''
  if (timer) window.clearTimeout(timer)
  emit('search', '')
}
</script>
