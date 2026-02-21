<template>
  <div class="p-4">
    <p class="text-[18px] font-semibold mb-3 text-gray-700">
      {{ title }}
    </p>

    <div class="flex flex-wrap gap-2 mb-2">
      <template v-for="(item, index) in flatItems" :key="itemKey(item)">

        <!-- Category Heading -->
        <div
          v-if="item.type === 'category' && firstCategoryIndex === index"
          class="w-full text-[14px] font-semibold text-gray-600 mt-2"
        >
          Category
        </div>

        <!-- Brand Heading -->
        <div
          v-if="item.type === 'brand' && firstBrandIndex === index"
          class="w-full text-[14px] font-semibold text-gray-600 mt-2"
        >
          Brand
        </div>

        <!-- ITEM -->
        <div
          role="button"
          @click="toggleItem(item)"
          class="px-4 min-w-18 text-center py-[8px] text-sm rounded-md border cursor-pointer transition-all duration-150"
          :class="
            isTempSelected(item)
              ? 'filter-chip-selected border-transparent shadow-sm'
              : 'bg-white text-gray-700 border-gray-300'
          "
        >
          {{ displayLabel(item) }}
        </div>

      </template>
    </div>

    <!-- Numeric Size -->
    <div v-if="filterType === 'size'" class="flex items-center gap-3 mb-8">
      <input
        type="number"
        class="w-38 text-center border border-gray-300 rounded-md py-2 text-gray-700 outline-0"
        v-model="numericSize"
        placeholder="Enter Size"
        min="1"
      />
    </div>

    <!-- Actions -->
    <div class="flex gap-4 mt-8">
      <button
        class="flex-1 !py-3 !px-4 !rounded-[8px] !border !border-gray-300 !text-gray-700 !bg-white"
        @click="onClear"
      >
        Clear
      </button>

      <button
        class="flex-1 !py-3 !px-4 !rounded-[8px] !text-white !border !border-transparent filter-apply-btn"
        @click="onApply"
      >
        Apply
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { modalController } from "@ionic/vue";

const props = defineProps({
  title: String,
  items: Array,
  selected: { type: [Array, Object, String, null], default: () => [] },
  multi: Boolean,
  filterType: String,
});

/* ---------------- STATE ---------------- */
const temp = ref<any[]>([]);
const numericSize = ref<string | null>(null);

/* ---------------- NORMALIZE SELECTED ---------------- */
watch(
  () => props.selected,
  (s) => {
    if (Array.isArray(s)) temp.value = [...s];
    else if (s !== null && s !== undefined && s !== "") temp.value = [s];
    else temp.value = [];

    const found = temp.value.find((v) => !isNaN(Number(v)));
    numericSize.value = found ? String(found) : null;
  },
  { immediate: true }
);

/* ---------------- 🔥 FLATTEN ITEMS ---------------- */
const flatItems = computed(() => {
  if (!props.items) return [];

  // If grouped (has options)
  if (props.items[0]?.options) {
    return props.items.flatMap((group: any) => group.options || []);
  }

  // Already flat
  return props.items;
});

/* ---------------- HEADINGS ---------------- */
const firstCategoryIndex = computed(() =>
  flatItems.value.findIndex((i: any) => i.type === "category")
);

const firstBrandIndex = computed(() =>
  flatItems.value.findIndex((i: any) => i.type === "brand")
);

/* ---------------- HELPERS ---------------- */
const isString = (i: any) => typeof i === "string";
const itemLabel = (i: any) => (isString(i) ? i : i.name);
const itemKey = (i: any) => (isString(i) ? i : i.id);

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join("-")
    )
    .join(" ");
}

function displayLabel(item: any) {
  const label = String(itemLabel(item) || "");
  if (!label) return "";
  if (props.filterType === "category") return titleCase(label);
  return label;
}

/* ---------------- SELECTION ---------------- */
function isTempSelected(item: any) {
  if (isString(item)) return temp.value.includes(item);
  return temp.value.some((x) => x.id === item.id);
}

function toggleItem(item: any) {
  if (!props.multi) {
    temp.value = isTempSelected(item) ? [] : [item];
    return;
  }

  let copy = [...temp.value];

  if (isString(item)) {
    copy = copy.includes(item)
      ? copy.filter((x) => x !== item)
      : [...copy, item];
  } else {
    const exists = copy.some((x) => x.id === item.id);
    copy = exists
      ? copy.filter((x) => x.id !== item.id)
      : [...copy, item];
  }

  temp.value = copy;
}

/* ---------------- ACTIONS ---------------- */
function onClear() {
  temp.value = [];
  numericSize.value = null;
}

async function onApply() {
  const final = [...temp.value];

  if (numericSize.value !== null && numericSize.value !== "") {
    if (!final.includes(String(numericSize.value))) {
      final.push(String(numericSize.value));
    }
  }

  await modalController.dismiss({
    selected: final,
  });
}
</script>

<style scoped>
.filter-chip-selected {
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}

.filter-apply-btn {
  background: var(--ion-color-primary) !important;
  color: var(--ion-color-primary-contrast) !important;
}

input[type="number"]::-webkit-inner-spin-button {
  margin-right: 4px;
}

input[type="number"] {
  padding-right: 16px;
}
</style>