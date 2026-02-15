<template>
  <ion-page>
    <ion-content fullscreen class="login-page">

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

      <!-- HEADER -->
      <div class="relative px-5 pt-6">

        <!-- Back Button -->
        <ion-button
          fill="clear"
          class="markit-back-btn"
          @click="handleBack"
          aria-label="Go back"
        >
          <ion-icon
            :icon="arrowBackOutline"
            class="text-[20px] text-[var(--ion-color-primary)]"
          />
        </ion-button>

        <!-- Center Logo -->
        <div class="flex flex-col items-center mt-6 text-center">
          <ion-img
            src="/Logo.png"
            class="w-24 h-24 transition-all duration-500"
          />

          <h1 class="text-base font-semibold text-[var(--markit-text)] mt-4">
            One app for your local fashion store
          </h1>

          <p
            class="text-sm text-[var(--markit-text-muted)] mt-2 max-w-[18rem]"
          >
            Discover fresh drops, track orders, and stay close to the brands you love.
          </p>
        </div>
      </div>

      <!-- PROGRESS -->
      <div class="mt-6 px-6">
        <div
          class="h-[5px] rounded-full overflow-hidden"
          style="background: rgba(255,255,255,0.6);"
        >
          <div
            class="h-full progress-bar transition-all duration-300"
            :style="{ width: progressWidth }"
          />
        </div>
      </div>

      <!-- CARD -->
      <div
        v-show="showContent"
        class="mx-4 mt-6 login-card card-container fade-in"
      >

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

      <!-- FOOTER -->
      <div
        class="text-center text-xs text-[var(--markit-text-muted)] mt-8 px-6 pb-6"
      >
        By continuing, you agree to our
        <span
          class="underline cursor-pointer"
          @click="router.push({ name: 'account-terms-of-use' })"
        >
          Terms of Use
        </span>
        &
        <span
          class="underline cursor-pointer"
          @click="router.push({ name: 'account-privacy-policy' })"
        >
          Privacy Policy
        </span>
      </div>

      <div id="recaptcha-container"></div>

    </ion-content>
  </ion-page>
</template>


<script setup lang="ts">
import { arrowBackOutline } from 'ionicons/icons'
import { IonPage, IonContent, IonIcon, IonImg, IonButton, useIonRouter } from '@ionic/vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
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
  else ionRouter.back({ animated: false })
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

.login-card {
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-glass-border);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  border-radius: var(--markit-radius-xl);
  padding: 22px 20px 26px;
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    var(--markit-glass-shadow);
}

.progress-bar {
  background: linear-gradient(
    90deg,
    var(--ion-color-primary) 0%,
    color-mix(in srgb, var(--ion-color-primary) 70%, #ffffff) 100%
  );
}

.fade-in {
  animation: fadeIn 0.35s ease forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(14px); }
}
</style>

