<template>
  <ion-page>
    <Topbar/>

    <ion-content class="ion-padding">
      <div class="pb-4">
        <h2 class="text-xl font-semibold">Hi, {{ client.name }} 👋</h2>
        <p class="text-gray-500 text-sm">{{ client.phone }}</p>
      </div>

      <div class="flex-1 h-[0.5px] bg-[#097D4C] px-2"></div>

      <ion-list lines="none">
        <ion-item button @click="navigate('orderHistory')" detail>
          <ion-label>Order History</ion-label>
        </ion-item>

        <ion-item button @click="navigate('address/account')" detail>
          <ion-label>Address Settings</ion-label>
        </ion-item>

        <ion-item button @click="navigate('privacy-policy')" detail>
          <ion-label>Privacy policy</ion-label>
        </ion-item>

        <ion-item button @click="navigate('terms-of-use')" detail>
          <ion-label>Terms of use</ion-label>
        </ion-item>

        <ion-item button @click="navigate('contact-us')" detail>
          <ion-label>Contact Us</ion-label>
        </ion-item>

        <ion-item button @click="navigate('profile')" detail>
          <ion-label>Your Profile</ion-label>
        </ion-item>

        <ion-item button @click="logout" detail>
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
import { onMounted, computed } from 'vue'
import { useProfileStore } from '@/store/useProfileStore'   // 👈 use Pinia store

const router = useRouter()
const profileStore = useProfileStore()

// Expose a computed client object for template
const client = computed(() => profileStore.profile ?? { name: '', phone: '' })

onMounted(async () => {
  // 1️⃣ load cached profile immediately
  await profileStore.loadFromStorage()

  // 2️⃣ fetch latest profile from server and update cache
  await profileStore.fetchFromApi()
})

const navigate = (route: string) => {
  router.push(`/account/${route}`)
}

const logout = () => {
  console.log('Logging out…')
  // e.g. clear token/redirect
}
</script>
