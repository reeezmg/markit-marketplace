<template>
  <ion-page>
    <!-- Content area with scroll -->
    <ion-content class="" :scrollEvents="true">
      <!-- Header -->
    <div
     class="bg-[#097D4C] text-white pt-5 pb-6 h-1/3">
  <!-- Top Row: Back Icon -->
  <div class="flex items-center px-3">
    <ion-icon :icon="arrowBackOutline" class="text-2xl"/>
  </div>

  <!-- Centered Logo and Text -->
  <div class="text-center mt-10">
    <ion-img
      src="/logo.png"
      class="w-20 h-20 mx-auto"
    />
    <div class="text-lg font-semibold mt-3 px-4">
      One app for your local fashion store
    </div>
  </div>
</div>


    <div class="ion-padding">
      <Login @loginClicked="showPhone = true"/>
      <Transition name="slide-up">
      <Phone v-if="showPhone"  @submitClicked="handlePhoneSubmitClicked" />
    </Transition>
    <Transition name="slide-up">
      <Otp v-if="showOtp" @submitClicked="handleOtpSubmitClicked" />
    </Transition>
    </div>
    </ion-content>

  </ion-page>
</template>

<script setup lang="ts">
import {
  arrowBackOutline,
} from 'ionicons/icons'
import { IonPage, IonContent, IonIcon, IonImg } from '@ionic/vue';
import Login from '@/components/Login/Login.vue';
import Phone from '@/components/Login/Phone.vue';
import Otp from '@/components/Login/Otp.vue';
import { login, generateOtp } from '@/api/auth';
import { ref, Transition } from 'vue';
import { useRouter } from 'vue-router';
import { useAddressStore } from '@/store/useAddressStore';
import { useTryHistoryStore } from '@/store/useTryHistoryStore'

const router = useRouter()

const phoneNumber = ref('')
const otp = ref('')
const showPhone = ref(false)
const showOtp = ref(false)

const handlePhoneSubmitClicked = (data: { phone: string }) => {
  phoneNumber.value = data.phone
  showOtp.value = true
  try{
    generateOtp(phoneNumber.value)
  } catch (err) {
    console.error('Login error:', err)
  }
}
const handleOtpSubmitClicked = async (data: { otp: string }) => {
  otp.value = data.otp
  try {
    await login(phoneNumber.value, otp.value)

    // hydrate store after login
    const addressStore = useAddressStore()
    const tryHistoryStore = useTryHistoryStore()
    await addressStore.fetchFromApi()
    await tryHistoryStore.fetchFromApi()

    router.push('/')
  } catch (err) {
    console.error('Login error:', err)
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



