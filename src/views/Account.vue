<template>
  <ion-page>
    <Topbar />

    <ion-content class="ion-padding">
      <!-- Header -->
      <div v-if="isLoggedIn" class="pb-4">
        <h2 class="text-xl font-semibold">Hi, {{ client.name }} 👋</h2>
        <p class="text-gray-500 text-sm">{{ client.phone }}</p>
      </div>

      <div v-else class="pb-4">
        <h2 class="text-xl font-semibold">Welcome 👋</h2>
        <p class="text-gray-500 text-sm">Please login to continue</p>
      </div>

      <div class="my-4 h-[0.5px] bg-[#097D4C]" />

      <ion-list lines="none">
        <ion-item v-if="!isLoggedIn" button @click="goToLogin" detail>
          <ion-label class="font-bold">Login / Sign Up</ion-label>
        </ion-item>

        <ion-item v-if="isLoggedIn" button @click="navigate('orderHistory')" detail>
          <ion-label>Order History</ion-label>
        </ion-item>

        <ion-item v-if="isLoggedIn" button @click="navigate('address/account')" detail>
          <ion-label>Address Settings</ion-label>
        </ion-item>

        <ion-item button @click="navigate('privacy-policy')" detail>
          <ion-label>Privacy policy</ion-label>
        </ion-item>

        <ion-item button @click="navigate('terms-of-use')" detail>
          <ion-label>Terms of use</ion-label>
        </ion-item>

        <ion-item button @click="openWhatsApp" detail>
          <ion-label>Contact Us</ion-label>
        </ion-item>

        <ion-item v-if="isLoggedIn" button @click="navigate('profile')" detail>
          <ion-label>Your Profile</ion-label>
        </ion-item>

        <ion-item
          v-if="isLoggedIn"
          button
          @click="logoutUser"
          detail
        >
          <ion-label color="danger">Logout</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import Topbar from '@/components/Topbar.vue'
import {
  IonPage, IonContent, IonList, IonItem, IonLabel
} from '@ionic/vue'
import { useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
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
  router.push('/login')
}

const navigate = (route: string) => {
  router.push(`/account/${route}`)
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

  router.replace('/')
}
</script>
