<template>
    <div class="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl p-4 shadow-lg z-50 h-2/3">
        <div class="max-w-md mx-auto">
            <div class="text-lg font-semibold">Verify</div>
            <div class="text-sm text-gray-500">Enter the OTP sent to your phone</div>
        </div>
      <div class="max-w-md mx-auto mt-4">

        <!-- Unified Row -->
        <ion-input-otp v-model="otp" size="medium" length="6"> Didn't get a code? <a href="#">Resend the code</a> </ion-input-otp>

        <!-- Submit -->
        <ion-button expand="block" class="mt-6" @click="submitPhoneNumber">
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
const submitPhoneNumber = () => {
  try {
    emit('submitClicked', {
      otp: otp.value
    })
  } catch (err) {
    console.error('Emit error in Otp.vue:', err)
  }
}
</script>
