<template>
  <div class="rounded-lg bg-white space-y-3 p-3 mx-2 my-3">
    <label for="checkoutMethod" class="block font-semibold text-md mb-3">
      Order Summary
    </label>

    <!-- Subtotal -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Subtotal</div>
      <div class="text-sm font-medium">₹{{ subtotal.toFixed(2) }}</div>
    </div>

        <!-- Discount -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Discount</div>
      <div class="text-sm font-medium">- ₹{{ totalDiscount.toFixed(2) }}</div>
    </div>

     <!-- Waiting Time -->
    <div v-if="totalItem > 0" class="flex flex-col">
      <div class="flex items-center justify-between text-gray-600">
        <div class="text-sm">
          Max Waiting Time ({{ totalItem }} Item<span v-if="totalItem > 1">s</span>)
        </div>
        <div class="text-sm font-medium">{{ waitingTime }} min</div>
      </div>
      <div class="text-xs text-gray-500 ml-1">
        20 min for 1–5 items, +4 min for each extra item
      </div>
    </div>

    <!-- Delivery -->
    <div v-if="shipping > 0" class="flex flex-col">
      <div class="flex items-center justify-between text-gray-600">
        <div class="text-sm">Delivery</div>
        <div class="text-sm font-medium">
          <span class="line-through">₹{{ shipping.toFixed(2) }}</span>
          <span class="font-bold text-[#097D4C] ml-1">₹0</span>
        </div>
      </div>
      <div class="text-xs text-green-600 ml-1">
        ₹15 deductible on purchase of every ₹500
      </div>
    </div>


    <!-- Waiting Fees -->
    <div v-if="waitingFee > 0" class="flex flex-col">
      <div class="flex items-center justify-between text-gray-600">
        <div class="text-sm">Waiting Fee</div>
        <div class="text-sm font-medium">
           <span class="line-through">₹{{ waitingFee.toFixed(2) }}</span>
          <span class="font-bold text-[#097D4C] ml-1">₹0</span>
        </div>
      </div>
      <div class="text-xs text-gray-500 ml-1">
        ₹0.50 per minute of waiting time
      </div>
      <div class="text-xs text-green-600 ml-1">
        ₹20 deducted for each purchased item after trial
      </div>
    </div>

    <!-- Total Value -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Total Value</div>
      <div class="text-sm font-medium">₹{{ total.toFixed(2) }}</div>
    </div>

    <!-- Payable Amount -->
    <div>
      <div
        class="flex items-center justify-between border-t pt-3 text-lg text-gray-300"
      >
        <div class="font-semibold text-[#097D4C]">Payable Amount</div>
        <div class="font-semibold text-[#097D4C]">₹0</div>
      </div>
      <div class="text-sm text-gray-600">
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
