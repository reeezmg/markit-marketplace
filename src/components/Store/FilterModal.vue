<template>
  <div class="p-4">
    <p class="size-title text-gray-700 mb-3">
      {{ title }}
    </p>

    <div class="size-options flex flex-wrap gap-2 mb-2">
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

        <!-- ITEM with chip styling -->
        <ion-button
          :fill="isTempSelected(item) ? 'solid' : 'outline'"
          shape="round"
          size="small"
          class="size-chip"
          :color="isTempSelected(item) ? 'primary' : 'medium'"
          @click="toggleItem(item)"
        >
          {{ displayLabel(item) }}
        </ion-button>

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

    <!-- Actions with CTA button styling -->
    <div class="flex gap-4 mt-8">
      <button
        class="flex-1 !py-3 !px-4 !rounded-[12px] !border !border-gray-300 !text-gray-700 !bg-white font-semibold"
        @click="onClear"
      >
        Clear
      </button>

      <button
        class="size-selector-cta flex-1"
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
import { IonButton } from "@ionic/vue";

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
/* ===== Header Styling ===== */
.size-title {
  font-size: 20px;
  font-weight: 700;
  color: #374151;
}

/* ===== Size Options Container ===== */
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

/* ===== Size Chips Styling - White background when not selected ===== */
.size-chip::part(native) {
  min-width: 42px;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid #e5e7eb; /* Light gray border */
  background: white !important; /* Force white background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

/* Selected chip styling - Green background */
.size-chip[fill="solid"]::part(native) {
  background: var(--ion-color-primary) !important;
  border-color: var(--ion-color-primary) !important;
  color: white !important;
  box-shadow: 0 6px 14px rgba(34, 139, 34, 0.15);
}

/* Override Ionic default styles */
.size-chip[fill="outline"]::part(native) {
  background: white !important;
}

/* ===== CTA Button ===== */
.size-selector-cta {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border: 1px solid transparent;
  box-shadow: 0 10px 22px rgba(18, 26, 18, 0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.size-selector-cta:active {
  transform: translateY(1px);
  box-shadow: 0 6px 14px rgba(18, 26, 18, 0.12);
}

/* Keep existing numeric input styling */
input[type="number"]::-webkit-inner-spin-button {
  margin-right: 4px;
}

input[type="number"] {
  padding-right: 16px;
  background: white !important;
}
</style>