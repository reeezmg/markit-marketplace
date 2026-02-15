<template>
  <ion-page>
    <Topbar title="Account" />

    <ion-content :fullscreen="true" class="ion-padding account-page">
      <!-- Header -->
      <div v-if="isLoggedIn" class="pb-4">
        <div class="account-hero glass-card">
          <div class="account-hero-row">
            <div class="avatar-pill">
              <span>{{ client.name?.[0] || 'U' }}</span>
            </div>
            <div class="account-hero-title">
              <h2>{{ client.name }}</h2>
              <p>{{ client.phone }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="pb-4">
        <div class="account-hero glass-card">
          <div class="account-hero-title">
            <h2>Welcome 👋</h2>
            <p>Please log in to continue</p>
          </div>
        </div>
      </div>

      <div class="my-4 h-[0.5px] bg-transparent" />

      <div class="account-section">
        <p class="section-title">Account</p>
        <div class="account-list">
          <button v-if="!isLoggedIn" class="account-row" @click="goToLogin" type="button">
            <span class="account-row-label font-bold">Login / Sign Up</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button v-if="isLoggedIn" class="account-row" @click="navigate('order-history')" type="button">
            <span class="account-row-label">Order History</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button v-if="isLoggedIn" class="account-row" @click="navigate('address/account')" type="button">
            <span class="account-row-label">Address Settings</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button class="account-row" @click="navigate('privacy-policy')" type="button">
            <span class="account-row-label">Privacy Policy</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button class="account-row" @click="navigate('terms-of-use')" type="button">
            <span class="account-row-label">Terms of Use</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button class="account-row" @click="openWhatsApp" type="button">
            <span class="account-row-label">Contact Us</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>

          <button v-if="isLoggedIn" class="account-row" @click="navigate('profile')" type="button">
            <span class="account-row-label">Your Profile</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>
        </div>
      </div>

      <div v-if="isLoggedIn" class="account-section">
        <p class="section-title">Support</p>
        <div class="account-list">
          <button class="account-row" @click="logoutUser" type="button">
            <span class="account-row-label text-red-600">Logout</span>
            <ion-icon :icon="chevronForwardOutline" class="account-row-arrow" />
          </button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import Topbar from '@/components/Topbar.vue'
import {
  IonPage, IonContent, IonIcon
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
import { chevronForwardOutline } from 'ionicons/icons'
import { useProfileStore } from '@/store/useProfileStore'
import { useAddressStore } from '@/store/useAddressStore'
import { Preferences } from '@capacitor/preferences'
import { logout } from '@/api/auth'
import { clearMarkitIndexedDB } from '@/store/utils'

const router = useRouter()
const profileStore = useProfileStore()
const addressStore = useAddressStore()

/* ✅ SINGLE SOURCE OF TRUTH */
const isLoggedIn = computed(() => !!profileStore.profile)

const client = computed(() =>
  profileStore.profile ?? { name: '', phone: '' }
)

/* ✅ HYDRATE PINIA ON PAGE LOAD */
onMounted(async () => {
  await profileStore.loadFromStorage()
})

const goToLogin = () => {
  router.push({ name: 'login' })
}

const navigate = (route: string) => {
  const accountRouteMap: Record<string, any> = {
    'order-history': { name: 'account-order-history' },
    'address/account': { name: 'account-address', params: { redirect: 'account' } },
    'privacy-policy': { name: 'account-privacy-policy' },
    'terms-of-use': { name: 'account-terms-of-use' },
    profile: { name: 'account-profile' },
  }

  router.push(accountRouteMap[route] ?? `/account/${route}`)
}

const openWhatsApp = () => {
  const phone = '9538340789'
  const message = encodeURIComponent('Hello, I need help')
  window.open(`https://wa.me/91${phone}?text=${message}`, '_blank')
}

const logoutUser = async () => {
  try {
    await logout()
  } catch {}

  await Preferences.remove({ key: 'token' })
  await clearMarkitIndexedDB()

  profileStore.$reset()
  addressStore.$reset()

  router.replace({ name: 'shops' })
}
</script>

<style scoped>
.account-page {
  --background: var(--markit-bg);

}

.account-hero {
  padding: 16px;
  border-radius: 20px;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 8px 14px rgba(20, 34, 28, 0.06);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}

.account-hero-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-pill {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(83, 129, 108, 0.12);
  color: #2d5444;
  font-weight: 700;
}

.account-hero-title h2 {
  font-size: 1.28rem;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: var(--markit-text);
}

.account-hero-title p {
  color: var(--markit-text-muted);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 2px;
}

.account-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--markit-text-muted);
  margin: 4px 8px 8px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.account-list {
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent !important;
}

.account-row {
  width: 100%;
  border: 1px solid var(--markit-glass-border);
  border-radius: 18px;
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 6px 12px rgba(20, 34, 28, 0.05);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  padding: 14px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.account-row:hover,
.account-row:focus-visible {
  border-color: color-mix(in srgb, var(--ion-color-primary) 32%, var(--markit-glass-border));
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 10px 16px rgba(20, 34, 28, 0.08);
}

.account-row-label {
  font-size: 1.05rem;
  line-height: 1.3;
  color: var(--markit-text);
}

.account-row-arrow {
  color: rgba(15, 23, 42, 0.28);
  font-size: 1.15rem;
  flex-shrink: 0;
}
</style>
