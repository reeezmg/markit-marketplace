<template>
  <div class="filter-sheet">
    <div class="filter-header">
      <div class="filter-title-row">
        <span class="filter-title-icon">
          <IonIcon :icon="headerIcon" />
        </span>
        <p class="filter-title">{{ title }}</p>
      </div>
      <p class="filter-subtitle">{{ totalSelected }} selected</p>
    </div>

    <div v-if="filterType === 'category'" class="filter-body two-pane-body">
      <aside class="section-menu">
        <button
          class="section-btn"
          :class="{ active: activeSection === 'category' }"
          @click="activeSection = 'category'"
        >
          <span class="section-label">
            <IonIcon :icon="gridOutline" />
            <span>Category</span>
          </span>
          <span class="section-count">{{ categorySelectedCount }}</span>
        </button>
        <button
          class="section-btn"
          :class="{ active: activeSection === 'brand' }"
          @click="activeSection = 'brand'"
        >
          <span class="section-label">
            <IonIcon :icon="pricetagOutline" />
            <span>Brand</span>
          </span>
          <span class="section-count">{{ brandSelectedCount }}</span>
        </button>
      </aside>

      <section class="options-pane">
        <div v-if="showBrandSearch" class="brand-search-wrap">
          <div class="brand-search-box">
            <IonIcon :icon="searchOutline" class="brand-search-icon" />
            <input
              v-model.trim="brandSearch"
              class="brand-search"
              type="text"
              placeholder="Search brand"
            />
          </div>
        </div>

        <div class="chip-grid">
          <ion-button
            v-for="item in visibleItems"
            :key="itemKey(item)"
            :fill="isTempSelected(item) ? 'solid' : 'outline'"
            shape="round"
            size="small"
            class="filter-chip"
            :color="isTempSelected(item) ? 'primary' : 'medium'"
            @click="toggleItem(item)"
          >
            {{ displayLabel(item) }}
          </ion-button>
        </div>
      </section>
    </div>

    <div v-else class="filter-body">
      <div class="chip-grid">
        <ion-button
          v-for="item in visibleItems"
          :key="itemKey(item)"
          :fill="isTempSelected(item) ? 'solid' : 'outline'"
          shape="round"
          size="small"
          class="filter-chip"
          :color="isTempSelected(item) ? 'primary' : 'medium'"
          @click="toggleItem(item)"
        >
          {{ displayLabel(item) }}
        </ion-button>
      </div>

      <div v-if="filterType === 'size'" class="size-input-wrap">
        <input
          type="number"
          class="size-input"
          v-model="numericSize"
          placeholder="Enter custom size"
          min="1"
        />
      </div>
    </div>

    <div class="actions">
      <button class="clear-btn" @click="onClear">Clear all</button>
      <button class="apply-btn" @click="onApply">Apply</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { modalController } from "@ionic/vue";
import { IonButton, IonIcon } from "@ionic/vue";
import { funnelOutline, gridOutline, pricetagOutline, resizeOutline, searchOutline } from "ionicons/icons";

const props = defineProps({
  title: String,
  items: Array,
  selected: { type: [Array, Object, String, null], default: () => [] },
  multi: Boolean,
  filterType: String,
});

const temp = ref<any[]>([]);
const numericSize = ref<string | null>(null);
const activeSection = ref<"category" | "brand">("category");
const brandSearch = ref("");

watch(
  () => props.selected,
  (s) => {
    if (Array.isArray(s)) temp.value = [...s];
    else if (s !== null && s !== undefined && s !== "") temp.value = [s];
    else temp.value = [];

    const found = temp.value.find((v) => !isNaN(Number(v)));
    numericSize.value = found ? String(found) : null;

    if (props.filterType === "category") {
      const hasBrandSelected = temp.value.some((v: any) => v?.type === "brand");
      activeSection.value = hasBrandSelected ? "brand" : "category";
    }
  },
  { immediate: true }
);

const flatItems = computed(() => {
  if (!props.items?.length) return [];
  if (props.items[0]?.options) {
    return props.items.flatMap((group: any) => group.options || []);
  }
  return props.items;
});

const categoryItems = computed(() =>
  flatItems.value.filter((item: any) => item?.type === "category")
);

const brandItems = computed(() =>
  flatItems.value.filter((item: any) => item?.type === "brand")
);

const visibleItems = computed(() => {
  if (props.filterType !== "category") return flatItems.value;

  if (activeSection.value === "category") return categoryItems.value;

  const q = brandSearch.value.toLowerCase();
  if (!q) return brandItems.value;

  return brandItems.value.filter((item: any) =>
    String(itemLabel(item)).toLowerCase().includes(q)
  );
});

