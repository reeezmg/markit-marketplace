<template>
  <div class="space-y-4">
    <div>
      <div class="text-lg font-semibold text-slate-900">Verify</div>
      <div class="text-sm text-slate-600">Enter the OTP sent to your phone</div>
    </div>
    <div class="mt-2 space-y-4">
      <ion-input-otp v-model="otp" size="medium" length="6">
        Didn't get a code?
        <a href="#">Resend the code</a>
      </ion-input-otp>
      <ion-button expand="block" class="mt-1 markit-cta" @click="submitOtp">
        Submit
      </ion-button>
    </div>
  </div>
</template>

<script setup>
import { IonButton, IonInputOtp } from '@ionic/vue'
import { ref } from 'vue'
const emit = defineEmits(['submitClicked'])
const otp = ref('')
const submitOtp = () => {
  emit('submitClicked', { otp: otp.value })
}
</script>
