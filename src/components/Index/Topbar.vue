<template>
  <div ref="rootRef" class="topbar-shell">
    <div class="address-wrap transition-all duration-300 ease-in-out" :class="collapsed ? 'address-wrap--hidden' : ''">
      <button type="button" class="address-inline" @click.stop="toggleAddressMenu">
        <ion-icon :icon="navigate" class="address-pin"></ion-icon>
        <span class="address-inline-text truncate">
          {{ location.houseDetails || location.name || 'Add Delivery Address' }}
        </span>
        <ion-icon :icon="chevronDownOutline" class="chev-icon" :class="{ 'chev-icon--open': showAddressMenu }"></ion-icon>
      </button>

      <div v-if="showAddressMenu" class="address-menu" @click.stop>
        <button
          v-for="addr in addresses"
          :key="addr.id || addr.formattedAddress"
          type="button"
          class="address-menu-item"
          :class="{ 'address-menu-item--active': isSameAddress(addr) }"
          @click.stop="selectAddress(addr)"
        >
          <span class="address-menu-title">{{ addr.houseDetails || addr.name || 'Saved Address' }}</span>
          <span class="address-menu-sub">{{ addr.formattedAddress || '' }}</span>
        </button>

        <button type="button" class="address-menu-item address-menu-item--manage" @click="openAddressSettings">
          <span class="address-menu-title">{{ addresses.length ? 'Manage Addresses' : 'Add Delivery Address' }}</span>
          <span class="address-menu-sub">{{ addresses.length ? 'Open address settings' : 'Add your first address' }}</span>
        </button>
      </div>
    </div>

    <div class="search-row">
      <div class="search-box">
        <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
        <input
          v-model="searchQuery"
          @input="onInput"
          type="text"
          placeholder="Search for shops..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="clear" class="clear-btn" type="button">Clear</button>
      </div>

      <div class="top-actions">
        <button
          type="button"
          class="icon-btn"
          :class="{ 'icon-btn--active': activeIcon === 'wishlist' }"
          @click="router.push({ name: 'wishlist' })"
          aria-label="Wishlist"
        >
          <ion-icon :icon="heartOutline" class="topbar-icon"></ion-icon>
        </button>
        <button
          type="button"
          class="icon-btn"
          :class="{ 'icon-btn--active': activeIcon === 'account' }"
          @click="router.push({ name: 'account' })"
          aria-label="Account"
        >
          <ion-icon :icon="personOutline" class="topbar-icon"></ion-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  chevronDownOutline,
  heartOutline,
  navigate,
  personOutline,
  searchOutline,
} from 'ionicons/icons'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia' // ✅ Add this import
import type { Address } from '@/api/address'
import { useAddressStore } from '@/store/useAddressStore'
import { useLocationStore } from '@/composables/useLocationStore'
import { Preferences } from '@capacitor/preferences'
import { useSearchStore } from '@/store/useSearchStore' // Import search store

const props = defineProps<{ location: Partial<Address>; collapsed?: boolean }>()

const router = useRouter()
const route = useRoute()
const showAddressMenu = ref(false)
const rootRef = ref<HTMLElement | null>(null)
let timer: number | null = null

const emit = defineEmits<{
  (e: 'search', value: string): void
  (e: 'location-change', value: Address): void
}>()

// Use search store for shared search state
const searchStore = useSearchStore()
const { query: searchQuery } = storeToRefs(searchStore)

const addressStore = useAddressStore()
const { setLocation } = useLocationStore()
const addresses = computed(() => addressStore.addresses || [])