const showBrandSearch = computed(
  () => props.filterType === "category" && activeSection.value === "brand"
);

const categorySelectedCount = computed(() =>
  temp.value.filter((i: any) => i?.type === "category").length
);

const brandSelectedCount = computed(() =>
  temp.value.filter((i: any) => i?.type === "brand").length
);

const totalSelected = computed(() => temp.value.length);
const headerIcon = computed(() => {
  if (props.filterType === "sort") return funnelOutline;
  if (props.filterType === "size") return resizeOutline;
  return gridOutline;
});

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

function onClear() {
  temp.value = [];
  numericSize.value = null;
  brandSearch.value = "";
  activeSection.value = "category";
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
.filter-sheet {
  display: flex;
  flex-direction: column;
  min-height: 62vh;
  max-height: 86vh;
  background: transparent;
}

.filter-header {
  padding: var(--markit-shell-padding-block) var(--markit-shell-padding-inline);
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

.filter-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-title-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: rgba(9, 125, 76, 0.12);
  color: var(--ion-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.filter-title {
  font-size: 21px;
  font-weight: 700;
  color: var(--markit-text);
  letter-spacing: 0.1px;
}

.filter-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--markit-text-muted);
}

.filter-body {
  padding: 10px var(--markit-shell-padding-inline) 12px;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.filter-body::-webkit-scrollbar {
  display: none;
}

.two-pane-body {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 10px;
  padding: 0;
  overflow: hidden;
  align-items: stretch;
}

.section-menu {
  background: color-mix(in srgb, var(--markit-glass-surface) 78%, transparent);
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  align-self: stretch;
}

.section-btn {
  min-height: 54px;
  border: 0;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  border-left: 3px solid transparent;
  background: transparent;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  padding: 10px 10px 10px 12px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.section-label ion-icon {
  font-size: 15px;
  color: var(--markit-text-muted);
}

.section-btn.active {
  background: var(--markit-glass-surface-strong);
  color: #0f172a;
  border-left-color: var(--ion-color-primary);
  border-bottom-color: transparent;
}

.section-btn.active .section-label ion-icon {
  color: var(--ion-color-primary);
}

.section-count {
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--markit-glass-surface-strong) 72%, #dbe4ef 28%);
  color: #334155;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.options-pane {
  padding: 10px 2px calc(8px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.options-pane::-webkit-scrollbar {
  display: none;
}

.brand-search-wrap {
  margin-bottom: 10px;
}

.brand-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--markit-glass-border);
  border-radius: var(--markit-search-radius);
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  padding: 0 10px;
}

.brand-search-icon {
  font-size: 16px;
  color: var(--markit-text-muted);
}

.brand-search {
  width: 100%;
  height: 38px;
  border: 0;
  border-radius: 0;
  padding: 0;
  font-size: 14px;
  background: transparent;
  outline: none;
}

.brand-search-box:focus-within {
  border-color: #94a3b8;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-bottom: 4px;
}

.filter-chip::part(native) {
  min-width: 42px;
  height: var(--markit-btn-height-sm);
  padding: 0 12px;
  border-radius: var(--markit-btn-radius);
  font-weight: 600;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong) !important;
  box-shadow: none;
  transition: all 0.2s ease;
}

.filter-chip[fill="solid"]::part(native) {
  background: var(--ion-color-primary) !important;
  border-color: var(--ion-color-primary) !important;
  color: #ffffff !important;
  box-shadow: none;
}

.filter-chip[fill="outline"]::part(native) {
  background: var(--markit-glass-surface-strong) !important;
}

.size-input-wrap {
  margin-top: 12px;
}

.size-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--markit-glass-border);
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  color: #0f172a;
  outline: none;
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
  -webkit-backdrop-filter: blur(var(--markit-glass-blur)) saturate(var(--markit-glass-saturation));
}

.actions {
  margin-top: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 10px;
  padding: 8px 10px calc(var(--markit-bottom-inset) + 8px);
  border-top: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.clear-btn,
.apply-btn {
  width: 100%;
  height: 44px;
  border-radius: var(--markit-btn-radius);
  font-weight: 700;
  font-size: 14px;
  box-shadow: none;
}

.clear-btn {
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  color: #334155;
}

.apply-btn {
  border: 1px solid transparent;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
}

input[type="number"]::-webkit-inner-spin-button {
  margin-right: 4px;
}
</style>
