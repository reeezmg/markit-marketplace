<!-- Pricing.vue -->
<template>
  <div class="rounded-lg bg-white space-y-3 p-3 mx-2 my-3 ">
    <label
      for="checkoutMethod"
      class="block font-semibold text-md mb-3 "
    >
      Order Summary
    </label>

    <!-- Subtotal -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Subtotal</div>
      <div class="text-sm font-medium">₹{{ subtotal.toFixed(2) }}</div>
    </div>

    <!-- Delivery -->
    <div v-if="bagCount > 0" class="flex flex-col">
      <div class="flex items-center justify-between text-gray-600">
         <div class="text-sm">Delivery</div>
        <div class="text-sm font-medium">₹{{ shipping.toFixed(2) }}</div>
      </div>
      <div class="text-xs text-gray-500 ml-1">
        ₹15 deductible on purchase of every ₹500
      </div>
    </div>

    <!-- Discount -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Discount</div>
      <div class="text-sm font-medium">- ₹{{ totalDiscount.toFixed(2) }}</div>
    </div>

    <!-- Handling / Bag Service Fee -->
    <div v-if="bagCount > 0" class="flex flex-col">
      <div class="flex items-center justify-between text-gray-600">
        <div class="text-sm">Handling Fee ({{ bagCount }} Bag<span v-if="bagCount > 1">s</span>)</div>
        <div class="text-sm font-medium">₹{{ handling.toFixed(2) }}</div>
      </div>
      <div class="text-xs text-gray-500 ml-1">
        ₹20 deductible per item on purchase
      </div>
    </div>

    <!-- Total Value -->
    <div class="flex items-center justify-between text-gray-600">
      <div class="text-sm">Total Value</div>
      <div class="text-sm font-medium">₹{{ total.toFixed(2) }}</div>
    </div>

    <!-- Payable Amount -->
    <div>
      <div class="flex items-center justify-between border-t pt-3 text-lg text-gray-300">
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
  handling: number
  bagCount: number
}>()

const total = computed(() =>
  props.subtotal + props.shipping + props.handling - props.totalDiscount
)
</script>
