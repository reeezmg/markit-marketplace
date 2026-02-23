<template>
  <ion-page>
    <ion-header class="ion-no-border products-header">
      <Topbar @search="onSearch" :name="companyName" />
    </ion-header>

    <ion-content :fullscreen="true" color="light">
      <div class="px-4 py-2">

        <!-- Skeleton -->
        <ul v-if="loading && variants.length === 0"
            class="grid grid-cols-2 gap-3 mb-10">
          <li v-for="n in 6" :key="n" class="animate-pulse">
            <div class="aspect-[4/5] bg-gray-300 rounded-md"></div>
          </li>
        </ul>

        <!-- Products -->
        <ul class="grid grid-cols-2 gap-3 mb-10">
          <VariantCard
            v-for="variant in validVariants"
            :key="variant.id"
            :variant="variant"
            @click="toProductDetailsPage(variant)"
            @imageError="handleImageError(variant.id)"
          />
        </ul>

        <!-- Bottom Bar -->
        <BottomFilterBar
          @open="openFilterModal"
          :categoryCount="selectedCategory.length + selectedBrand.length"
          :sizeCount="selectedSize.length"
          :sortCount="selectedSort ? 1 : 0"
        />

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent } from "@ionic/vue";
import { ref, computed } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { useIonRouter } from "@ionic/vue";
import { useRoute } from 'vue-router';
import { modalController } from "@ionic/vue";

import VariantCard from "@/components/Store/VariantCard.vue";
import BottomFilterBar from "@/components/Store/BottomFilterBar.vue";
import FilterModal from "@/components/Store/FilterModal.vue";
import Topbar from "@/components/Store/Topbar.vue";

import { getAllCategories, getAllBrands } from "@/api/api";

const apiUrl = import.meta.env.VITE_API_URL;

/* ---------------- Types ---------------- */
type CompanyVariant = {
  id: string;
  name: string;
  productName?: string;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  brandId?: string;
  brandName?: string;
  items: { id: string; size: string; qty: number }[];
};

/* ---------------- State ---------------- */
const route = useRoute();
const router = useIonRouter();

const companyId = route.params.companyId as string;
const companyName = route.params.companyName;

const loading = ref(true);
const variants = ref<CompanyVariant[]>([]);

const selectedCategory = ref<any[]>([]);
const selectedBrand = ref<any[]>([]);
const selectedSize = ref<any[]>([]);
const selectedSort = ref<any>(null);

const searchTerm = ref("");

const categories = ref<any[]>([]);
const brands = ref<any[]>([]);

const sizeOptions = ref([
  "XS","S","M","L","XL","XXL","3XL","4XL","5XL","6XL"
]);

const sortOptions = ref([
  "Price: Low to High",
  "Price: High to Low"
]);

const invalidImages = ref<Set<string>>(new Set());

/* ---------------- Fetch Filters ---------------- */
onIonViewWillEnter(async () => {
  try {
    const catRes = await getAllCategories(companyId);
    const brandRes = await getAllBrands(companyId);

    categories.value = Array.isArray(catRes?.data)
      ? catRes.data
      : catRes || [];

    brands.value = Array.isArray(brandRes?.data)
      ? brandRes.data
      : brandRes || [];

  } catch (err) {
    console.error("Filter fetch error:", err);
  }
});

/* ---------------- Modal ---------------- */
async function openFilterModal(
  filterType: "category" | "size" | "sort"
) {
  let items: any[] = [];
  let selected: any[] = [];

  if (filterType === "category") {
    const categoryItems = categories.value.map(c => ({
      ...c,
      type: "category"
    }));

    const brandItems =
      brands.value.length > 1
        ? brands.value.map(b => ({
            ...b,
            type: "brand"
          }))
        : [];

    // ✅ GROUPED STRUCTURE
    // ✅ FLAT LIST (IMPORTANT)
    items = [
      ...categoryItems,
      ...brandItems
    ];

    selected = [
      ...selectedCategory.value,
      ...selectedBrand.value
    ];
  }

  if (filterType === "size") {
    items = sizeOptions.value;
    selected = selectedSize.value;
  }

  if (filterType === "sort") {
    items = sortOptions.value;
    selected = selectedSort.value ? [selectedSort.value] : [];
  }

  console.log("Opening modal with items:", items, "selected:", selected);
  const modal = await modalController.create({
    component: FilterModal,
    cssClass: "markit-filter-sheet",
    componentProps: {
      title:
        filterType === "category"
          ? "Filter"
          : filterType === "size"
          ? "Size"
          : "Sort by",
      items,
      selected,
      multi: filterType !== "sort",
      filterType
    },
    initialBreakpoint: 1,
    breakpoints: [0, 1],
    backdropDismiss: true
  });

  await modal.present();

  const { data } = await modal.onDidDismiss();

  if (data?.selected) {
    if (filterType === "category") {
      selectedCategory.value = data.selected.filter(i => i.type === "category");
      selectedBrand.value = data.selected.filter(i => i.type === "brand");
    }

    if (filterType === "size") {
      selectedSize.value = data.selected;
    }

    if (filterType === "sort") {
      selectedSort.value = data.selected?.[0] ?? null;
    }

    streamVariants(companyId);
  }
}

/* ---------------- Streaming ---------------- */
let abortController: AbortController | null = null;

async function streamVariants(cid: string) {
  if (!cid) return;

  if (abortController) abortController.abort();
  abortController = new AbortController();

  const params = new URLSearchParams();

  selectedCategory.value.forEach(c =>
    params.append("categoryId", c.id)
  );

  selectedBrand.value.forEach(b =>
    params.append("brandId", b.id)
  );

  selectedSize.value.forEach(s =>
    params.append("size", String(s))
  );

  if (selectedSort.value === "Price: Low to High")
    params.append("sort", "price_low");

  if (selectedSort.value === "Price: High to Low")
    params.append("sort", "price_high");

  if (searchTerm.value)
    params.append("search", searchTerm.value);

  loading.value = true;
  variants.value = [];

  const res = await fetch(
    `${apiUrl}/products/company/${cid}?${params}`,
    { signal: abortController.signal }
  );

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";
  let first = true;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value);
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;

      variants.value.push(JSON.parse(line));

      if (first) {
        loading.value = false;
        first = false;
      }
    }
  }

  loading.value = false;
}

/* ---------------- Search ---------------- */
let debounceTimer: any = null;

function onSearch(v: string) {
  searchTerm.value = (v || "").toLowerCase();

  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    streamVariants(companyId);
  }, 350);
}

/* ---------------- Initial Load ---------------- */
onIonViewWillEnter(() => {
  streamVariants(companyId);
});

/* ---------------- Helpers ---------------- */
function toProductDetailsPage(variant: CompanyVariant) {
  localStorage.setItem("product", JSON.stringify(variant));
  router.push({
    name: "product",
    params: { variantId: variant.id }
  });
}

const validVariants = computed(() => {
  return variants.value.filter(v => {
    const img = v.images?.[0];
    return img && img.trim() && !invalidImages.value.has(v.id);
  });
});

function handleImageError(id: string) {
  invalidImages.value.add(id);
}
</script>

<style scoped>
.products-header {
  background: transparent !important;
}
</style>