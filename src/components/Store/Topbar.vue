<template>
  <div class="topbar-flat">
    <div class="topbar-shell">
      <div class="topbar-inner glass-card">
        <div class="topbar-row">
      <div class="topbar-left-group">
        <ion-buttons slot="start" class="topbar-left">
          <ion-button fill="clear" class="topbar-back" @click="goBack" aria-label="Go back">
            <ion-icon :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>

        <div v-if="formattedShopName" class="topbar-title">
          {{ formattedShopName }}
        </div>
      </div>

      <div class="topbar-right">
        <!-- Wishlist Button -->
        <button
          @click="router.push({ name: 'wishlist' })"
          class="topbar-icon-btn"
        >
          <ion-icon
            :icon="heartOutline"
            class="topbar-icon"
            :class="{ 'topbar-icon--active': activeIcon === 'wishlist' }"
          ></ion-icon>
        </button>

        <!-- Cart Button -->
        <button
          @click="router.push({ name: 'cart' })"
          class="relative topbar-icon-btn"
        >
          <ion-icon
            :icon="cartOutline"
            class="topbar-icon"
            :class="{ 'topbar-icon--active': activeIcon === 'cart' }"
          ></ion-icon>

          <!-- Cart Badge -->
          <ion-badge
            v-if="totalCartCount > 0"
            class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
          >
            {{ totalCartCount }}
          </ion-badge>
        </button>

      </div>
        </div>
      </div>
    </div>
  </div>
  <div class="store-search-wrap">
    <div class="store-search-shell">
      <div class="store-search-box">
        <ion-icon :icon="searchOutline" class="store-search-icon"></ion-icon>
        <input
          v-model="q"
          @input="onInput"
          type="text"
          placeholder="Search..."
          class="store-search-input"
        />
        <button v-if="q" @click="clear" class="store-clear-btn" type="button">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IonIcon, IonButton, IonButtons, useIonRouter } from "@ionic/vue";
import { searchOutline, heartOutline, cartOutline, arrowBackOutline } from "ionicons/icons";
import { useRoute, useRouter } from "vue-router";
import { useCartStore } from "@/store/useCartStore";

const router = useRouter();
const route = useRoute();
const ionRouter = useIonRouter();
const cartStore = useCartStore()

const q = ref("");
let timer: number | null = null;

// emit search event (debounced)
const emit = defineEmits<{
  (e: "search", value: string): void;
}>();

const props = defineProps({
  name:String
})

function formatShopName(value?: string | null) {
  if (!value) return ''
  let normalized = String(value).trim()
  try {
    normalized = decodeURIComponent(normalized)
  } catch {
    // Keep original value if not URI-encoded.
  }

  return normalized
    .toLowerCase()
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
        .join('-')
    )
    .join(' ')
}

const formattedShopName = computed(() => formatShopName(props.name as string))

// ✅ Correct total item count for nested cartGroups -> companies -> items
const totalCartCount = computed(() => {
  if (!Array.isArray(cartStore.groups)) return 0

  return cartStore.groups.reduce((groupSum, group) => {
    const groupTotal = (group.companies ?? []).reduce((companySum, company) => {
      const companyTotal = (company.items ?? []).reduce(
        (itemSum, item) => itemSum + (item.quantity ?? 0),
        0
      )
      return companySum + companyTotal
    }, 0)
    return groupSum + groupTotal
  }, 0)
})

const activeIcon = computed(() => {
  const name = String(route.name || '')
  if (name.includes('wishlist')) return 'wishlist'
  if (name.includes('cart')) return 'cart'
  return ''
})

function onInput() {
  if (timer) window.clearTimeout(timer);
  // debounce 300ms
  timer = window.setTimeout(() => {
    emit("search", q.value.trim());
  }, 300);
}

function clear() {
  q.value = "";
  if (timer) window.clearTimeout(timer);
  emit("search", "");
}

function goBack() {
  ionRouter.back({ animated: false });
}
</script>

<style scoped>
/* ====================================================
   MARKIT GLASS TOPBAR – exact match of wishlist/cart
   Back button & title = ORIGINAL (no glass)
   Right icons = glass buttons (34px, 11px radius, 6px gap)
   Inner card = frosted glass with side margins (14px radius)
   Search bar = exact match of reference (44px, 12px radius)
==================================================== */

/* ----- Root: fully transparent background ----- */
.topbar-flat {
  position: sticky;
  top: 0;
  z-index: 80;
  background: transparent !important;   /* was var(--markit-bg) – now transparent */
}

/* ----- Shell: only vertical spacing, no side padding ----- */
.topbar-shell {
  position: relative;
  z-index: 32;
  padding: 10px 0 0;          /* side margins moved to .topbar-inner */
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  backdrop-filter: none;
}

