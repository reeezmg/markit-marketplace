<template>
  <div class="dt-wrapper" v-if="packed || events.length > 0">
    <div class="dt-header">
      <span class="dt-label">Delivery progress</span>
      <span class="dt-status" :class="statusClass">{{ statusText }}</span>
    </div>

    <div class="dt-bar-track">
      <div class="dt-bar-fill" :style="{ width: progressPercent + '%' }" />
    </div>

    <div v-if="packedStoreStatuses.length" class="dt-packed-list">
      <div v-for="(label, index) in packedStoreStatuses" :key="`${label}-${index}`" class="dt-packed-item">
        {{ label }} products Packed
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DeliveryStoreRef, DeliveryStepEvent } from '@/utils/deliveryProgress'
import { getDeliveryProgressState } from '@/utils/deliveryProgress'

const props = defineProps<{
  events: DeliveryStepEvent[]
  storeCount?: number
  packed?: boolean
  stores?: DeliveryStoreRef[]
}>()

const resolvedStores = computed(() =>
  props.stores?.length
    ? props.stores
    : Array.from({ length: Math.max(props.storeCount ?? 1, 1) }, (_, index) => ({
        id: `store-${index}`,
        name: `Store ${index + 1}`,
      }))
)

const deliveryState = computed(() =>
  getDeliveryProgressState(
    props.events,
    resolvedStores.value,
    !!props.packed
  )
)

const progressPercent = computed(() => deliveryState.value.progressPercent)
const statusText = computed(() => deliveryState.value.statusText)
const packedStoreStatuses = computed(() => deliveryState.value.packedStoreStatuses || [])
const statusClass = computed(() => {
  const text = statusText.value.toLowerCase()
  if (text.includes('delivered') || text.includes('complete')) return 'delivered'
  return 'in-progress'
})
</script>

<style scoped>
.dt-wrapper {
  background: #ffffff;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
}

.dt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 12px;
}

.dt-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.dt-status {
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
  text-align: right;
}

.dt-status.delivered {
  color: #16a34a;
}

.dt-status.in-progress {
  color: #2563eb;
}

.dt-bar-track {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.dt-bar-fill {
  height: 100%;
  border-radius: 99px;
  background: #2563eb;
  transition: width 0.4s ease;
}

.dt-packed-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
}

.dt-packed-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  color: #374151;
  font-size: 12px;
  font-weight: 600;
}
</style>
