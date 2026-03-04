<template>
  <ion-app class="app-container">
    <ion-router-outlet />

    <Transition name="netflix-splash">
      <div v-if="showLaunchSplash" class="netflix-splash" aria-label="App launch splash">
        <video
          ref="splashVideoRef"
          class="splash-video"
          :class="{ 'splash-video--ready': splashVideoReady }"
          autoplay
          muted
          playsinline
          webkit-playsinline
          preload="auto"
          :controls="false"
          disablepictureinpicture
          controlslist="nodownload nofullscreen noplaybackrate noremoteplayback"
          @playing="onSplashPlaying"
          @ended="hideSplash"
          @error="hideSplash"
        >
          <source :src="splashVideo" type="video/mp4" />
        </video>
      </div>
    </Transition>
  </ion-app>
</template>



  
<style>
/* Full screen background */
.app-container {
  max-width: 460px;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  height: 100%;
  margin: 0 auto;
  background: var(--markit-bg);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  position: relative;
  overflow-x: hidden;
  overflow-y: visible;
  isolation: isolate;
  
}

.app-container ion-router-outlet {
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.netflix-splash {
  position: absolute;
  inset: 0;
  z-index: 9999;
  background: #000;
}

.splash-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms linear;
}

.splash-video--ready {
  opacity: 1;
}

.splash-video::-webkit-media-controls-start-playback-button,
.splash-video::-webkit-media-controls-overlay-play-button,
.splash-video::-webkit-media-controls,
.splash-video::-webkit-media-controls-enclosure,
.splash-video::-webkit-media-controls-panel {
  display: none !important;
  -webkit-appearance: none;
}

.netflix-splash-enter-active,
.netflix-splash-leave-active {
  transition: opacity 420ms ease;
}

.netflix-splash-enter-from,
.netflix-splash-leave-to {
  opacity: 0;
}

@keyframes splashLeft {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes splashCenter {
  0% {
    transform: skewX(-21deg) scaleY(0);
    opacity: 0;
  }
  100% {
    transform: skewX(-21deg) scaleY(1);
    opacity: 1;
  }
}

@keyframes splashRight {
  0% {
    transform: scaleY(0);
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    opacity: 1;
  }
}

@keyframes splashBrand {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

ion-modal {
  --max-width: 460px;
  --border-radius: 24px;

}

</style>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { Preferences } from '@capacitor/preferences'
import socket from '@/services/socket'
import { usePackStore } from '@/store/usePackStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { useProfileStore } from './store/useProfileStore'
import { useNearbyStore } from './store/useNearbyStore'
import { useCartStore } from './store/useCartStore'
import splashVideo from '@/assets/splash.mp4'

// store instance
const packStore = usePackStore()
const nearbyStore = useNearbyStore()
const tryHistoryStore = useTryHistoryStore()
const cartStore = useCartStore()

// reactive refs
const token = ref<string | null>(null)
const client = ref<Record<string, any> | null>(null)
const profileStore = useProfileStore()
const showLaunchSplash = ref(true)
const splashVideoRef = ref<HTMLVideoElement | null>(null)
const splashVideoReady = ref(false)

onMounted(() => {
  const fallbackTimer = window.setTimeout(() => {
    hideSplash()
  }, 5000)

  nextTick(async () => {
    try {
      await splashVideoRef.value?.play()
    } catch {
      hideSplash()
    } finally {
      if (!showLaunchSplash.value) {
        window.clearTimeout(fallbackTimer)
      }
    }
  })
})

function hideSplash() {
  if (!showLaunchSplash.value) return
  showLaunchSplash.value = false
}

function onSplashPlaying() {
  splashVideoReady.value = true
}

onIonViewWillEnter(async () => {
  await profileStore.loadFromStorage()
   await profileStore.fetchFromApi()
   await nearbyStore.loadNearby()
   await cartStore.loadCart()
})

onIonViewWillEnter(async () => {

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
