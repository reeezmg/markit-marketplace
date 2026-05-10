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
  background: var(--markit-bg, #ffffff);
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
import { Preferences } from '@capacitor/preferences'
import socket from '@/services/socket'
import { usePackStore } from '@/store/usePackStore'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { useProfileStore } from './store/useProfileStore'
import { useNearbyStore } from './store/useNearbyStore'
import { useCartStore } from './store/useCartStore'
import { useLikeStore } from './store/useLikeStore'
import { useAddressStore } from './store/useAddressStore'
import splashVideo from '@/assets/splash.mp4'

const packStore = usePackStore()
const nearbyStore = useNearbyStore()
const tryHistoryStore = useTryHistoryStore()
const cartStore = useCartStore()
const profileStore = useProfileStore()
const likeStore = useLikeStore()
const addressStore = useAddressStore()

const token = ref<string | null>(null)
const client = ref<Record<string, any> | null>(null)
const showLaunchSplash = ref(true)
const splashVideoRef = ref<HTMLVideoElement | null>(null)
const splashVideoReady = ref(false)

onMounted(() => {
  // Safety net only — kicks in if the video silently fails to start or end
  // (broken file, exotic autoplay block). Normal completion goes through @ended.
  const fallbackTimer = window.setTimeout(() => {
    hideSplash()
  }, 15000)

  nextTick(async () => {
    try {
      await splashVideoRef.value?.play()
    } catch {
      // autoplay denied — let the page through immediately
      window.clearTimeout(fallbackTimer)
      hideSplash()
    }
  })

  // Fire all bootstrap work in parallel right now so it loads behind the splash
  void bootstrap()
})

async function bootstrap() {
  const storedToken = await Preferences.get({ key: 'token' })
  const storedClient = await Preferences.get({ key: 'client' })
  token.value = storedToken.value
  client.value = storedClient.value ? JSON.parse(storedClient.value) : null

  const isAuthed = !!(token.value && client.value)

  const fetchOrFallback = (
    fetchFn: () => Promise<unknown>,
    loadFn: () => Promise<unknown>,
  ) => fetchFn().catch(() => loadFn())

  const tasks: Promise<unknown>[] = [
    nearbyStore.loadNearby(),
    cartStore.loadCart(),
    likeStore.loadLikes(),
  ]

  if (isAuthed) {
    tasks.push(
      fetchOrFallback(() => profileStore.fetchFromApi(), () => profileStore.loadFromStorage()),
      fetchOrFallback(() => packStore.fetchFromApi(), () => packStore.loadFromStorage()),
      fetchOrFallback(() => tryHistoryStore.fetchFromApi(), () => tryHistoryStore.loadFromStorage()),
      fetchOrFallback(() => addressStore.fetchFromApi(), () => addressStore.loadFromStorage()),
      fetchOrFallback(() => nearbyStore.fetchNearbyShops(), () => nearbyStore.loadNearby()),
    )
  } else {
    tasks.push(
      profileStore.loadFromStorage(),
      packStore.loadFromStorage(),
      tryHistoryStore.loadFromStorage(),
      addressStore.loadFromStorage(),
      nearbyStore.loadNearby(),
    )
  }

  await Promise.allSettled(tasks)

  if (!isAuthed) return

  socket.emit('joinClient', client.value!.id)
  socket.on('trynbuyUpdate', (data) => {
    const existing = packStore.getById(data.trynbuy_id)
    if (existing) {
      packStore.update(data.trynbuy_id, data)
    } else {
      packStore.add(data)
    }
    packStore.updateCartItemStatus(data.trynbuy_id)
  })
}

function hideSplash() {
  if (!showLaunchSplash.value) return
  showLaunchSplash.value = false
}

function onSplashPlaying() {
  splashVideoReady.value = true
}

onUnmounted(() => {
  socket.off('trynbuyUpdate')
})
</script>
