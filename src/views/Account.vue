<template>
  <ion-page>
    <Topbar/>

    <ion-content class="ion-padding">
      <div v-if="isLoggedIn" class="pb-4">
  <h2 class="text-xl font-semibold">Hi, {{ client.name }} 👋</h2>
  <p class="text-gray-500 text-sm">{{ client.phone }}</p>
</div>

<div v-else class="pb-4">
  <h2 class="text-xl font-semibold">Welcome 👋</h2>
  <p class="text-gray-500 text-sm">Please login to continue</p>
</div>


      <div class="flex-1 h-[0.5px] bg-[#097D4C] px-2"></div>

      <ion-list lines="none">

          <ion-item v-if="!isLoggedIn" button @click="goToLogin" detail>
            <ion-label>Login / Sign Up</ion-label>
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
import { onMounted, computed, watch,ref } from 'vue'
import { useProfileStore } from '@/store/useProfileStore'   // 👈 use Pinia store
import { logout } from '@/api/auth'
import { useAddressStore } from '@/store/useAddressStore'
import { Preferences } from '@capacitor/preferences'
import localforage from 'localforage'
import { clearMarkitIndexedDB } from '@/store/utils'

const router = useRouter()
const profileStore = useProfileStore()
const addressStore = useAddressStore()  // 👈 to clear user address on logout
const isLoggedIn = ref(false) 

// Expose a computed client object for template
const client = computed(() => profileStore.profile ?? { name: '', phone: '' })
// const { value: token } = await Preferences.get({ key: 'token' })

onMounted(async () => {
  // load from Preferences
  const storedToken = await Preferences.get({ key: 'token' })
  isLoggedIn.value = !!storedToken.value
})

// const isLoggedIn = computed(() => !!profileStore.profile)

watch(isLoggedIn, (newVal) => {
  console.log('isLoggedIn changed:', newVal);
});



const goToLogin = () => {
  router.push('/login')
}

const navigate = (route: string) => {
  router.push(`/account/${route}`)
}

const openWhatsApp = () => {
  const phone = '9538340789'
  const message = encodeURIComponent('Hello, I need help');
  window.open(`https://wa.me/91${phone}?text=${message}`, '_blank');
}


const logoutUser = async () => {
  try {
    await logout()
  } catch {}
  console.log('Logging out user...')
  await Preferences.remove({ key: 'token' })

  // 💣 ACTUALLY clears IndexedDB
  await clearMarkitIndexedDB()

  // Reset Pinia memory state
  profileStore.$reset()
  addressStore.$reset()

  // ⛔ Force reload to avoid stale memory
  window.location.href = '/'
}

</script>
