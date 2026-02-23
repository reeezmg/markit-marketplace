<template>
  <ion-page>
    <ion-content fullscreen class="login-page" :scroll-y="false">

      <!-- Background -->
      <div class="login-bg">
        <span class="orb orb-a"></span>
        <span class="orb orb-b"></span>
        <span class="grid-glow"></span>
      </div>

      <!-- LOGO INTRO OVERLAY -->
      <div
        v-if="showIntro"
        class="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        <ion-img src="/Logo.png" class="w-28 h-28 animate-logo-intro" />
      </div>

      <!-- MAIN CONTENT -->
      <div class="login-container">
        
        <!-- HEADER with back button -->
        <div class="header-section">
          <ion-button
            fill="clear"
            class="back-btn"
            @click="handleBack"
            aria-label="Go back"
          >
            <ion-icon :icon="arrowBackOutline" class="back-icon" />
          </ion-button>
        </div>

        <!-- LOGO & TEXT -->
        <div class="logo-section">
          <ion-img src="/Logo.png" class="logo-img" />
          
          <h1 class="title-text">
            One app for your local fashion store
          </h1>

          <p class="description-text">
            Discover fresh drops, track orders, and stay close to the brands you love.
          </p>
        </div>

        <!-- PROGRESS BAR -->
        <div class="progress-section">
          <div class="progress-track">
            <div
              class="progress-bar"
              :style="{ width: progressWidth }"
            />
          </div>
        </div>

        <!-- LOGIN COMPONENT - NO OUTER BOX -->
        <div v-show="showContent" class="content-section">
          <Login
            v-if="step === 'login'"
            @loginClicked="step = 'phone'"
          />

          <Transition name="slide">
            <Phone
              v-show="step === 'phone'"
              @submitClicked="handlePhoneSubmitClicked"
            />
          </Transition>

          <Transition name="slide">
            <Otp
              v-if="step === 'otp'"
              @submitClicked="handleOtpSubmitClicked"
            />
          </Transition>
        </div>

        <div id="recaptcha-container"></div>
        
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { arrowBackOutline } from 'ionicons/icons'
import { IonPage, IonContent, IonIcon, IonImg, IonButton, useIonRouter } from '@ionic/vue'
import { ref, computed, onMounted } from 'vue'
import { useIonRouter } from '@ionic/vue'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'

import { app } from '../../firebaseConfig'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

import Login from '@/components/Login/Login.vue'
import Phone from '@/components/Login/Phone.vue'
import Otp from '@/components/Login/Otp.vue'

import { login } from '@/api/auth'
import { useAddressStore } from '@/store/useAddressStore'
import { useProfileStore } from '@/store/useProfileStore'

type Step = 'login' | 'phone' | 'otp'

const router = useIonRouter()
const ionRouter = useIonRouter()

const step = ref<Step>('login')
const showIntro = ref(true)
const showContent = ref(false)

const phoneNumber = ref('')
const verificationId = ref('')

const isNative = Capacitor.getPlatform() !== 'web'
const addressStore = useAddressStore()
const profileStore = useProfileStore()

onMounted(() => {
  setTimeout(() => (showIntro.value = false), 700)
  setTimeout(() => (showContent.value = true), 900)
})

const progressWidth = computed(() =>
  step.value === 'login' ? '33%' :
  step.value === 'phone' ? '66%' : '100%'
)

function handleBack() {
  if (step.value === 'otp') step.value = 'phone'
  else if (step.value === 'phone') step.value = 'login'
  else ionRouter.back()
}

const handlePhoneSubmitClicked = async ({ phone }: { phone: string }) => {
  phoneNumber.value = phone
  try {
    if (isNative) {
      const r = await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: phone })
      verificationId.value = r.verificationId!
    } else {
      const auth = getAuth(app)
      if (!(window as any).recaptchaVerifier) {
        ;(window as any).recaptchaVerifier =
          new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const res = await signInWithPhoneNumber(auth, phone, (window as any).recaptchaVerifier)
      ;(window as any).confirmationResult = res
    }
    step.value = 'otp'
  } catch (e) {
    console.error(e)
  }
}

