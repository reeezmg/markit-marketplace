<template>
  <ion-header class="ion-no-border topbar-flat">
    <div class="topbar-shell">
      <div class="topbar-inner">
        <div class="topbar-row">
        <div class="topbar-left-group">
          <ion-buttons slot="start" class="topbar-left">
            <ion-button fill="clear" class="topbar-back" @click="goBack" aria-label="Go back">
              <ion-icon :icon="arrowBackOutline" />
            </ion-button>
          </ion-buttons>

          <div v-if="title" class="topbar-title">
            {{ title }}
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
  </ion-header>
</template>

<script setup lang="ts">
import { useIonRouter } from '@ionic/vue'
import { useRoute } from 'vue-router'
import {
  IonButtons,
  IonHeader,
  IonBadge,
  IonIcon,
  IonButton,
} from '@ionic/vue'
import { heartOutline, cartOutline, arrowBackOutline } from 'ionicons/icons'
import { useCartStore } from '@/store/useCartStore'
import {  computed, onMounted } from 'vue'

/* PROPS */
const props = defineProps({
  title: String,
});

const router = useIonRouter()
const route = useRoute()
const ionRouter = useIonRouter()
const cartStore = useCartStore()

onMounted(async () => {
  await cartStore.loadCart()
})

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

function goBack() {
  ionRouter.back({ animated: false })
}
</script>

<style scoped>
/* ---------------------------------------------
   GLASS TOPBAR – matches wishlist/cart exactly
   Back button & title text = 100% original
   No HTML or script changes, only CSS
--------------------------------------------- */
.topbar-flat {
  position: sticky;
  top: 0;
  z-index: 80;
  background: transparent !important;
}

.topbar-flat::part(native) {
  background: transparent !important;
  box-shadow: none !important;
}

/* ----- Shell: fully transparent, only spacing ----- */
.topbar-shell {
  position: relative;
  z-index: 32;
  padding: 10px 0 0;
  background: transparent;
  border-bottom: none;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

/* ----- Inner glass card – identical to wishlist/cart ----- */
.topbar-inner {
  padding: 10px 14px;
  margin: 0 12px;
  border-radius: 14px;
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

/* ----- Row layout (unchanged structure) ----- */
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

/* ----- RIGHT ICONS – glass, active states, exact match ----- */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 6px;                  /* wishlist/cart spacing */
  justify-content: flex-end;
  flex-shrink: 0;
}

.topbar-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 11px;       /* exact match */
  background: var(--markit-glass-surface-strong);
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #1f2937;
  padding: 0;
  margin: 0;
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

.topbar-icon-btn--active {
  background: transparent;
}

.topbar-icon-btn--active .topbar-icon {
  color: var(--ion-color-primary);
  filter: drop-shadow(0 0 0.35rem
          color-mix(in srgb, var(--ion-color-primary) 38%, transparent));
}

.topbar-icon {
  width: 21px;
  height: 21px;
  color: #1f2937;
}

.topbar-icon--active {
  color: var(--ion-color-primary);
  filter: drop-shadow(0 0 0.35rem
          color-mix(in srgb, var(--ion-color-primary) 38%, transparent));
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

  /* remove all glass overrides */
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

/* remove any hover/focus from glass theme */
.topbar-back:hover,
.topbar-back:focus-visible {
  border-color: transparent;
  box-shadow: none;
}

.topbar-back:focus-visible ion-icon {
  color: #2d5444;            /* keep original colour */
}

/* ----- TITLE – 100% ORIGINAL (no glass changes) ----- */
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

/* ----- RESPONSIVE – back & title stay original ----- */
@media (max-width: 390px) {
  .topbar-shell {
    padding: 10px 0 0;
  }

  .topbar-inner {
    padding: 8px 12px;
    margin: 0 10px;
  }

  /* right icons scale down */
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

  /* back button original scaling */
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
}
</style>

