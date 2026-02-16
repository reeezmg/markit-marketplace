<template>
  <div class="cart-checkout-card p-3 my-3">
    <label
      for="checkoutMethod"
      class="cart-checkout-label block mb-3"
    >
      Checkout Method
    </label>

    <Select
      v-model="selectedValue"
      :options="options"
      placeholder="Select an option"
      size="md"
      color="primary"
      variant="outline"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Select from '../Select.vue'

// ✅ define emits
const emit = defineEmits<{
  (e: 'update:method', value: string): void
}>()

const selectedValue = ref('trynbuy')

const options = [
  { value: 'trynbuy', label: 'Try & Buy' },
  { value: 'book', label: 'Book' },
]

function handleChange(value: string | number) {
  emit('update:method', String(value))
}
</script>

<style scoped>
.cart-checkout-card {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
}

.cart-checkout-label {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--markit-text);
}
</style>