onMounted(async () => {
  if (!addressStore.addresses.length) {
    await addressStore.loadFromStorage()
  }
  if (!addressStore.addresses.length) {
    try {
      await addressStore.fetchFromApi()
    } catch {
      // keep local-only list if API is unavailable
    }
  }

  document.addEventListener('mousedown', closeOnOutsideClick)
  document.addEventListener('touchstart', closeOnOutsideClick, { passive: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', closeOnOutsideClick)
  document.removeEventListener('touchstart', closeOnOutsideClick)
})

watch(
  () => props.collapsed,
  (v) => {
    if (v) showAddressMenu.value = false
  }
)

const activeIcon = computed(() => {
  const name = String(route.name || '')
  if (name.includes('wishlist')) return 'wishlist'
  if (name.includes('account')) return 'account'
  return ''
})

async function openAddressSettings() {
  showAddressMenu.value = false

  const storedClient = await Preferences.get({
    key: 'client',
  })

  if (storedClient?.value) {
    // User logged in
    router.push({ name: 'account-address' })
  } else {
    // User logged out
    router.push({ name: 'login' })
  }
}

function toggleAddressMenu() {
  showAddressMenu.value = !showAddressMenu.value
}

function closeOnOutsideClick(e: Event) {
  const target = e.target as Node | null
  if (!target) return
  if (rootRef.value && !rootRef.value.contains(target)) {
    showAddressMenu.value = false
  }
}

function isSameAddress(addr: Address) {
  return (
    addr?.lat === props.location?.lat &&
    addr?.lng === props.location?.lng &&
    (addr?.id ? addr.id === props.location?.id : true)
  )
}

async function selectAddress(addr: Address) {
  emit('location-change', addr)
  try {
    await setLocation(addr)
  } catch (e) {
    console.error('Failed to persist selected address', e)
  }
  showAddressMenu.value = false
}

function onInput() {
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    emit('search', searchQuery.value.trim())
    // Update the store with debounced value if needed
    searchStore.setDebouncedQuery(searchQuery.value.trim())
  }, 300)
}

function clear() {
  searchStore.clearSearch()
  if (timer) window.clearTimeout(timer)
  emit('search', '')
}
</script>

<style scoped>
.topbar-shell {
  position: relative;
  z-index: 32;
  padding: 10px 16px 12px;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.address-inline {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  border-radius: 14px;
  padding: 0 8px 0 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.address-inline:hover,
.address-inline:focus-visible {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow-lg);
  outline: none;
}

.address-pin {
  width: 15px;
  height: 15px;
  color: var(--ion-color-primary);
  flex-shrink: 0;
}

.address-inline-text {
  max-width: 100%;
  color: #111827;
  font-size: 0.94rem;
  line-height: 1.2;
  font-weight: 500;
}

.address-inline .chev-icon {
  margin-left: auto;
  width: 18px;
  height: 18px;
  color: #4a5b66;
  border-radius: 999px;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  padding: 2px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  /* Added the same glassmorphism background as address bar and search box */
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.icon-btn--active {
  background: transparent;
}

.icon-btn--active .topbar-icon {
  color: var(--ion-color-primary);
  filter: drop-shadow(0 0 0.35rem color-mix(in srgb, var(--ion-color-primary) 38%, transparent));
}

.icon-btn:focus-visible {
  outline: none;
}

.icon-btn:hover,
.icon-btn:focus-visible {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow-lg);
}

.icon-btn:focus-visible .topbar-icon {
  color: var(--ion-color-primary);
}

.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  padding: 0 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.search-box:hover,
.search-box:focus-within {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow-lg);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #5b6676;
  margin-right: 8px;
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.98rem;
  color: #111827;
}

.clear-btn {
  color: #5b6676;
  font-size: 0.85rem;
  background: transparent;
  border: none;
  cursor: pointer;
}

.address-wrap {
  margin-bottom: 8px;
  max-height: 40px;
  position: relative;
  z-index: 60;
}

.address-wrap--hidden {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  overflow: hidden;
  pointer-events: none;
  margin-bottom: 0;
}

.chev-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #5b6676;
  transition: transform 0.2s ease;
}

.chev-icon--open {
  transform: rotate(180deg);
}

.address-menu {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 8px);
  z-index: 10000;
  border-radius: 16px;
  padding: 8px;
  max-height: min(46vh, 360px);
  overflow-y: auto;
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.address-menu-item {
  cursor: pointer;
  width: 100%;
  border: 1px solid var(--markit-glass-border);
  border-radius: 12px;
  text-align: left;
  padding: 10px 12px;
  margin-bottom: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
}

.address-menu-item:last-child {
  margin-bottom: 0;
}

.address-menu-item--active {
  border-color: color-mix(in srgb, var(--ion-color-primary) 45%, var(--markit-glass-border));
  background: color-mix(in srgb, var(--ion-color-primary) 14%, #ffffff);
}

.address-menu-item--manage {
  border-style: dashed;
}

.address-menu-title {
  font-size: 0.92rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--markit-text);
}

.address-menu-sub {
  font-size: 0.78rem;
  line-height: 1.2;
  color: var(--markit-text-muted);
}

.topbar-icon {
  width: 21px;
  height: 21px;
  color: #1f2937;
}

@media (max-width: 390px) {
  .search-row {
    gap: 6px;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
  }

  .topbar-icon {
    width: 20px;
    height: 20px;
  }
}
</style>