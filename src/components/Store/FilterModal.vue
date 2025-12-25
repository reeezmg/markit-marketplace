<template>
  <div class="p-4">

    <!-- Header -->
    <p class="text-[18px] font-semibold mb-3 text-gray-700">{{ title }}</p>

    <!-- Chips -->
    <div class="flex flex-wrap gap-2 mb-2">
      <div
        v-for="item in items"
        :key="itemKey(item)"
        role="button"
        @click="toggleItem(item)"
        class="px-4 min-w-18 text-center py-[8px] text-sm rounded-md border cursor-pointer transition-all duration-150"
        :class="isTempSelected(item)
          ? 'bg-[#097D4C] text-white border-transparent shadow-sm'
          : 'bg-white text-gray-700 border-gray-300'"
      >
        {{ itemLabel(item) }}
      </div>
    </div>

    <!-- ⭐ Numeric Size Input -->
    <div v-if="filterType === 'size'" class="flex items-center gap-3 mb-8">
      <input
        type="number"
        class="w-38 text-center border border-gray-300 rounded-md py-2 text-gray-700 outline-0"
        v-model="numericSize"
        placeholder="Enter Size"
        min="1"
      />
    </div>

    <!-- Buttons -->
    <div class="flex gap-4 mt-8">
      <button
        class="flex-1 !py-3 !px-4 !rounded-[8px] !border !border-gray-300 !text-gray-700 !bg-white"
        @click="onClear"
      >
        Clear
      </button>

      <button
        class="flex-1 !py-3 !px-4 !rounded-[8px] !bg-[#097D4C] !text-white !border !border-transparent"
        @click="onApply"
      >
        Apply
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Add space between number input arrows and border */
input[type="number"]::-webkit-inner-spin-button {
  margin-right: 4px;   /* adjust spacing here */
}

input[type="number"] {
  padding-right: 16px; /* ensures text doesn’t overlap arrows */
}

</style>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { modalController } from '@ionic/vue';

/* PROPS */
const props = defineProps({
  title: String,
  items: Array,
  selected: { type: [Array, Object, String, null], default: () => [] },
  multi: Boolean,
  filterType: String
});

/* TEMP SELECTION */
const temp = ref<any[]>([]);

/* ⭐ numeric input */
const numericSize = ref<string | null>(null);

/* Load temp + numeric size when opening */
watch(
  () => props.selected,
  (s) => {
    temp.value = Array.isArray(s) ? [...s] : [];

    // ⭐ pick only numeric values from selected list
    const found = temp.value.find(v => !isNaN(Number(v)));

    numericSize.value = found ? String(found) : null;
  },
  { immediate: true }
);

/* Helpers */
const isString = (i) => typeof i === 'string';
const itemLabel = (i) => isString(i) ? i : i.name;
const itemKey   = (i) => isString(i) ? i : i.id;

/* Chip selection */
function isTempSelected(item) {
  if (isString(item)) return temp.value.includes(item);
  return temp.value.some(x => x.id === item.id);
}
function toggleItem(item) {
  let copy = [...temp.value];
  if (isString(item)) {
    copy = copy.includes(item)
      ? copy.filter(x => x !== item)
      : [...copy, item];
  } else {
    const exists = copy.some(x => x.id === item.id);
    copy = exists
      ? copy.filter(x => x.id !== item.id)
      : [...copy, item];
  }
  temp.value = copy;
}

/* Clear */
function onClear() {
  temp.value = [];
  numericSize.value = null;   // ⭐ CLEAR numeric size properly
}

/* Apply → send back to parent */
async function onApply() {
  let final = [...temp.value];

  // ⭐ ADD numeric size to selected
  if (numericSize.value !== null && numericSize.value !== "") {
    if (!final.includes(String(numericSize.value))) {
      final.push(String(numericSize.value));
    }
  }

  await modalController.dismiss({
    selected: final
  });
}
</script>
