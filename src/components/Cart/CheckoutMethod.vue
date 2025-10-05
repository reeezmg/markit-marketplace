<template>
  <div class="bg-white p-3 mx-2 rounded-lg my-3">
    <label
      for="checkoutMethod"
      class="block font-semibold text-md mb-3 "
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
