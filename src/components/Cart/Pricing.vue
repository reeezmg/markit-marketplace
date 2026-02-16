<template>
  <div class="cart-summary-card space-y-3 p-3">
    <label for="checkoutMethod" class="cart-summary-title block mb-3">
      Order Summary
    </label>

    <div class="summary-row flex items-center justify-between">
      <div class="text-sm">Subtotal</div>
      <div class="text-sm font-medium">&#8377;{{ subtotal.toFixed(2) }}</div>
    </div>

    <div class="summary-row flex items-center justify-between">
      <div class="text-sm">Discount</div>
      <div class="text-sm font-medium">- &#8377;{{ totalDiscount.toFixed(2) }}</div>
    </div>

    <div v-if="totalItem > 0" class="flex flex-col">
      <div class="summary-row flex items-center justify-between">
        <div class="text-sm">
          Max Waiting Time ({{ totalItem }} Item<span v-if="totalItem > 1">s</span>)
        </div>
        <div class="text-sm font-medium">{{ waitingTime }} min</div>
      </div>
      <div class="summary-note text-xs ml-1">
        20 min for 1-5 items, +4 min for each extra item
      </div>
    </div>

    <div v-if="shipping > 0" class="flex flex-col">
      <div class="summary-row flex items-center justify-between">
        <div class="text-sm">Delivery</div>
        <div class="text-sm font-medium">
          <span class="line-through">&#8377;{{ shipping.toFixed(2) }}</span>
          <span class="summary-free ml-1">&#8377;0</span>
        </div>
      </div>
      <div class="summary-benefit text-xs ml-1">
        &#8377;15 deductible on purchase of every &#8377;500
      </div>
    </div>

    <div v-if="waitingFee > 0" class="flex flex-col">
      <div class="summary-row flex items-center justify-between">
        <div class="text-sm">Waiting Fee</div>
        <div class="text-sm font-medium">
          <span class="line-through">&#8377;{{ waitingFee.toFixed(2) }}</span>
          <span class="summary-free ml-1">&#8377;0</span>
        </div>
      </div>
      <div class="summary-note text-xs ml-1">
        &#8377;0.50 per minute of waiting time
      </div>
      <div class="summary-benefit text-xs ml-1">
        &#8377;20 deducted for each purchased item after trial
      </div>
    </div>

    <div class="summary-row flex items-center justify-between">
      <div class="text-sm">Total Value</div>
      <div class="text-sm font-medium">&#8377;{{ total.toFixed(2) }}</div>
    </div>

    <div>
      <div class="summary-payable-wrap flex items-center justify-between border-t pt-3 text-lg">
        <div class="summary-payable">Payable Amount</div>
        <div class="summary-payable">&#8377;0</div>
      </div>
      <div class="summary-row text-sm">
        Pay after trial for the items you keep
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  subtotal: number
  shipping: number
  totalDiscount: number
  waitingTime: number
  waitingFee: number
  totalItem: number
}>()

const total = computed(() =>
  props.subtotal + props.shipping + props.waitingFee - props.totalDiscount
)
</script>

<style scoped>
.cart-summary-card {
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
}

.cart-summary-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--markit-text);
}

.summary-row {
  color: var(--markit-text-muted);
}

.summary-note {
  color: var(--markit-text-muted);
}

.summary-benefit {
  color: var(--ion-color-primary);
}

.summary-free {
  font-weight: 700;
  color: var(--ion-color-primary);
}

.summary-payable {
  font-weight: 700;
  color: var(--ion-color-primary);
}

.summary-payable-wrap {
  border-color: var(--markit-border);
}
</style>
