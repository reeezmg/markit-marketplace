<template>
  <ion-page>
    <ion-header class="ion-padding ion-no-border bg-white">
      <Topbar @search="onSearch" :name="companyName" />
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding" color="light">
      <ul class="grid grid-cols-2 gap-4 mb-10 ">
        <!-- Skeleton Loader (only if nothing loaded yet) -->
        <template v-if="loading && variants.length === 0">
          <li
            v-for="n in 6"
            :key="n"
            class="col-span-1 flex flex-col space-y-2 border border-gray-300 rounded-lg overflow-hidden animate-pulse p-2"
          >
            <div class="w-full aspect-[4/5] bg-gray-300 dark:bg-gray-700 rounded-md"></div>
            <div class="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div class="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div class="flex gap-2 mt-2">
              <div class="flex-1 h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div class="flex-1 h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </li>
        </template>

        <!-- Real Variants -->
        <VariantCard
          v-for="(variant, index) in filteredVariants"
          :key="variant.id"
          :variant="variant"
          @click="toProductDetailsPage(variant)"
        />
      </ul>

      <!-- Fixed Normal Button -->
      <ion-button
        class="fixed bottom-20 right-4 z-50"
        @click="isCategoryOpen = true"
      >
        Category
      </ion-button>

      <!-- Category Modal -->
      <ion-modal
        :is-open="isCategoryOpen"
        :breakpoints="[0, 0.5, 1]"
        :initial-breakpoint="0.5"
        @didDismiss="isCategoryOpen = false"
        :expand-to-scroll="false"
      >
        <ion-content class="ion-padding">
          <ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <!-- All option -->
            <li
              :key="'all'"
              @click="selectCategory(null)"
              class="p-2 rounded-lg border cursor-pointer transition-all duration-200 text-center font-medium"
              :class="allClass"
            >
              All
            </li>

            <li
              v-for="c in categories"
              :key="c.id"
              @click="selectCategory(c)"
              class="p-2 rounded-lg border cursor-pointer transition-all duration-200 text-center font-medium"
              :class="categoryClass(c)"
            >
              {{ c.name }}
            </li>
          </ul>
        </ion-content>
      </ion-modal>
    </ion-content>
    <ion-footer class="ion-no-border ">
       <TabsPage/>
      </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonContent,
  IonModal,
  IonButton,
  IonFooter
} from "@ionic/vue";
import VariantCard from "@/components/Store/VariantCard.vue";
import Topbar from "@/components/Store/Topbar.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, computed } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { getAllCategories } from "@/api/api";
import TabsPage from "./TabsPage.vue";

type CompanyVariant = {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  name: string;
  productName?: string | null;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  isNew: boolean;
  outOfStock: boolean;
  items: { id: string; size: string; qty: number }[];
  // possible category props (not guaranteed) - used for filtering
  categoryId?: string;
  productCategoryId?: string;
  category?: { id?: string; name?: string } | string;
};

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const variants = ref<CompanyVariant[]>([]);
const isCategoryOpen = ref(false);
const categories = ref<{ id: string; name: string }[]>([]);
const selectedCategory = ref<{ id: string; name: string } | null>(null);
const searchTerm = ref("");
const companyName = route.params.companyName


// fetch categories
onIonViewWillEnter(async () => {
  try {
    const response = await getAllCategories(route.params.companyId as string);
    // handle both response and response.data shapes
    const data = response?.data ?? response;
    categories.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    categories.value = [];
  } finally {
    // don't flip loading off here because variants streaming controls the main loader
  }
});

// stream variants (unchanged)
async function streamVariants(companyId: string) {
  const response = await fetch(`http://localhost:3005/api/products/company/${companyId}`);

  if (!response.body) throw new Error("No response body from server");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let firstChunk = true; // track first variant

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let lines = buffer.split("\n");

    // keep last incomplete line
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const variant = JSON.parse(line) as CompanyVariant;
        variants.value.push(variant);

        // stop showing skeleton when first variant arrives
        if (firstChunk) {
          loading.value = false;
          firstChunk = false;
        }

        console.log("Received variant:", variants);
      } catch (err) {
        console.error("Failed to parse line:", line, err);
      }
    }
  }

  // if nothing was streamed at all
  if (firstChunk) {
    loading.value = false;
  }
}