const handleOtpSubmitClicked = async ({ otp }: { otp: string }) => {
  try {
    if (isNative) {
      await FirebaseAuthentication.confirmVerificationCode({
        verificationId: verificationId.value,
        verificationCode: otp,
      })
    } else {
      await (window as any).confirmationResult.confirm(otp)
    }

    await login(phoneNumber.value)
    await addressStore.clear()
    await addressStore.fetchFromApi()
    await profileStore.fetchFromApi()

    router.replace('/')
  } catch (e) {
    console.error(e)
  }
}
</script>

<style scoped>
.login-page {
  --background: var(--markit-bg);
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* Background orbs */
.orb {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  opacity: 0.12;
  animation: float 10s ease-in-out infinite;
}

.orb-a {
  top: -100px;
  right: -100px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(83,129,108,0.25) 0%,
    rgba(83,129,108,0.12) 45%,
    transparent 70%
  );
}

.orb-b {
  bottom: -140px;
  left: -100px;
  width: 320px;
  height: 320px;
  animation-delay: 1.5s;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(83,129,108,0.18) 0%,
    rgba(83,129,108,0.08) 45%,
    transparent 70%
  );
}

.grid-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    rgba(255,255,255,0.5) 0%,
    rgba(255,255,255,0.12) 40%,
    rgba(255,255,255,0.02) 100%
  );
  opacity: 0.25;
}

/* Main container */
.login-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px;
  position: relative;
  z-index: 10;
}

/* Header section */
.header-section {
  position: relative;
  width: 100%;
  padding: 16px 0 4px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Back button */
.back-btn {
  width: 44px;
  height: 44px;
  --padding-start: 0;
  --padding-end: 0;
  --padding-top: 0;
  --padding-bottom: 0;
  margin: 4px 0 0 0px;
  --border-radius: 8px;
  --background: transparent;
  --background-hover: transparent;
  --background-hover-opacity: 0;
  --background-focused: transparent;
  --background-focused-opacity: 0;
  --background-activated: transparent;
  --background-activated-opacity: 0;
  --ripple-color: transparent;
  --color-hover: transparent;
  --color-focused: transparent;
  --color-activated: transparent;
  --box-shadow: none;
  outline: none;
  --outline: none;
  position: relative;
  left: -4px;
}

.back-btn::part(native) {
  background: transparent;
  color: var(--ion-color-primary);
  padding: 0;
  margin: 0;
  outline: none;
  box-shadow: none;
  --box-shadow: none;
  transition: none;
  transform: none;
}

.back-btn:hover,
.back-btn:focus,
.back-btn:active,
.back-btn:focus-visible {
  opacity: 1;
  background: transparent;
  --background: transparent;
  transform: none;
  transition: none;
  outline: none;
}

.back-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

/* Logo section */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 16px;
}

.logo-img {
  width: 90px;
  height: 90px;
  transition: all 0.5s ease;
}

.title-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--markit-text);
  margin-top: 8px;
  margin-bottom: 4px;
  max-width: 280px;
  line-height: 1.4;
}

.description-text {
  font-size: 0.85rem;
  color: var(--markit-text-muted);
  max-width: 280px;
  line-height: 1.4;
  margin: 0 auto;
}

/* Progress section */
.progress-section {
  margin-bottom: 20px;
  padding: 0 4px;
}

.progress-track {
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(
    90deg,
    var(--ion-color-primary) 0%,
    color-mix(in srgb, var(--ion-color-primary) 70%, #ffffff) 100%
  );
  transition: width 0.3s ease;
  border-radius: 999px;
}

/* Content section - NO OUTER BOX */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 0;
  width: 100%;
}

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-in {
  animation: fadeIn 0.35s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(14px); }
}

/* Small device adjustments */
@media (max-width: 360px) {
  .logo-img {
    width: 80px;
    height: 80px;
  }
  
  .title-text {
    font-size: 0.9rem;
    max-width: 260px;
  }
  
  .description-text {
    font-size: 0.8rem;
    max-width: 260px;
  }
  
  .back-btn {
    width: 40px;
    height: 40px;
    left: -2px;
  }
  
  .back-icon {
    font-size: 22px;
  }
}

/* Short screen adjustments */
@media (max-height: 700px) {
  .logo-img {
    width: 75px;
    height: 75px;
  }
  
  .title-text {
    margin-top: 4px;
    font-size: 0.9rem;
  }
  
  .description-text {
    font-size: 0.8rem;
  }
  
  .progress-section {
    margin-bottom: 12px;
  }
}

/* Ensure no scrolling */
ion-content {
  --overflow: hidden;
}
</style>