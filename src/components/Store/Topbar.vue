<template>
   <div class="flex justify-between items-center">
      <div>
          <ion-buttons slot="start">
              <ion-back-button default-href="/" :text="name" class="text-[#097D4C]"></ion-back-button>
          </ion-buttons>
      </div>

      <div class="flex flex-row gap-4 justify-center items-center">
        <!-- Wishlist Button -->
        <button
          @click="router.push('/whishlist')"
          class="flex flex-col items-center text-green-800"
        >
          <ion-icon :icon="heartOutline" class="w-7 h-7"></ion-icon>
        </button>

        <!-- Cart Button -->
        <button
          @click="router.push('/cart')"
          class="relative flex flex-col items-center text-green-800"
        >
          <ion-icon :icon="cartOutline" class="w-7 h-7"></ion-icon>

          <!-- Cart Badge -->
          <ion-badge
            v-if="totalCartCount > 0"
            class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
          >
            {{ totalCartCount }}
          </ion-badge>
        </button>

      <div class="relative flex flex-col items-center">
         <ion-icon @click="router.push('/account')" :icon="personCircleOutline" class=" text-[#097D4C] w-7 h-7" ></ion-icon>
      </div>
      </div>
      <!-- <div>
         <ion-icon @click="router.push('/account')" :icon="personCircleOutline" class=" text-[#097D4C] w-8 h-8" ></ion-icon>
      </div> -->
    </div>
  <div class="mt-2 relative w-full">
    <div class="mt-4 relative w-full">
      <div class="flex items-center w-full px-4 py-3 rounded-2xl bg-gray-100 focus-within:ring-2 ring-gray-300">
        <ion-icon :icon="searchOutline" class="text-[#097D4C] me-3 w-6 h-6"></ion-icon>
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
import { computed, ref } from "vue";
import { IonIcon, IonBackButton,IonButtons } from "@ionic/vue";
import { searchOutline, heartOutline, cartOutline } from "ionicons/icons";
import { personCircleOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useCartStore } from "@/store/useCartStore";

const router = useRouter();
const cartStore = useCartStore()

const q = ref("");
let timer: number | null = null;

// emit search event (debounced)
const emit = defineEmits<{
  (e: "search", value: string): void;
}>();

const props = defineProps({
  name:String
})

// ✅ Correct total item count for nested cartGroups -> companies -> items
const totalCartCount = computed(() => {
  if (!Array.isArray(cartStore.groups)) return 0

  return cartStore.groups.reduce((groupSum, group) => {
    const groupTotal = (group.companies ?? []).reduce((companySum, company) => {
      const companyTotal = (company.items ?? []).reduce(
        (itemSum, item) => itemSum + (item.quantity ?? 0),
        0
      )
      return companySum + companyTotal
    }, 0)
    return groupSum + groupTotal
  }, 0)
})

function onInput() {
  if (timer) window.clearTimeout(timer);
  // debounce 300ms
  timer = window.setTimeout(() => {
    emit("search", q.value.trim());
  }, 300);
}

function clear() {
  q.value = "";
  if (timer) window.clearTimeout(timer);
  emit("search", "");
}
</script>
