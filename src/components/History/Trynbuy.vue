<template>
  <div class="order-card p-3 mx-2" @click="goToDetails">
    <!-- Companies Section -->
    <div class="order-card-head">
      <div class="order-number">
        Order Number: {{ trynbuy.order_number }}
      </div>
      <span class="order-open-indicator">View Details</span>
    </div>

    <div class="order-items-row">
      <div
        v-for="item in trynbuy.cartitems"
        :key="item.id"
        class="order-item-tile"
      >
        <img
          v-if="item.images?.length"
          :src="`https://images.markit.co.in/${item.images[0]}`"
          alt="product"
          class="w-full h-full object-cover"
        />
        <div v-else class="order-item-fallback">
          No Image
        </div>
      </div>
    </div>

    <div class="order-status-row">
      <div>
        <div
          :class="[
            'order-status-text',
            trynbuy.packing_status === 'pending'
              ? 'status-pending'
              : trynbuy.order_status === 'cancelled'
              ? 'status-cancelled'
              : 'status-complete'
          ]"
        >
          {{ formatStatus(trynbuy.order_status) }}
        </div>
        <div class="order-date-text">
          Ordered: {{ formatDate(trynbuy.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  trynbuy: any
}>()

const router = useRouter()
console.log(props.trynbuy)

const goToDetails = () => {
  router.push({ name: 'account-order-history-detail', params: { id: props.trynbuy.trynbuy_id } })
}

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatus(status: string | null): string {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.order-card {
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  box-shadow: var(--markit-shadow-soft);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  border-color: color-mix(in srgb, var(--ion-color-primary) 28%, var(--markit-border));
}

.order-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--markit-border);
  padding: 2px 0 10px;
  margin-bottom: 2px;
}

.order-number {
  font-size: 1.05rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--markit-text);
}

.order-open-indicator {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 28%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff);
  border-radius: 999px;
  padding: 4px 8px;
}

.order-items-row {
  display: flex;
  gap: 10px;
  padding: 10px 0 12px;
  border-bottom: 1px solid var(--markit-border);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;

}

.order-items-row ::-webkit-scrollbar {
  display: none;
}

.order-item-tile {
  flex-shrink: 0;
  width: 92px;
  height: 122px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
}

.order-item-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: var(--markit-text-muted);
}

.order-status-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 10px;
}

.order-status-text {
  font-size: 1.02rem;
  line-height: 1.25;
  font-weight: 700;
}

.status-pending {
  color: #b57b00;
}

.status-cancelled {
  color: #d33c3c;
}

.status-complete {
  color: var(--ion-color-primary);
}

.order-date-text {
  margin-top: 3px;
  font-size: 0.86rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}
</style>