onIonViewWillEnter(async () => {
  const companyId = route.params.companyId as string;
  if (!companyId) {
    console.error("Company ID is missing from route params");
    return;
  }

  loading.value = true;
  variants.value = [];

  // stream in background (catch inside)
  streamVariants(companyId).catch(err => {
    console.error("Streaming error:", err);
    loading.value = false;
  });
});

// helper: determine if a variant matches selected category
function variantMatchesCategory(variant: CompanyVariant, category: { id: string; name: string } | null) {
  if (!category) return true;

  const id = category.id;
  const name = category.name?.toString?.().toLowerCase?.() ?? "";

  // check multiple possible properties
  if (variant.categoryId && variant.categoryId === id) return true;
  if ((variant as any).productCategoryId && (variant as any).productCategoryId === id) return true;

  // category could be an object or a string
  if (variant.category) {
    if (typeof variant.category === "string") {
      if (variant.category === id || variant.category.toLowerCase() === name) return true;
    } else if (typeof variant.category === "object") {
      if ((variant.category as any).id && (variant.category as any).id === id) return true;
      if ((variant.category as any).name && (variant.category as any).name.toLowerCase() === name) return true;
    }
  }

  // fallback: try matching by comparing variant.name/productName to category name (loose)
  if (variant.name && variant.name.toLowerCase().includes(name)) return true;
  if (variant.productName && variant.productName.toLowerCase().includes(name)) return true;

  return false;
}

function variantMatchesSearch(variant: CompanyVariant, q: string) {
  if (!q) return true;
  const lowerQ = q.toLowerCase();

  if (variant.name && variant.name.toLowerCase().includes(lowerQ)) return true;
  if (variant.productName && variant.productName.toLowerCase().includes(lowerQ)) return true;

  // try category name on variant (object or string)
  if (variant.category) {
    if (typeof variant.category === "string") {
      if (variant.category.toLowerCase().includes(lowerQ)) return true;
    } else if (typeof variant.category === "object" && variant.category.name) {
      if ((variant.category.name as string).toLowerCase().includes(lowerQ)) return true;
    }
  }

  // fallback: match category names from categories list (categoryId -> name)
  if (variant.categoryId) {
    const cat = categories.value.find(c => c.id === variant.categoryId);
    if (cat && cat.name.toLowerCase().includes(lowerQ)) return true;
  }

  return false;
}

const filteredVariants = computed(() => {
  return variants.value.filter(v => {
    // 1) category filter
    const passCategory = variantMatchesCategory(v, selectedCategory.value);
    if (!passCategory) return false;

    // 2) search filter
    const passSearch = variantMatchesSearch(v, searchTerm.value);
    return passSearch;
  });
});

// handler from search component
function onSearch(value: string) {
  searchTerm.value = (value || "").toLowerCase();
}


// select category (null for All)
function selectCategory(c: { id: string; name: string } | null) {
  selectedCategory.value = c;
  // optionally keep modal open; if you want to close modal on select, uncomment next line:
  // isCategoryOpen.value = false;
}

// CSS classes for selected/unselected categories
const allClass = computed(() =>
  selectedCategory.value === null
    ? "border-transparent bg-[#097D4C] text-white"
    : "bg-white text-gray-700"
);

function categoryClass(c: { id: string; name: string }) {
  const isSelected = selectedCategory.value?.id === c.id;
  return isSelected
    ? "border-transparent bg-[#097D4C] text-white"
    : "bg-white text-gray-700";
}

const toProductDetailsPage = (variant: CompanyVariant) => {
  localStorage.setItem("product", JSON.stringify(variant));
  router.push(`/product/${variant.id}`);
};
</script>
