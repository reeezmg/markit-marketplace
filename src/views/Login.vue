<template>
  <ion-page>
    <ion-content>
      <!-- Header -->
      <div class="bg-[#097D4C] text-white pt-5 pb-6 h-1/3">
        <div class="flex items-center px-3">
          <ion-icon :icon="arrowBackOutline" class="text-2xl" />
        </div>

        <div class="text-center mt-10">
          <ion-img src="/logo.png" class="w-20 h-20 mx-auto" />
          <div class="text-lg font-semibold mt-3 px-4">
            One app for your local fashion store
          </div>
        </div>
      </div>

      <!-- Main Login Area -->
      <div class="ion-padding">
        <Login @loginClicked="showPhone = true" />

        <Transition name="slide-up">
          <Phone v-if="showPhone" @submitClicked="handlePhoneSubmitClicked" />
        </Transition>

        <Transition name="slide-up">
          <Otp v-if="showOtp" @submitClicked="handleOtpSubmitClicked" />
        </Transition>
      </div>

      <!-- Firebase reCAPTCHA for Web -->
      <div id="recaptcha-container"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  arrowBackOutline,
} from 'ionicons/icons'
import {
  IonPage,
  IonContent,
  IonIcon,
  IonImg
} from '@ionic/vue'
import { ref, Transition } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'

// ✅ Import Firebase app and functions separately
import { app } from '../../firebaseConfig'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

// Components
import Login from '@/components/Login/Login.vue'
import Phone from '@/components/Login/Phone.vue'
import Otp from '@/components/Login/Otp.vue'

const router = useRouter()
const showPhone = ref(false)
const showOtp = ref(false)
const phoneNumber = ref('')
const otp = ref('')
const verificationId = ref('')
const isNative = Capacitor.getPlatform() !== 'web'

// ✅ Handle phone submit
const handlePhoneSubmitClicked = async (data: { phone: string }) => {
  phoneNumber.value = data.phone

  try {
    if (isNative) {
      // ---- Native (Capacitor) ----
      const result = await FirebaseAuthentication.signInWithPhoneNumber({
        phoneNumber: phoneNumber.value
      })
      verificationId.value = result.verificationId!
      showOtp.value = true
    } else {
      // ---- Web ----
      const auth = getAuth(app)

      // Only initialize once
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          'recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified')
            }
          }
        )
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber.value,
        window.recaptchaVerifier
      )

      window.confirmationResult = confirmation
      showOtp.value = true
      console.log('OTP sent successfully')
    }
  } catch (err) {
    console.error('Error sending OTP:', err)
  }
}

// ✅ Handle OTP verify
const handleOtpSubmitClicked = async (data: { otp: string }) => {
  otp.value = data.otp
  try {
    if (isNative) {
      // ---- Native verify ----
      const result = await FirebaseAuthentication.confirmVerificationCode({
        verificationId: verificationId.value,
        verificationCode: otp.value
      })
      console.log('✅ Native Firebase login success:', result)
    } else {
      // ---- Web verify ----
      const result = await window.confirmationResult.confirm(otp.value)
      console.log('✅ Web Firebase login success:', result.user)
    }

    router.push('/')
  } catch (err) {
    console.error('❌ OTP verification failed:', err)
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
  opacity: 1;
}
</style>
