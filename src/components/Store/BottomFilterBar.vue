<template>
  <div
    class="bottom-filter-bar fixed bottom-4 left-0 right-0 z-50 flex items-center gap-3
          px-4 py-3 justify-around shadow-lg rounded-full mx-auto w-[65%] iced"
  >

<button
  class="flex items-center gap-2 text-[13px] relative"
  @click="$emit('open','sort')"
>
  <IonIcon :icon="funnelOutline" class="text-[14px]" />
  Sort
  <span v-if="props.sortCount > 0"
        class="absolute -top-1.5 -right-4 bg-[#097D4C] text-white text-[10px] px-1 py-0.25 rounded-full">
    {{ props.sortCount }}
  </span>
</button>


    <div class="w-px h-5 bg-gray-300"></div>

<button
  class="flex items-center gap-2 text-[13px] relative"
  @click="$emit('open','category')"
>
  <IonIcon :icon="gridOutline" class="text-[14px]" />
  Category
  <span v-if="props.categoryCount > 0"
        class="absolute -top-1.5 -right-4 bg-[#097D4C] text-white text-[10px] px-1 py-0.25 rounded-full">
    {{ props.categoryCount }}
  </span>
</button>


    <div class="w-px h-5 bg-gray-300"></div>

<button
  class="flex items-center gap-2 text-[13px] relative"
  @click="$emit('open','size')"
>
  <IonIcon :icon="resizeOutline" class="text-[14px]" />
  Size
  <span v-if="props.sizeCount > 0"
        class="absolute -top-1.5 -right-4 bg-[#097D4C] text-white text-[10px] px-1 py-0.25 rounded-full">
    {{ props.sizeCount }}
  </span>
</button>


    <!-- <div class="w-px h-5 bg-gray-300"></div> -->

    <!-- <button
      class="flex items-center gap-2 text-[13px]"
      @click="$emit('open','brand')"
    >
      <IonIcon :icon="pricetagOutline" class="text-[14px]" />
      Brand
    </button> -->

  </div>
</template>

<script setup>
const props = defineProps({
  sortCount: { type: Number, default: 0 },
  categoryCount: { type: Number, default: 0 },
  sizeCount: { type: Number, default: 0 }
});

import { IonIcon } from "@ionic/vue";
import {
  funnelOutline,
  gridOutline,
  resizeOutline,
  pricetagOutline,
} from "ionicons/icons";
</script>

<style scoped>
.iced {
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.bottom-filter-bar {
  bottom: var(--markit-bottom-inset);
}
</style>
