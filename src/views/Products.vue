<template>
  <ion-page>
    <ion-header class="ion-no-border products-header">
      <Topbar @search="onSearch" :name="companyName" />
    </ion-header>

    <ion-content :fullscreen="true" color="light" class="products-page">
      <div class="px-4 py-2 products-shell">
      
      <!-- Skeleton Loader -->
      <ul class="grid grid-cols-2 gap-3 mb-10" v-if="loading && variants.length === 0">
        <li
          v-for="n in 6"
          :key="n"
          class="col-span-1 flex flex-col space-y-2 border rounded-xl overflow-hidden animate-pulse p-2 skeleton-card"
        >
          <div class="w-full aspect-[4/5] bg-gray-300 rounded-md"></div>
          <div class="h-5 bg-gray-300 rounded w-3/4"></div>
          <div class="h-5 bg-gray-300 rounded w-1/2"></div>
          <div class="flex gap-2 mt-2">
            <div class="flex-1 h-10 bg-gray-300 rounded"></div>
            <div class="flex-1 h-10 bg-gray-300 rounded"></div>
          </div>
        </li>
      </ul>

      <!-- Real Variants -->
      <ul class="grid grid-cols-2 gap-3 mb-10">
        <VariantCard
          v-for="variant in variants"
          :key="variant.id"
          :variant="variant"
          @click="toProductDetailsPage(variant)"
        />
      </ul>

<BottomFilterBar
   @open="type => openFilterModal(type)" 
  :categoryCount="selectedCategory.length"
  :sizeCount="selectedSize.length"
  :sortCount="selectedSort ? 1 : 0"
/>

    </div>
  </ion-content>

    <!-- <ion-footer class="ion-no-border">
      <TabsPage />
    </ion-footer> -->
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonFooter } from "@ionic/vue";
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
const apiUrl = import.meta.env.VITE_API_URL;

import VariantCard from "@/components/Store/VariantCard.vue";
import BottomFilterBar from "@/components/Store/BottomFilterBar.vue";
import FilterModal from "@/components/Store/FilterModal.vue";
import Topbar from "@/components/Store/Topbar.vue";
import TabsPage from "./TabsPage.vue";

import { getAllCategories } from "@/api/api";
// parent component script setup
import { modalController } from '@ionic/vue';

async function openFilterModal(filterType: 'category' | 'size' | 'sort') {
  // choose items & initial selected based on filterType
  const items = filterType === 'category' ? categories.value : (filterType === 'size' ? sizeOptions.value : sortOptions.value);
  const initialSelected = filterType === 'category' ? selectedCategory.value : (filterType === 'size' ? selectedSize.value : selectedSort.value);

  const initialBreakpoint = 1
  const breakpoints = [0, 1, 1]

  const modal = await modalController.create({
    component: FilterModal,
    cssClass: 'markit-filter-sheet',
    componentProps: {
      title: filterType === 'category' ? 'Category' : (filterType === 'size' ? 'Size' : 'Sort by'),
      items,
      selected: initialSelected,
      multi: filterType !== 'sort',
      filterType: filterType
    },
    backdropDismiss: true,
    initialBreakpoint,
    breakpoints,
    handleBehavior: 'cycle',
    presentingElement: document.querySelector('ion-router-outlet') || undefined
  });

  await modal.present();

  const { data } = await modal.onDidDismiss(); // { data: { selected: [...] } } or undefined

  if (data?.selected) {
    // apply selection to parent state depending on filterType
    if (filterType === 'category') {
      selectedCategory.value = data.selected;
    } else if (filterType === 'size') {
      selectedSize.value = data.selected;
    } else {
      // sort returns an array for uniformity — choose first or handle as you want
      selectedSort.value = data.selected?.[0] ?? null;
    }

    // now trigger streamVariants or update UI as needed
    streamVariants(companyId);
  }
}

/* ---------------- Types ---------------- */
type CompanyVariant = {
  id: string;
  name: string;
  productName?: string;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  isNew: boolean;
  outOfStock: boolean;
  items: { id: string; size: string; qty: number }[];
};

/* ---------------- State ---------------- */
const route = useRoute();
const router = useRouter();

const companyId = route.params.companyId as string;
const companyName = route.params.companyName;

const sizeOptions = ref(["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6XL"]); 
const sortOptions = ref(["Price: Low to High", "Price: High to Low"]);
/* ---------------- State ---------------- */
const loading = ref(true);
const variants = ref<CompanyVariant[]>([]);

const selectedCategory = ref<any[]>([]);
const selectedSize = ref<any[]>([]);
const selectedSort = ref<any>(null);
const searchTerm = ref("");

const isCategoryOpen = ref(false);
const isSortOpen = ref(false);
const isSizeOpen = ref(false);


const categories = ref<{ id: string; name: string }[]>([]);

onMounted(async () => {
  try {
    const res = await getAllCategories(companyId);

    // --- Normalize response safely ---
    const data = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : [];

    categories.value = data as { id: string; name: string }[];

  } catch (err) {
    console.error("Categories error:", err);
    categories.value = [];
  }
});




// console.log('isCategoryOpen:',isCategoryOpen,'isSizeOpen:',isSizeOpen,'isSortOpen:',isSortOpen,'iiii');

/* ---------------- Streaming loader ---------------- */
let abortController: AbortController | null = null;

async function streamVariants(cid: string) {
  if (!cid) return;

  if (abortController) abortController.abort();
  abortController = new AbortController();

  const params = new URLSearchParams();

  if (selectedCategory.value.length)
    selectedCategory.value.forEach(c =>
      params.append("categoryId", c.id)
    );

if (selectedSize.value.length)
  selectedSize.value.forEach(s =>
    params.append("size", String(s))
  );


  if (selectedSort.value === "Price: Low to High") params.append("sort", "price_low");
  if (selectedSort.value === "Price: High to Low") params.append("sort", "price_high");
  if (searchTerm.value) params.append("search", searchTerm.value);

  loading.value = true;
  variants.value = [];

  const url = `${apiUrl}/products/company/${cid}?${params}`;

  const res = await fetch(url, { signal: abortController.signal });
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

/* ---------------- Debounce Search ---------------- */
let debounceTimer: any = null;
function onSearch(v: string) {
  searchTerm.value = (v || "").toLowerCase();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => streamVariants(companyId), 350);
}

/* ---------------- Initial Load ---------------- */
onMounted(() => {
  streamVariants(companyId);
});


function toProductDetailsPage(variant: CompanyVariant) {
  localStorage.setItem("product", JSON.stringify(variant));
  router.push({ name: 'product', params: { variantId: variant.id } });
}
</script>

<style scoped>
.products-page {
  --background: var(--markit-bg);
  --padding-bottom: calc(104px + var(--markit-bottom-inset));
}

.products-header {
  background: transparent !important;  
}

.products-shell {
  background: var(--markit-bg);
  padding-bottom: calc(86px + var(--markit-bottom-inset));
}

.skeleton-card {
  border-color: var(--markit-border);
  background: var(--markit-surface);
}
</style>
