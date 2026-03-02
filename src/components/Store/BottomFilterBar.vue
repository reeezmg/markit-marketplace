<template>
  <div
    class="bottom-filter-bar"
  >

<button
  class="footer-action relative"
  @click="$emit('open','sort')"
>
  <span class="footer-icon-wrap">
    <IonIcon :icon="funnelOutline" class="footer-icon" />
  </span>
  <span class="footer-label">Sort</span>
  <span v-if="props.sortCount > 0"
        class="action-badge">
    {{ props.sortCount }}
  </span>
</button>


    <div class="footer-divider"></div>

<button
  class="footer-action relative"
  @click="$emit('open','category')"
>
  <span class="footer-icon-wrap">
    <IonIcon :icon="gridOutline" class="footer-icon" />
  </span>
  <span class="footer-label">Filter</span>
  <span v-if="props.categoryCount > 0"
        class="action-badge">
    {{ props.categoryCount }}
  </span>
</button>


    <div class="footer-divider"></div>

<button
  class="footer-action relative"
  @click="$emit('open','size')"
>
  <span class="footer-icon-wrap">
    <IonIcon :icon="resizeOutline" class="footer-icon" />
  </span>
  <span class="footer-label">Size</span>
  <span v-if="props.sizeCount > 0"
        class="action-badge">
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
.bottom-filter-bar {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  justify-items: center;
  gap: 0;
  min-height: 64px;
  padding: 8px 12px calc(var(--markit-bottom-inset) + 8px);
  border-top: 1px solid var(--markit-border);
  background: var(--markit-glass-surface);
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
}

.footer-action {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  min-width: 72px;
  color: var(--markit-text);
}

.footer-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.footer-icon {
  width: 24px;
  height: 24px;
}

.footer-label {
  font-size: 12px;
  font-weight: 600;
}

.action-badge {
  position: absolute;
  top: -2px;
  right: 10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #097d4c;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.footer-divider {
  height: 20px;
  background: var(--markit-border-strong);
}
</style>