/* ----- Inner glass card – exact match of wishlist/cart ----- */
.topbar-inner {
  padding: 10px 14px;
  margin: 0 12px;            /* consistent with all other pages */
  border-radius: 14px;       /* was var(--markit-radius-xl) – now fixed 14px */
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.topbar-inner:hover,
.topbar-inner:focus-within {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
}

/* ----- Row layout – unchanged structure ----- */
.topbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  min-height: 44px;
}

.topbar-left,
.topbar-right {
  display: flex;
  align-items: center;
}

.topbar-left-group {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

/* ----- RIGHT ICONS – glass buttons, 6px gap (wishlist/cart spec) ----- */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 6px;                 /* was 12px – now exactly 6px */
  justify-content: flex-end;
  flex-shrink: 0;
}

.topbar-icon-btn {
  width: 34px;              /* was 32px – now 34px */
  height: 34px;
  border-radius: 11px;      /* was 12px – now 11px */
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #1f2937;           /* was #2d5444 – now neutral dark */
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.topbar-icon-btn:hover,
.topbar-icon-btn:focus-visible {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
  outline: none;
}

.topbar-icon-btn:focus-visible .topbar-icon {
  color: var(--ion-color-primary);
}

.topbar-icon {
  width: 21px;              /* was 22px – now 21px */
  height: 21px;
  color: #1f2937;           /* was #2d5444 – now neutral dark */
  transition: color 0.2s ease;
}

.topbar-icon--active {
  color: var(--ion-color-primary);
  filter: drop-shadow(
    0 0 0.35rem
      color-mix(in srgb, var(--ion-color-primary) 38%, transparent)
  );                        /* was 35% – now exact 38% */
}

/* ----- BACK BUTTON – 100% ORIGINAL (no glass, no border) ----- */
.topbar-back {
  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;
  --box-shadow: none;
  --ripple-color: transparent;
  --padding-start: 6px;
  --padding-end: 6px;

  /* remove any glass overrides */
  width: auto;
  height: auto;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.topbar-back::part(native) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* back icon – original size & colour */
.topbar-back ion-icon {
  font-size: 22px;
  color: #2d5444;
}

/* remove any hover/focus effects from glass theme */
.topbar-back:hover,
.topbar-back:focus-visible {
  border-color: transparent;
  box-shadow: none;
}

.topbar-back:focus-visible ion-icon {
  color: #2d5444;
}

/* ----- TITLE – 100% ORIGINAL ----- */
.topbar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--markit-text);
  letter-spacing: 0.2px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ====================================================
   SEARCH BAR – exact match of reference topbar search
   (min-height:44px, border-radius:12px, glass tokens)
==================================================== */
.store-search-wrap {
  margin-top: 8px;
  width: 100%;
  padding: 0 16px;           /* was 12px – now 16px (ref) */
  box-sizing: border-box;
}

.store-search-box {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;          /* was 46px – now 44px */
  padding: 0 14px;
  border-radius: 12px;       /* was 14px – now 12px */
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.store-search-box:hover,
.store-search-box:focus-within {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
}

.store-search-icon {
  width: 20px;
  height: 20px;
  color: #5b6676;           /* was #4f7d68 – now neutral */
  margin-right: 10px;
  flex-shrink: 0;
}

.store-search-input {
  width: 100%;
  background: transparent;
  border: 0;
  outline: 0;
  color: var(--markit-text);
  font-size: 0.98rem;       /* was 1rem – now reference size */
  line-height: 1.2;
}

.store-search-input::placeholder {
  color: color-mix(in srgb, var(--markit-text-muted) 85%, #ffffff 15%);
}

.store-clear-btn {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: #5b6676;           /* was #4f7d68 – now neutral */
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
}

/* ====================================================
   RESPONSIVE – matches all other topbars
==================================================== */
@media (max-width: 390px) {
  .topbar-shell {
    padding: 10px 0 0;
  }

  .topbar-inner {
    padding: 8px 12px;
    margin: 0 10px;
  }

  .topbar-icon-btn {
    width: 28px;
    height: 28px;
  }

  .topbar-icon {
    width: 20px;
    height: 20px;
  }

  .topbar-right {
    gap: 4px;
  }

  .topbar-left-group {
    gap: 6px;
  }

  .topbar-back {
    --padding-start: 4px;
    --padding-end: 4px;
  }

  .topbar-back ion-icon {
    font-size: 20px;
  }

  .topbar-title {
    font-size: 14px;
  }

  .store-search-wrap {
    padding: 0 12px;
  }

  .store-search-box {
    min-height: 42px;
    padding: 0 12px;
  }

  .store-search-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }

  .store-search-input {
    font-size: 0.94rem;
  }

  .store-clear-btn {
    font-size: 0.8rem;
  }
}
</style>

