<template>
  <ion-app class="app-container">
    <ion-router-outlet />
  </ion-app>
</template>



  
<style>
/* Full screen background */
.app-container {
  max-width: 460px;
  width: 100%;
  min-height: 100vh;
  height: 100dvh;
  margin: 0 auto;
  background: var(--markit-bg);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  position: relative;
  overflow: hidden;
  isolation: isolate;
  
}

.app-container ion-router-outlet {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

ion-modal {
  --max-width: 460px;
  --border-radius: 24px;

}

</style>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { Preferences } from '@capacitor/preferences'
import socket from '@/services/socket'
import { usePackStore } from '@/store/usePackStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { useProfileStore } from './store/useProfileStore'

// store instance
const packStore = usePackStore()
const tryHistoryStore = useTryHistoryStore()

// reactive refs
const token = ref<string | null>(null)
const client = ref<Record<string, any> | null>(null)
const profileStore = useProfileStore()

onMounted(async () => {
  await profileStore.loadFromStorage()
   await profileStore.fetchFromApi()
})

onMounted(async () => {

  // load from Preferences
  const storedToken = await Preferences.get({ key: 'token' })
  const storedClient = await Preferences.get({ key: 'client' })
  token.value = storedToken.value
  client.value = storedClient.value ? JSON.parse(storedClient.value) : null

 

  if (token.value && client.value) {
    // join client room
    socket.emit('joinClient', client.value.id)

    socket.on('trynbuyUpdate', (data) => {
      const existing = packStore.getById(data.trynbuy_id)
      if (existing) {
        packStore.update(data.trynbuy_id, data)
      } else {
        packStore.add(data)
      }
      packStore.updateCartItemStatus(data.trynbuy_id)
     
    })

  } else {
    console.log('No token/client found, redirect to login maybe')
  }
})

onUnmounted(() => {
  socket.off('trynbuyUpdate')
})
</script>
